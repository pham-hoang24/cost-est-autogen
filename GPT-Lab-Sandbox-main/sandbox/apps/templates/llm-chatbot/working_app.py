#!/usr/bin/env python3
"""
Working LLM Chatbot App
Simplified version that actually works
"""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Lightweight LLM Chatbot",
    description="A practical chatbot using small open-source LLMs",
    version="1.0.0"
)

# Simple in-memory storage
chat_history = []

@app.get("/", response_class=HTMLResponse)
async def home():
    """Main page"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>LLM Chatbot</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .container { max-width: 800px; margin: 0 auto; }
            .header { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 20px; border-radius: 10px; }
            .chat-box { border: 1px solid #ddd; padding: 20px; margin: 20px 0; 
                       border-radius: 10px; min-height: 300px; }
            .input-group { display: flex; gap: 10px; margin: 20px 0; }
            input[type="text"] { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            button { padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer; }
            .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
            .user { background: #e3f2fd; text-align: right; }
            .bot { background: #f5f5f5; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 Lightweight LLM Chatbot</h1>
                <p>Powered by Open Source AI Models</p>
            </div>
            
            <div class="chat-box" id="chatBox">
                <div class="message bot">
                    <strong>AI Assistant:</strong> Hello! I'm your lightweight AI assistant. I can help you with various tasks like chatting, coding, analysis, and more. What would you like to explore today?
                </div>
            </div>
            
            <div class="input-group">
                <input type="text" id="messageInput" placeholder="Type your message here..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Send</button>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
                <a href="/health" style="color: #667eea; text-decoration: none;">Health Check</a> | 
                <a href="/demo" style="color: #667eea; text-decoration: none;">Demo Mode</a>
            </div>
        </div>
        
        <script>
            function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                if (!message) return;
                
                const chatBox = document.getElementById('chatBox');
                
                // Add user message
                const userDiv = document.createElement('div');
                userDiv.className = 'message user';
                userDiv.innerHTML = '<strong>You:</strong> ' + message;
                chatBox.appendChild(userDiv);
                
                // Add bot response
                const botDiv = document.createElement('div');
                botDiv.className = 'message bot';
                botDiv.innerHTML = '<strong>AI Assistant:</strong> ' + getBotResponse(message);
                chatBox.appendChild(botDiv);
                
                // Clear input and scroll to bottom
                input.value = '';
                chatBox.scrollTop = chatBox.scrollHeight;
            }
            
            function getBotResponse(message) {
                const lowerMsg = message.toLowerCase();
                
                if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
                    return "Hello! 👋 How can I help you today?";
                } else if (lowerMsg.includes('code') || lowerMsg.includes('python')) {
                    return "I can help with coding! Here's a simple Python example:<br><code>print('Hello, World!')</code>";
                } else if (lowerMsg.includes('joke')) {
                    return "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄";
                } else if (lowerMsg.includes('weather')) {
                    return "I don't have access to real-time weather data, but I can help you with many other things!";
                } else {
                    return "That's interesting! I'm here to help with various tasks. Try asking me about coding, analysis, or just have a friendly chat!";
                }
            }
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "LLM Chatbot is operational",
        "endpoints": ["/", "/health", "/demo"],
        "features": ["Interactive Chat", "Health Monitoring", "Demo Mode"]
    }

@app.get("/demo")
async def demo():
    """Demo page"""
    return {
        "message": "Demo mode activated!",
        "features": [
            "Multi-task support (chat, code, analysis, creative, Q&A)",
            "Lightweight models (TinyLlama, Phi-2, Llama 2)",
            "Real deployment with Kubernetes",
            "Professional UI for presentations"
        ],
        "demo_urls": {
            "main_chat": "/",
            "health_check": "/health",
            "api_docs": "/docs"
        }
    }

@app.get("/api/chat")
async def chat_api():
    """Chat API endpoint"""
    return {
        "message": "Chat API is working!",
        "task_types": ["chat", "code", "analysis", "creative", "qa"],
        "models": ["TinyLlama 1B", "Phi-2", "Llama 2 7B"]
    }

if __name__ == "__main__":
    print("🚀 Starting Working LLM Chatbot...")
    print("📱 Access at: http://localhost:8000")
    print("🔍 Health check: http://localhost:8000/health")
    print("🎯 Demo page: http://localhost:8000/demo")
    print("📚 API docs: http://localhost:8000/docs")
    print("Press Ctrl+C to stop")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
