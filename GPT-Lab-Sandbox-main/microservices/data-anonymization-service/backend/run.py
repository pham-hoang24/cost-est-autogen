#!/usr/bin/env python3
"""
Startup script for Data Anonymization Service
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "4002"))
    log_level = os.getenv("LOG_LEVEL", "info")
    
    print("🚀 Starting Data Anonymization Service...")
    print(f"📍 Service will be available at: http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print(f"🔍 Health Check: http://{host}:{port}/api/v1/health")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=False,
        log_level=log_level
    )
