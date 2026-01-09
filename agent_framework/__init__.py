from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from .openai import OpenAIChatClient

@dataclass
class AgentResponse:
    text: str
    metadata: Dict[str, Any] = None

class ChatAgent:
    def __init__(self, client: OpenAIChatClient, name: str, instructions: str):
        self.client = client
        self.name = name
        self.instructions = instructions
        self.history: List[Dict[str, str]] = [
            {"role": "system", "content": instructions}
        ]

    async def run(self, user_input: str) -> AgentResponse:
        # Add user input to history
        self.history.append({"role": "user", "content": user_input})
        
        # Get response from client
        response_text = await self.client.chat(self.history)
        
        # Add assistant response to history
        self.history.append({"role": "assistant", "content": response_text})
        
        return AgentResponse(text=response_text)
