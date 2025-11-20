#!/usr/bin/env python3
"""
Lightweight LLM Chatbot Template
A practical chatbot using small open-source LLMs for different tasks
"""

import os
import json
import time
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

# Import LLM components
from llm_manager import LLMManager
from task_processor import TaskProcessor

# Initialize FastAPI app
app = FastAPI(
    title="Lightweight LLM Chatbot",
    description="A practical chatbot using small open-source LLMs",
    version="1.0.0"
)

# Mount static files and templates (create directories if they don't exist)
import os
os.makedirs("static", exist_ok=True)
os.makedirs("templates", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize components
llm_manager = LLMManager()
task_processor = TaskProcessor()

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    task_type: str = "chat"
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    task_type: str
    model_used: str
    processing_time: float
    tokens_used: Optional[int] = None

class TaskRequest(BaseModel):
    task_type: str
    prompt: str
    parameters: Optional[Dict[str, Any]] = None

# Global variables
AVAILABLE_MODELS = [
    {
        "id": "tiny-llama-1b",
        "name": "TinyLlama 1B",
        "size": "1.1GB",
        "description": "Ultra-lightweight model for basic tasks",
        "download_url": "https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0"
    },
    {
        "id": "phi-2",
        "name": "Microsoft Phi-2",
        "size": "2.7GB", 
        "description": "Small but powerful model for coding and reasoning",
        "download_url": "https://huggingface.co/microsoft/phi-2"
    },
    {
        "id": "llama-2-7b-chat",
        "name": "Llama 2 7B Chat",
        "size": "13.5GB",
        "description": "Balanced performance and size for production use",
        "download_url": "https://huggingface.co/meta-llama/Llama-2-7b-chat-hf"
    }
]

TASK_TYPES = {
    "chat": {
        "name": "General Chat",
        "description": "Casual conversation and general questions",
        "icon": "💬"
    },
    "code": {
        "name": "Code Generation",
        "description": "Generate, explain, or debug code",
        "icon": "💻"
    },
    "analysis": {
        "name": "Text Analysis",
        "description": "Analyze text, summarize, or extract insights",
        "icon": "📊"
    },
    "creative": {
        "name": "Creative Writing",
        "description": "Write stories, poems, or creative content",
        "icon": "✍️"
    },
    "qa": {
        "name": "Question Answering",
        "description": "Answer questions based on context",
        "icon": "❓"
    }
}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Main chatbot interface"""
    return templates.TemplateResponse(
        "chatbot.html",
        {
            "request": request,
            "models": AVAILABLE_MODELS,
            "task_types": TASK_TYPES
        }
    )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "models_loaded": len(llm_manager.get_loaded_models()),
        "available_models": len(AVAILABLE_MODELS)
    }

@app.get("/api/models")
async def get_models():
    """Get available models"""
    return {
        "available": AVAILABLE_MODELS,
        "loaded": llm_manager.get_loaded_models()
    }

@app.post("/api/chat")
async def chat(message: ChatMessage):
    """Process chat messages with different task types"""
    try:
        start_time = time.time()
        
        # Process the task based on type
        response_text = await task_processor.process_task(
            task_type=message.task_type,
            prompt=message.message,
            context=message.context
        )
        
        processing_time = time.time() - start_time
        
        return ChatResponse(
            response=response_text,
            task_type=message.task_type,
            model_used=llm_manager.get_current_model_name(),
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tasks/{task_type}")
async def process_task(task_type: str, request: TaskRequest):
    """Process specific task types"""
    try:
        start_time = time.time()
        
        response_text = await task_processor.process_task(
            task_type=task_type,
            prompt=request.prompt,
            parameters=request.parameters
        )
        
        processing_time = time.time() - start_time
        
        return {
            "task_type": task_type,
            "response": response_text,
            "processing_time": processing_time,
            "model_used": llm_manager.get_current_model_name()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/{model_id}/load")
async def load_model(model_id: str):
    """Load a specific model"""
    try:
        result = await llm_manager.load_model(model_id)
        return {"success": True, "model": model_id, "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models/{model_id}/status")
async def get_model_status(model_id: str):
    """Get status of a specific model"""
    try:
        status = llm_manager.get_model_status(model_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/{model_id}/unload")
async def unload_model(model_id: str):
    """Unload a specific model"""
    try:
        result = await llm_manager.unload_model(model_id)
        return {"success": True, "model": model_id, "message": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tasks")
async def get_task_types():
    """Get available task types"""
    return TASK_TYPES

@app.get("/demo")
async def demo_page(request: Request):
    """Demo page for project team presentation"""
    return templates.TemplateResponse(
        "demo.html",
        {
            "request": request,
            "models": AVAILABLE_MODELS,
            "task_types": TASK_TYPES,
            "demo_examples": get_demo_examples()
        }
    )

def get_demo_examples():
    """Get demo examples for different task types"""
    return {
        "chat": [
            "Hello! How are you today?",
            "What's the weather like?",
            "Tell me a joke"
        ],
        "code": [
            "Write a Python function to calculate fibonacci numbers",
            "Explain how to use async/await in JavaScript",
            "Debug this code: for i in range(10): print(i"
        ],
        "analysis": [
            "Summarize the benefits of renewable energy",
            "Analyze the sentiment of this text: 'I love this product!'",
            "Extract key points from a research paper"
        ],
        "creative": [
            "Write a short story about a robot learning to paint",
            "Create a poem about artificial intelligence",
            "Generate a creative marketing slogan for a tech company"
        ],
        "qa": [
            "What is machine learning?",
            "How does blockchain technology work?",
            "What are the main differences between Python and JavaScript?"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
