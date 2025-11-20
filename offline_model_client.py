from __future__ import annotations

import ast
import json
from typing import Any, AsyncGenerator, Mapping, Optional, Sequence, Union, Literal

from autogen_core import CancellationToken, Component  # type: ignore
from autogen_core.models import (
    AssistantMessage,
    ChatCompletionClient,
    CreateResult,
    FunctionExecutionResultMessage,
    LLMMessage,
    ModelCapabilities,
    ModelFamily,
    ModelInfo,
    RequestUsage,
    SystemMessage,
    UserMessage,
)
from autogen_core.tools import Tool, ToolSchema  # type: ignore
from pydantic import BaseModel


class DummyModelConfig(BaseModel):
    """Configuration schema for DummyModelClient."""


class DummyModelClient(ChatCompletionClient, Component[DummyModelConfig]):
    """
    Deterministic chat client that mirrors tool output back to the user, allowing offline tests.
    """

    component_type = "model"
    component_config_schema = DummyModelConfig

    def __init__(self, *args: Any, **kwargs: Any) -> None:  # pragma: no cover - simple passthrough
        super().__init__(*args, **kwargs)

    async def create(
        self,
        messages: Sequence[LLMMessage],
        *,
        tools: Sequence[Tool | ToolSchema] = (),
        tool_choice: Tool | Literal["auto", "required", "none"] = "auto",
        json_output: Optional[bool | type[BaseModel]] = None,
        extra_create_args: Mapping[str, Any] = {},
        cancellation_token: Optional[CancellationToken] = None,
    ) -> CreateResult:
        content = self._generate_reply(messages)
        return CreateResult(
            finish_reason="stop",
            content=content,
            usage=RequestUsage(prompt_tokens=0, completion_tokens=0),
            cached=False,
        )

    def create_stream(
        self,
        messages: Sequence[LLMMessage],
        *,
        tools: Sequence[Tool | ToolSchema] = (),
        tool_choice: Tool | Literal["auto", "required", "none"] = "auto",
        json_output: Optional[bool | type[BaseModel]] = None,
        extra_create_args: Mapping[str, Any] = {},
        cancellation_token: Optional[CancellationToken] = None,
    ) -> AsyncGenerator[Union[str, CreateResult], None]:
        async def _gen() -> AsyncGenerator[Union[str, CreateResult], None]:
            yield await self.create(
                messages,
                tools=tools,
                tool_choice=tool_choice,
                json_output=json_output,
                extra_create_args=extra_create_args,
                cancellation_token=cancellation_token,
            )

        return _gen()

    async def close(self) -> None:
        return None

    def actual_usage(self) -> RequestUsage:  # pragma: no cover - deterministic
        return RequestUsage(prompt_tokens=0, completion_tokens=0)

    def total_usage(self) -> RequestUsage:  # pragma: no cover - deterministic
        return RequestUsage(prompt_tokens=0, completion_tokens=0)

    def count_tokens(self, messages: Sequence[LLMMessage], *, tools: Sequence[Tool | ToolSchema] = ()) -> int:
        return len(self._generate_reply(messages))

    def remaining_tokens(self, messages: Sequence[LLMMessage], *, tools: Sequence[Tool | ToolSchema] = ()) -> int:
        return 8192

    @property
    def capabilities(self) -> ModelCapabilities:  # type: ignore[override]
        return ModelCapabilities(vision=False, function_calling=False, json_output=False)

    @property
    def model_info(self) -> ModelInfo:  # type: ignore[override]
        return ModelInfo(
            vision=False,
            function_calling=False,
            json_output=False,
            structured_output=False,
            family=ModelFamily.UNKNOWN,
        )

    def _to_config(self) -> DummyModelConfig:
        return DummyModelConfig()

    @classmethod
    def _from_config(cls, config: DummyModelConfig) -> "DummyModelClient":
        return cls()

    def _generate_reply(self, messages: Sequence[LLMMessage]) -> str:
        for message in reversed(messages):
            if isinstance(message, FunctionExecutionResultMessage):
                response = self._extract_from_function_result(message)
                if response:
                    return response
        for message in reversed(messages):
            if isinstance(message, UserMessage):
                if isinstance(message.content, str):
                    return f"Received: {message.content}"
                return "Received your input."
        return "Ready to continue."

    def _extract_from_function_result(self, message: FunctionExecutionResultMessage) -> Optional[str]:
        for entry in message.content:
            raw = entry.content
            try:
                data = json.loads(raw)
            except Exception:
                try:
                    data = ast.literal_eval(raw)
                except Exception:
                    data = raw

            if isinstance(data, dict):
                if data.get("message"):
                    return str(data["message"])
                if data.get("next_question"):
                    return str(data["next_question"])
                if data.get("status") == "NEEDS_CONFIRMATION":
                    return "Here is the expansion draft. Reply 'approve' to proceed or provide edits."
                if data.get("status") == "OK":
                    selection = data.get("selection", {})
                    method = selection.get("primary", "unknown method")
                    return f"Selection complete. Primary method: {method}. Final estimates ready."
            elif isinstance(data, str):
                return data
        return None


