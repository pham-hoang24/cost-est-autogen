#!/usr/bin/env python3
"""
Simple HTTP Server for LLM Chatbot
Uses Python's built-in http.server for testing
"""

import http.server
import socketserver
import json
import urllib.parse
from datetime import datetime

class LLMChatbotHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            
            html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>LLM Chatbot - Simple Server</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
                    .chat-box { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 10px; min-height: 300px; background: #fafafa; }
                    .input-group { display: flex; gap: 10px; margin: 20px 0; }
                    input[type="text"] { flex: 1; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; }
                    button { padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; }
                    button:hover { background: #5a6fd8; }
                    .message { margin: 15px 0; padding: 15px; border-radius: 8px; }
                    .user { background: #e3f2fd; text-align: right; border-left: 4px solid #2196f3; }
                    .bot { background: #f1f8e9; border-left: 4px solid #4caf50; }
                    .status { text-align: center; color: #666; margin: 20px 0; }
                    .links { text-align: center; margin: 20px 0; }
                    .links a { color: #667eea; text-decoration: none; margin: 0 10px; padding: 8px 16px; border: 1px solid #667eea; border-radius: 20px; }
                    .links a:hover { background: #667eea; color: white; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🤖 LLM Chatbot</h1>
                        <p>Simple Server Version - Ready for Demo!</p>
                    </div>
                    
                    <div class="status">
                        ✅ Server is running successfully on port 8001
                    </div>
                    
                    <div class="chat-box" id="chatBox">
                        <div class="message bot">
                            <strong>AI Assistant:</strong> Hello! I'm your lightweight AI assistant running on a simple HTTP server. I can help you with various tasks. What would you like to explore today?
                        </div>
                    </div>
                    
                    <div class="input-group">
                        <input type="text" id="messageInput" placeholder="Type your message here..." onkeypress="if(event.key==='Enter') sendMessage()">
                        <button onclick="sendMessage()">Send Message</button>
                    </div>
                    
                    <div class="links">
                        <a href="/health">Health Check</a>
                        <a href="/demo">Demo Info</a>
                        <a href="/api/status">API Status</a>
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
                        } else if (lowerMsg.includes('demo') || lowerMsg.includes('presentation')) {
                            return "Perfect! This is exactly what you need for your demo tomorrow. The server is running smoothly and ready to show to your project team! 🎯";
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
            
            self.wfile.write(html.encode())
            
        elif self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "status": "healthy",
                "message": "LLM Chatbot Simple Server is operational",
                "timestamp": datetime.now().isoformat(),
                "port": 8001,
                "endpoints": ["/", "/health", "/demo", "/api/status"]
            }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        elif self.path == '/demo':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
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
                    "api_status": "/api/status"
                },
                "ready_for_demo": True
            }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        elif self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            response = {
                "server": "Simple HTTP Server",
                "status": "running",
                "port": 8001,
                "python_version": "3.x",
                "features": ["Static HTML", "JSON API", "Interactive Chat", "Demo Ready"]
            }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
            
        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'404 - Not Found')

    def log_message(self, format, *args):
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

if __name__ == "__main__":
    PORT = 8001
    
    print("🚀 Starting Simple LLM Chatbot Server...")
    print(f"📱 Access at: http://localhost:{PORT}")
    print(f"🔍 Health check: http://localhost:{PORT}/health")
    print(f"🎯 Demo page: http://localhost:{PORT}/demo")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        with socketserver.TCPServer(("", PORT), LLMChatbotHandler) as httpd:
            print(f"✅ Server started successfully on port {PORT}")
            print("🌐 Ready to accept connections...")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
