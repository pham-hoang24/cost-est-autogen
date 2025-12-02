"""
services/agent_factory.py
=========================

Agent creation and GroupChat configuration.
Centralizes all agent instantiation logic for better maintainability.
"""

import os
from typing import Any, Callable, Dict, List, Optional, Tuple

import autogen

from agents.conversational_agent import build_conversational_agent
from agents.interpreter_agent import build_interpreter_agent
from agents.method_selector_agent import build_method_selector_agent


class AgentFactory:
    """
    Factory for creating and configuring Autogen agents.
    Handles model tiering, agent instantiation, and GroupChat setup.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the factory with API configuration.
        
        Args:
            api_key: OpenRouter API key (defaults to env variable)
        """
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        self._cheap_config = None
        self._advanced_config = None
    
    @property
    def cheap_llm_config(self) -> Dict[str, Any]:
        """Get LLM config for cheap/fast operations (chat, routing)."""
        if self._cheap_config is None:
            cheap_model = os.environ.get("CHEAP_MODEL_NAME", "openai/gpt-4o-mini")
            self._cheap_config = {
                "config_list": [{
                    "model": cheap_model,
                    "api_key": self.api_key,
                    "base_url": "https://openrouter.ai/api/v1",
                    "api_type": "openai",
                    "price": [0.0, 0.0],  # Silence warnings
                }],
                "temperature": 0.5,
                "timeout": 60,
                "max_tokens": 1000,
                "cache_seed": 42,
            }
        return self._cheap_config
    
    @property
    def advanced_llm_config(self) -> Dict[str, Any]:
        """Get LLM config for advanced operations (estimation, complex reasoning)."""
        if self._advanced_config is None:
            advanced_model = os.environ.get("OPENROUTER_MODEL", "openai/gpt-4o")
            self._advanced_config = {
                "config_list": [{
                    "model": advanced_model,
                    "api_key": self.api_key,
                    "base_url": "https://openrouter.ai/api/v1",
                    "api_type": "openai",
                    "price": [0.01, 0.03],
                }],
                "temperature": 0.2,
                "timeout": 120,
                "max_tokens": 4000,
                "cache_seed": 42,
            }
        return self._advanced_config
    
    def create_user_proxy(self, termination_check: Optional[Callable] = None) -> autogen.UserProxyAgent:
        """
        Create the UserProxyAgent.
        
        Args:
            termination_check: Optional function to check for termination
            
        Returns:
            Configured UserProxyAgent
        """
        def default_termination_check(msg):
            content = msg.get("content", "")
            if content and "WAITING FOR USER INPUT" in content:
                return True
            return False
        
        return autogen.UserProxyAgent(
            name="User",
            human_input_mode="NEVER",
            max_consecutive_auto_reply=5,
            code_execution_config=False,
            is_termination_msg=termination_check or default_termination_check,
            llm_config=self.cheap_llm_config,
        )
    
    def create_conversational_agent(self, session_id: str) -> autogen.AssistantAgent:
        """Create the ConversationalAgent for intake."""
        return build_conversational_agent(self.cheap_llm_config, session_id=session_id)
    
    def create_interpreter_agent(self, session_id: str) -> autogen.AssistantAgent:
        """Create the InterpreterAgent for parsing."""
        return build_interpreter_agent(self.cheap_llm_config, session_id=session_id)
    
    def create_method_selector_agent(self, session_id: str) -> autogen.AssistantAgent:
        """Create the MethodSelectorAgent for method analysis."""
        return build_method_selector_agent(self.advanced_llm_config, session_id=session_id)
    
    def create_chat_agents(
        self,
        session_id: str,
        termination_check: Optional[Callable] = None
    ) -> Tuple[autogen.UserProxyAgent, List[autogen.Agent]]:
        """
        Create all agents needed for the chat workflow.
        
        Args:
            session_id: Session identifier
            termination_check: Optional termination check function
            
        Returns:
            Tuple of (user_proxy, list of all agents)
        """
        user_proxy = self.create_user_proxy(termination_check)
        conversational_agent = self.create_conversational_agent(session_id)
        interpreter_agent = self.create_interpreter_agent(session_id)
        method_selector_agent = self.create_method_selector_agent(session_id)
        
        agents_list = [
            user_proxy,
            conversational_agent,
            interpreter_agent,
            method_selector_agent,
        ]
        
        return user_proxy, agents_list
    
    def create_group_chat(
        self,
        agents: List[autogen.Agent],
        messages: List[Dict[str, Any]],
        speaker_selection: Optional[Callable] = None,
        max_round: int = 12,
    ) -> Tuple[autogen.GroupChat, autogen.GroupChatManager]:
        """
        Create GroupChat and Manager.
        
        Args:
            agents: List of agents to include
            messages: Initial message history
            speaker_selection: Custom speaker selection function
            max_round: Maximum conversation rounds
            
        Returns:
            Tuple of (GroupChat, GroupChatManager)
        """
        groupchat = autogen.GroupChat(
            agents=agents,
            messages=messages,
            max_round=max_round,
            speaker_selection_method=speaker_selection or "auto",
            allow_repeat_speaker=True,
        )
        
        manager = autogen.GroupChatManager(
            groupchat=groupchat,
            llm_config=self.cheap_llm_config,
        )
        
        return groupchat, manager
    
    def get_all_tools_map(self) -> Dict[str, Callable]:
        """
        Get the complete function map for all available tools.
        
        Returns:
            Dictionary mapping tool names to functions
        """
        from tools.orchestrator_tools import (
            start_new_project_tool,
            record_baseline_field_tool,
            update_project_baseline_tool,
            submit_user_description_tool,
            get_project_context_tool,
            draft_expansion_tool,
            confirm_expansion_tool,
            evaluate_methods_tool,
            normalize_and_infer_tool,
            generate_explanation_tool,
            validate_step1_tool,
            get_method_requirements_tool,
            register_estimate_tool,
            generate_full_report_tool,
        )
        from tools.intake_tools import intake_step
        from tools.cocomo_tools import generate_cocomo_ii_estimation
        from tools.storypoints_tools import generate_storypoints_estimation
        from tools.fpa_tools import generate_fpa_estimation
        from tools.analogous_tools import generate_analogous_estimation
        from tools.parametric_tools import generate_parametric_estimation
        from tools.bottomup_tools import generate_bottom_up_estimation
        
        return {
            # Orchestrator tools
            "start_new_project_tool": start_new_project_tool,
            "record_baseline_field_tool": record_baseline_field_tool,
            "update_project_baseline_tool": update_project_baseline_tool,
            "submit_user_description_tool": submit_user_description_tool,
            "get_project_context_tool": get_project_context_tool,
            "draft_expansion_tool": draft_expansion_tool,
            "confirm_expansion_tool": confirm_expansion_tool,
            "evaluate_methods_tool": evaluate_methods_tool,
            "normalize_and_infer_tool": normalize_and_infer_tool,
            "generate_explanation_tool": generate_explanation_tool,
            "validate_step1_tool": validate_step1_tool,
            "get_method_requirements_tool": get_method_requirements_tool,
            "register_estimate_tool": register_estimate_tool,
            "generate_full_report_tool": generate_full_report_tool,
            "intake_step": intake_step,
            # Estimation method tools
            "generate_cocomo_ii_estimation": generate_cocomo_ii_estimation,
            "generate_storypoints_estimation": generate_storypoints_estimation,
            "generate_fpa_estimation": generate_fpa_estimation,
            "generate_analogous_estimation": generate_analogous_estimation,
            "generate_parametric_estimation": generate_parametric_estimation,
            "generate_bottom_up_estimation": generate_bottom_up_estimation,
        }
    
    def register_tools_on_agents(
        self,
        agents: List[autogen.Agent],
        tools_map: Optional[Dict[str, Callable]] = None
    ) -> None:
        """
        Register tools on all agents for execution.
        
        Args:
            agents: List of agents to register tools on
            tools_map: Optional custom tools map (defaults to all tools)
        """
        tools = tools_map or self.get_all_tools_map()
        for agent in agents:
            agent.register_function(function_map=tools)


__all__ = ["AgentFactory"]

