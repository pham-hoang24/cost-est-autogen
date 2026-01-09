import os
from typing import List, Dict, Any, Optional
import openai

class OpenAIChatClient:
    def __init__(self, model: str = "gpt-4o", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or os.environ.get("OPENROUTER_API_KEY") or os.environ.get("OPENAI_API_KEY")
        self.base_url = os.environ.get("OPENAI_BASE_URL", "https://openrouter.ai/api/v1")
        
        if not self.api_key:
            print("Warning: No API key found for OpenAIChatClient")
            
        self.client = openai.AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    async def chat(self, messages: List[Dict[str, str]], temperature: float = 0.7) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error in OpenAIChatClient: {e}")
            return f"Error: {str(e)}"
