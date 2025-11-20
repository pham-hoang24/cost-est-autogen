#!/usr/bin/env python3
"""
Debug LLM Chatbot App
Uses port 8001 and has better error handling
"""

import sys
import traceback

try:
    print("🔍 Importing FastAPI...")
    from fastapi import FastAPI
    print("✅ FastAPI imported successfully")
    
    print("🔍 Importing uvicorn...")
    import uvicorn
    print("✅ Uvicorn imported successfully")
    
    print("🔍 Creating FastAPI app...")
    app = FastAPI(title="Debug LLM Chatbot", version="1.0.0")
    print("✅ FastAPI app created successfully")
    
    @app.get("/")
    async def root():
        return {"message": "Debug LLM Chatbot is running! 🚀", "port": 8001}
    
    @app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "message": "Debug LLM Chatbot is operational",
            "port": 8001,
            "endpoints": ["/", "/health"]
        }
    
    print("✅ Routes defined successfully")
    
    if __name__ == "__main__":
        print("🚀 Starting Debug LLM Chatbot on port 8001...")
        print("📱 Access at: http://localhost:8001")
        print("🔍 Health check: http://localhost:8001/health")
        print("Press Ctrl+C to stop")
        print()
        
        try:
            uvicorn.run(
                app,
                host="127.0.0.1",  # Use localhost instead of 0.0.0.0
                port=8001,
                reload=False,
                log_level="debug"
            )
        except Exception as e:
            print(f"❌ Uvicorn error: {e}")
            traceback.print_exc()
            sys.exit(1)
            
except Exception as e:
    print(f"❌ Import error: {e}")
    traceback.print_exc()
    sys.exit(1)
