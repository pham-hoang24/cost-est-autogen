#!/usr/bin/env python3
"""
Minimal LLM Chatbot App
Simplified version to test basic functionality
"""

from fastapi import FastAPI
import uvicorn

# Create FastAPI app
app = FastAPI(title="LLM Chatbot", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "LLM Chatbot is running! 🚀"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "message": "LLM Chatbot is operational",
        "endpoints": ["/", "/health", "/chat"]
    }

@app.get("/chat")
async def chat():
    return {
        "message": "Chat endpoint working!",
        "task_types": ["chat", "code", "analysis", "creative", "qa"]
    }

if __name__ == "__main__":
    print("🚀 Starting Minimal LLM Chatbot...")
    print("📱 Access at: http://localhost:8000")
    print("🔍 Health check: http://localhost:8000/health")
    print("Press Ctrl+C to stop")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
