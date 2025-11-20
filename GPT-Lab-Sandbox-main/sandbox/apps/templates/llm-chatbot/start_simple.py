#!/usr/bin/env python3
"""
Simple startup script for LLM Chatbot
Avoids the reload issue that can cause hanging
"""

import uvicorn
from app import app

if __name__ == "__main__":
    print("🚀 Starting LLM Chatbot...")
    print("📱 Access at: http://localhost:8000")
    print("🎯 Demo page: http://localhost:8000/demo")
    print("🔍 Health check: http://localhost:8000/health")
    print("Press Ctrl+C to stop")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload to avoid hanging
        log_level="info"
    )
