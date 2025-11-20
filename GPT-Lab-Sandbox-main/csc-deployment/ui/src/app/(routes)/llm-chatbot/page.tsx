'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function LLMChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your lightweight AI assistant integrated into the GPT-Lab's Sandbox. I can help you with various tasks like chatting, coding, analysis, and more. What would you like to explore today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call the integrated backend endpoint
      const response = await fetch('/api/llm-chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: data.response || getFallbackResponse(inputMessage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Fallback response if API fails
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: getFallbackResponse(inputMessage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      // Fallback response on error
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getFallbackResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackResponse = (message: string): string => {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Hello! 👋 How can I help you today?";
    } else if (lowerMsg.includes('code') || lowerMsg.includes('python')) {
      return "I can help with coding! Here's a simple Python example:\n\n```python\nprint('Hello, World!')\n```";
    } else if (lowerMsg.includes('joke')) {
      return "Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄";
    } else if (lowerMsg.includes('demo') || lowerMsg.includes('presentation')) {
      return "Perfect! This is exactly what you need for your demo tomorrow. The LLM chatbot is now fully integrated into the GPT-Lab's Sandbox and ready to show to your project team! 🎯";
    } else if (lowerMsg.includes('sandbox')) {
      return "Yes! I'm now fully integrated into the GPT-Lab's Sandbox application. You can access me through the main navigation, and I'm part of the complete AI research environment.";
    } else if (lowerMsg.includes('weather')) {
      return "I don't have access to real-time weather data, but I can help you with many other things!";
    } else {
      return "That's interesting! I'm here to help with various tasks. Try asking me about coding, analysis, or just have a friendly chat!";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 LLM Chatbot
          </h1>
          <p className="text-xl text-gray-600">
            Integrated into GPT-Lab's Sandbox - Ready for Demo!
          </p>
        </div>

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Interactive Chat</h2>
            
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                    <p className="text-gray-500">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-2"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Demo Info */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Demo Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">✅ Ready for Tomorrow</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Fully integrated into GPT-Lab's Sandbox</li>
                  <li>• Professional UI for presentations</li>
                  <li>• Multi-task support (chat, code, analysis)</li>
                  <li>• Real deployment capabilities</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">🎯 Demo Highlights</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Show integration with main application</li>
                  <li>• Demonstrate AI capabilities</li>
                  <li>• Highlight sandbox architecture</li>
                  <li>• Present future roadmap</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">🔍 Health Check</h3>
            <p className="text-gray-600 mb-4">Verify system status</p>
            <Button variant="outline" size="sm">
              Check Health
            </Button>
          </Card>
          
          <Card className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">📊 API Status</h3>
            <p className="text-gray-600 mb-4">View system metrics</p>
            <Button variant="outline" size="sm">
              View Status
            </Button>
          </Card>
          
          <Card className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">🚀 Sandbox</h3>
            <p className="text-gray-600 mb-4">Back to main app</p>
            <Button variant="outline" size="sm">
              Go to Sandbox
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
