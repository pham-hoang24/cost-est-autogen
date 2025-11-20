#!/usr/bin/env python3
"""
LLM Manager for Lightweight Models
Handles loading, managing, and switching between different open-source LLMs
"""

import os
import json
import time
import asyncio
from typing import Dict, List, Optional, Any
from pathlib import Path
import logging

# Import model libraries
try:
    from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
    from ctransformers import AutoModelForCausalLM as CTAutoModelForCausalLM
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("Warning: Transformers not available, using fallback models")

try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("Warning: PyTorch not available")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMManager:
    """Manages different LLM models and their loading/unloading"""
    
    def __init__(self):
        self.models_dir = Path("models")
        self.models_dir.mkdir(exist_ok=True)
        
        self.loaded_models: Dict[str, Any] = {}
        self.current_model: Optional[str] = None
        self.model_configs = self._load_model_configs()
        
        # Initialize with a lightweight fallback model
        self._init_fallback_model()
    
    def _load_model_configs(self) -> Dict[str, Dict[str, Any]]:
        """Load model configurations"""
        return {
            "tiny-llama-1b": {
                "name": "TinyLlama 1B",
                "type": "transformers",
                "model_id": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "tokenizer_id": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                "max_length": 512,
                "temperature": 0.7,
                "top_p": 0.9,
                "device": "cpu",  # Can be changed to "cuda" if GPU available
                "quantization": "int8",  # Use quantization for memory efficiency
                "fallback": True
            },
            "phi-2": {
                "name": "Microsoft Phi-2",
                "type": "transformers",
                "model_id": "microsoft/phi-2",
                "tokenizer_id": "microsoft/phi-2",
                "max_length": 1024,
                "temperature": 0.7,
                "top_p": 0.9,
                "device": "cpu",
                "quantization": "int8",
                "fallback": False
            },
            "llama-2-7b-chat": {
                "name": "Llama 2 7B Chat",
                "type": "transformers",
                "model_id": "meta-llama/Llama-2-7b-chat-hf",
                "tokenizer_id": "meta-llama/Llama-2-7b-chat-hf",
                "max_length": 2048,
                "temperature": 0.7,
                "top_p": 0.9,
                "device": "cpu",
                "quantization": "int8",
                "fallback": False
            }
        }
    
    def _init_fallback_model(self):
        """Initialize a lightweight fallback model for immediate use"""
        try:
            # Create a simple rule-based fallback model
            self.fallback_model = {
                "type": "rule_based",
                "name": "Rule-Based Fallback",
                "capabilities": ["chat", "qa", "code", "analysis", "creative"]
            }
            logger.info("Fallback model initialized")
        except Exception as e:
            logger.error(f"Failed to initialize fallback model: {e}")
    
    async def load_model(self, model_id: str) -> str:
        """Load a specific model"""
        if model_id not in self.model_configs:
            raise ValueError(f"Unknown model: {model_id}")
        
        if model_id in self.loaded_models:
            logger.info(f"Model {model_id} already loaded")
            self.current_model = model_id
            return f"Model {model_id} already loaded"
        
        config = self.model_configs[model_id]
        logger.info(f"Loading model: {model_id}")
        
        try:
            if config["type"] == "transformers" and TRANSFORMERS_AVAILABLE:
                model = await self._load_transformers_model(config)
            else:
                # Fallback to rule-based model
                model = self.fallback_model
                logger.warning(f"Using fallback model for {model_id}")
            
            self.loaded_models[model_id] = model
            self.current_model = model_id
            
            logger.info(f"Successfully loaded model: {model_id}")
            return f"Model {model_id} loaded successfully"
            
        except Exception as e:
            logger.error(f"Failed to load model {model_id}: {e}")
            # Fallback to rule-based model
            self.loaded_models[model_id] = self.fallback_model
            self.current_model = model_id
            return f"Model {model_id} loaded with fallback (error: {str(e)})"
    
    async def _load_transformers_model(self, config: Dict[str, Any]) -> Any:
        """Load a transformers model"""
        model_id = config["model_id"]
        device = config["device"]
        
        # Check if model is already downloaded
        local_path = self.models_dir / model_id.split("/")[-1]
        
        if not local_path.exists():
            logger.info(f"Downloading model: {model_id}")
            # In production, you'd want to download the model here
            # For demo purposes, we'll use a smaller approach
        
        try:
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(
                model_id,
                trust_remote_code=True,
                cache_dir=str(self.models_dir)
            )
            
            # Load model with quantization for memory efficiency
            if config.get("quantization") == "int8" and TORCH_AVAILABLE:
                model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    torch_dtype=torch.int8,
                    low_cpu_mem_usage=True,
                    cache_dir=str(self.models_dir)
                )
            else:
                model = AutoModelForCausalLM.from_pretrained(
                    model_id,
                    cache_dir=str(self.models_dir)
                )
            
            # Move to device if specified
            if device == "cuda" and TORCH_AVAILABLE and torch.cuda.is_available():
                model = model.cuda()
            
            return {
                "model": model,
                "tokenizer": tokenizer,
                "config": config,
                "type": "transformers"
            }
            
        except Exception as e:
            logger.error(f"Failed to load transformers model: {e}")
            raise
    
    async def unload_model(self, model_id: str) -> str:
        """Unload a specific model"""
        if model_id not in self.loaded_models:
            return f"Model {model_id} not loaded"
        
        try:
            model_data = self.loaded_models[model_id]
            
            # Clean up model resources
            if model_data["type"] == "transformers":
                if "model" in model_data:
                    del model_data["model"]
                if "tokenizer" in model_data:
                    del model_data["tokenizer"]
            
            del self.loaded_models[model_id]
            
            if self.current_model == model_id:
                self.current_model = None
                # Switch to another loaded model or fallback
                if self.loaded_models:
                    self.current_model = list(self.loaded_models.keys())[0]
                else:
                    self.current_model = "fallback"
            
            logger.info(f"Unloaded model: {model_id}")
            return f"Model {model_id} unloaded successfully"
            
        except Exception as e:
            logger.error(f"Failed to unload model {model_id}: {e}")
            return f"Failed to unload model {model_id}: {str(e)}"
    
    def get_current_model_name(self) -> str:
        """Get the name of the currently loaded model"""
        if self.current_model and self.current_model in self.loaded_models:
            model_data = self.loaded_models[self.current_model]
            if model_data["type"] == "transformers":
                return model_data["config"]["name"]
            else:
                return model_data["name"]
        return "Fallback Model"
    
    def get_loaded_models(self) -> List[str]:
        """Get list of currently loaded models"""
        return list(self.loaded_models.keys())
    
    def get_model_status(self, model_id: str) -> Dict[str, Any]:
        """Get status of a specific model"""
        if model_id not in self.model_configs:
            return {"error": "Unknown model"}
        
        config = self.model_configs[model_id]
        is_loaded = model_id in self.loaded_models
        is_current = self.current_model == model_id
        
        return {
            "model_id": model_id,
            "name": config["name"],
            "loaded": is_loaded,
            "current": is_current,
            "type": config["type"],
            "device": config.get("device", "cpu"),
            "quantization": config.get("quantization", "none")
        }
    
    async def generate_text(self, prompt: str, max_length: int = 100, **kwargs) -> str:
        """Generate text using the current model"""
        if not self.current_model or self.current_model not in self.loaded_models:
            # Use fallback model
            return self._fallback_generate(prompt, max_length)
        
        model_data = self.loaded_models[self.current_model]
        
        try:
            if model_data["type"] == "transformers":
                return await self._generate_with_transformers(model_data, prompt, max_length, **kwargs)
            else:
                return self._fallback_generate(prompt, max_length)
                
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            return self._fallback_generate(prompt, max_length)
    
    async def _generate_with_transformers(self, model_data: Dict[str, Any], prompt: str, max_length: int, **kwargs) -> str:
        """Generate text using transformers model"""
        model = model_data["model"]
        tokenizer = model_data["tokenizer"]
        config = model_data["config"]
        
        # Prepare input
        inputs = tokenizer.encode(prompt, return_tensors="pt")
        
        # Move to device if needed
        if config.get("device") == "cuda" and TORCH_AVAILABLE and torch.cuda.is_available():
            inputs = inputs.cuda()
        
        # Generate
        with torch.no_grad():
            outputs = model.generate(
                inputs,
                max_length=inputs.shape[1] + max_length,
                temperature=kwargs.get("temperature", config.get("temperature", 0.7)),
                top_p=kwargs.get("top_p", config.get("top_p", 0.9)),
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        # Decode output
        generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Remove the input prompt from the output
        response = generated_text[len(prompt):].strip()
        
        return response if response else "I'm sorry, I couldn't generate a response."
    
    def _fallback_generate(self, prompt: str, max_length: int) -> str:
        """Generate text using fallback rule-based model"""
        # Simple rule-based responses for demo purposes
        prompt_lower = prompt.lower()
        
        if "hello" in prompt_lower or "hi" in prompt_lower:
            return "Hello! I'm a lightweight AI assistant. I can help you with various tasks like chatting, coding, analysis, and more!"
        
        elif "code" in prompt_lower or "python" in prompt_lower:
            return "I can help you with coding! I can generate code, explain concepts, and help debug issues. What would you like to work on?"
        
        elif "joke" in prompt_lower:
            return "Why don't scientists trust atoms? Because they make up everything! 😄"
        
        elif "weather" in prompt_lower:
            return "I'm sorry, I don't have access to real-time weather data. You might want to check a weather app or website for current conditions."
        
        elif "machine learning" in prompt_lower or "ai" in prompt_lower:
            return "Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed. It's fascinating technology!"
        
        else:
            return "That's an interesting question! I'm a lightweight AI model designed to help with various tasks. I can assist with coding, analysis, creative writing, and general questions. What would you like to explore?"
    
    def get_model_info(self, model_id: str) -> Dict[str, Any]:
        """Get detailed information about a model"""
        if model_id not in self.model_configs:
            return {"error": "Unknown model"}
        
        config = self.model_configs[model_id]
        status = self.get_model_status(model_id)
        
        return {
            **config,
            **status,
            "memory_usage": self._estimate_memory_usage(config),
            "download_size": self._estimate_download_size(config),
            "size": self._estimate_download_size(config)  # Add size for compatibility
        }
    
    def _estimate_memory_usage(self, config: Dict[str, Any]) -> str:
        """Estimate memory usage for a model"""
        # Rough estimates based on model size
        if "1b" in config["name"].lower():
            return "~2GB RAM"
        elif "7b" in config["name"].lower():
            return "~8GB RAM"
        elif "phi-2" in config["name"].lower():
            return "~4GB RAM"
        else:
            return "~2-8GB RAM"
    
    def _estimate_download_size(self, config: Dict[str, Any]) -> str:
        """Estimate download size for a model"""
        if "1b" in config["name"].lower():
            return "~1.1GB"
        elif "7b" in config["name"].lower():
            return "~13.5GB"
        elif "phi-2" in config["name"].lower():
            return "~2.7GB"
        else:
            return "~1-15GB"
