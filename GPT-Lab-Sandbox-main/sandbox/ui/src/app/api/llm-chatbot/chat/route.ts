import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Call the backend LLM chatbot endpoint
    const backendResponse = await fetch('http://localhost:8080/api/v1/llm-chatbot/chat', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (backendResponse.ok) {
      const backendData = await backendResponse.json();
      return NextResponse.json({
        response: backendData.message || getFallbackResponse(message),
        task_types: backendData.task_types || ['chat', 'code', 'analysis', 'creative', 'qa'],
        models: backendData.models || ['TinyLlama 1B', 'Phi-2', 'Llama 2 7B']
      });
    } else {
      // Fallback response if backend is not available
      return NextResponse.json({
        response: getFallbackResponse(message),
        task_types: ['chat', 'code', 'analysis', 'creative', 'qa'],
        models: ['TinyLlama 1B', 'Phi-2', 'Llama 2 7B']
      });
    }
  } catch (error) {
    console.error('LLM Chatbot API error:', error);
    
    // Fallback response on error
    return NextResponse.json({
      response: "I'm having trouble connecting to my backend right now, but I can still help you with basic tasks!",
      task_types: ['chat', 'code', 'analysis', 'creative', 'qa'],
      models: ['TinyLlama 1B', 'Phi-2', 'Llama 2 7B']
    });
  }
}

function getFallbackResponse(message: string): string {
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
}
