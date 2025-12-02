"""
api/routes/chat.py
==================

Chat endpoint router.
Handles the /chat endpoint for conversational AI interactions.
"""

from fastapi import APIRouter, Depends

from api.schemas import ChatRequest, ChatResponse
from api.dependencies import get_chat_service
from services.chat_service import ChatService

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """
    Chat with the conversational agent and interpreter.
    
    If session_id exists and has complete baseline from Step 1 form,
    the chatbot will not re-ask for baseline fields.
    
    Args:
        request: ChatRequest with session_id, message, and history
        
    Returns:
        ChatResponse with response text, is_ready flag, and recommended methods
    """
    return await chat_service.process_chat(request)


__all__ = ["router"]

