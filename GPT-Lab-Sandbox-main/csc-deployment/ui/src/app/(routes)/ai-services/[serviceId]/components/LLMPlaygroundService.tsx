'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Brain, 
  Code, 
  Image, 
  FileText, 
  Mic, 
  BarChart3, 
  Sparkles, 
  Copy, 
  Download, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Wand2,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  Bot,
  User
} from 'lucide-react';

interface GenerationResult {
  id: string;
  type: 'text' | 'code' | 'image' | 'audio' | 'analysis';
  content: string;
  timestamp: Date;
  parameters: Record<string, any>;
  quality: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  model?: string;
  tokens?: number;
}

interface LLMPlaygroundServiceProps {
  className?: string;
}

export default function LLMPlaygroundService({ className }: LLMPlaygroundServiceProps) {
  const [activeTab, setActiveTab] = useState('chat');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState('GPT-4');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [selectedStyle, setSelectedStyle] = useState('realistic');

  // Demo data for different LLM capabilities
  const demoPrompts = {
    text: [
      "Write a creative story about a robot learning to paint",
      "Explain quantum computing in simple terms",
      "Create a marketing email for a new AI product",
      "Write a poem about the future of technology"
    ],
    code: [
      "Create a Python web scraper for news articles",
      "Write a React component for a todo list",
      "Generate a machine learning model for image classification",
      "Create a REST API endpoint for user authentication"
    ],
    image: [
      "A futuristic cityscape at sunset",
      "A cute robot playing with a cat",
      "Abstract art representing artificial intelligence",
      "A minimalist logo for a tech startup"
    ],
    analysis: [
      "Analyze the sentiment of customer reviews",
      "Summarize this technical documentation",
      "Extract key insights from this data",
      "Translate this text to Spanish"
    ]
  };

  const models = [
    // Premium General Purpose LLMs
    { id: 'gpt-4', name: 'GPT-4', description: 'OpenAI\'s most capable model', color: 'blue', category: 'Premium' },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic\'s advanced reasoning model', color: 'purple', category: 'Premium' },
    { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s multimodal model', color: 'green', category: 'Premium' },
    { id: 'grok-ai', name: 'Grok AI', description: 'xAI\'s conversational model', color: 'red', category: 'Premium' },
    
    // Open Source General Purpose
    { id: 'llama-3', name: 'LLaMA 3', description: 'Meta\'s latest open model', color: 'orange', category: 'OpenSource' },
    { id: 'llama-2', name: 'LLaMA 2', description: 'Meta\'s open source model', color: 'orange', category: 'OpenSource' },
    { id: 'mistral-7b-v2', name: 'Mistral 7B v2', description: 'Mistral AI\'s efficient model', color: 'blue', category: 'OpenSource' },
    { id: 'falcon-40b', name: 'Falcon 40B', description: 'TII\'s high-performance model', color: 'purple', category: 'OpenSource' },
    { id: 'gemma-2-flash', name: 'Gemma 2.0 Flash', description: 'Google\'s fast open model', color: 'green', category: 'OpenSource' },
    { id: 'deepseek-r1', name: 'DeepSeek-R1', description: 'DeepSeek\'s reasoning model', color: 'red', category: 'OpenSource' },
    
    // Multilingual & Specialized
    { id: 'bloom-2', name: 'BLOOM 2', description: 'Multilingual open model', color: 'blue', category: 'Multilingual' },
    { id: 'chatglm', name: 'ChatGLM', description: 'Chinese conversational model', color: 'green', category: 'Multilingual' },
    { id: 'baichuan-2', name: 'Baichuan 2', description: 'Chinese language model', color: 'orange', category: 'Multilingual' },
    { id: 'jais-13b', name: 'Jais-13B', description: 'Arabic-centric model', color: 'purple', category: 'Multilingual' },
    { id: 'polylm', name: 'PolyLM', description: 'Multilingual model', color: 'blue', category: 'Multilingual' },
    
    // Code Generation Specialists
    { id: 'polycoder', name: 'PolyCoder', description: 'Code generation specialist', color: 'blue', category: 'Code' },
    { id: 'incoder', name: 'InCoder', description: 'Facebook\'s code model', color: 'purple', category: 'Code' },
    { id: 'phi-1', name: 'Phi 1', description: 'Microsoft\'s small code model', color: 'green', category: 'Code' },
    { id: 'deepseek-coder', name: 'DeepSeek-Coder', description: 'Advanced code generation', color: 'orange', category: 'Code' },
    { id: 'opencodeinterpreter', name: 'OpenCodeInterpreter', description: 'Code execution model', color: 'red', category: 'Code' },
    { id: 'yi-coder', name: 'Yi-Coder', description: '01.AI code model', color: 'blue', category: 'Code' },
    { id: 'qwen2.5-coder', name: 'Qwen2.5-Coder', description: 'Alibaba\'s code model', color: 'purple', category: 'Code' },
    { id: 'codegemma', name: 'CodeGemma', description: 'Google\'s code model', color: 'green', category: 'Code' },
    { id: 'stable-code', name: 'Stable Code', description: 'Stability AI code model', color: 'orange', category: 'Code' },
    { id: 'starcoder2', name: 'StarCoder2', description: 'BigCode\'s code model', color: 'red', category: 'Code' },
    { id: 'codellama', name: 'CodeLlama', description: 'Meta\'s code model', color: 'blue', category: 'Code' },
    
    // Research & Academic
    { id: 'gpt-j-3.5', name: 'GPT-J 3.5', description: 'EleutherAI research model', color: 'green', category: 'Research' },
    { id: 'gpt-neox-20b', name: 'GPT-NeoX-20B', description: 'Apache 2.0 research model', color: 'blue', category: 'Research' },
    { id: 'yalem-100b', name: 'YaLM-100B', description: 'Yandex large model', color: 'purple', category: 'Research' },
    { id: 'ul2', name: 'UL2/Flan-UL2', description: 'Google\'s unified model', color: 'orange', category: 'Research' },
    { id: 'cerebras-gpt', name: 'Cerebras-GPT', description: 'Cerebras research model', color: 'red', category: 'Research' },
    
    // Fine-tuned & Specialized
    { id: 'dolly-3', name: 'Dolly 3.0', description: 'Databricks instruction model', color: 'blue', category: 'FineTuned' },
    { id: 'dolly-v2', name: 'Dolly v2', description: 'MIT licensed model', color: 'green', category: 'FineTuned' },
    { id: 'stablelm', name: 'StableLM', description: 'Stability AI language model', color: 'orange', category: 'FineTuned' },
    { id: 'mpt-7b', name: 'MPT-7B', description: 'MosaicML instruction model', color: 'purple', category: 'FineTuned' },
    { id: 'redpajama', name: 'RedPajama', description: 'Open source instruction model', color: 'red', category: 'FineTuned' },
    { id: 'openllama', name: 'OpenLLaMA', description: 'Open LLaMA reproduction', color: 'blue', category: 'FineTuned' },
    { id: 'xgen-7b', name: 'XGen-7B', description: 'Salesforce instruction model', color: 'green', category: 'FineTuned' },
    { id: 'openhermes', name: 'OpenHermes', description: 'MIT licensed chat model', color: 'orange', category: 'FineTuned' },
    { id: 'vicuna', name: 'Vicuna', description: 'LLaMA-based chat model', color: 'purple', category: 'FineTuned' }
  ];

  const languages = [
    'Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Swift'
  ];

  const styles = [
    'Realistic', 'Cartoon', 'Abstract', 'Minimalist', 'Vintage', 'Futuristic'
  ];

  const simulateGeneration = async (type: string, prompt: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate generation time
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Generate demo result based on type
    const result = generateDemoResult(type, prompt);
    
    setResults(prev => [result, ...prev]);
    setIsGenerating(false);
    setGenerationProgress(0);
  };

  const generateDemoResult = (type: string, prompt: string): GenerationResult => {
    const id = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date();
    
    let content = '';
    let quality = Math.random() * 0.3 + 0.7; // 70-100% quality

    switch (type) {
      case 'text':
        content = generateTextDemo(prompt);
        break;
      case 'code':
        content = generateCodeDemo(prompt);
        break;
      case 'image':
        content = generateImageDemo(prompt);
        break;
      case 'analysis':
        content = generateAnalysisDemo(prompt);
        break;
      default:
        content = 'Generated content would appear here...';
    }

    return {
      id,
      type: type as any,
      content,
      timestamp,
      parameters: {
        model: selectedModel,
        temperature: temperature,
        maxTokens: maxTokens
      },
      quality
    };
  };

  const generateRealisticAIResponse = (prompt: string, model: string): string => {
    const responses = {
      'gpt-4': {
        'hello': `Hello! I'm GPT-4, and I'm here to help you with a wide range of tasks. I can assist with writing, coding, analysis, creative projects, and much more. What would you like to work on today?`,
        'quantum': `# Quantum Computing: The Next Frontier

Quantum computing represents a revolutionary approach to computation that leverages the principles of quantum mechanics to process information in ways that classical computers cannot.

## Key Concepts

**Qubits vs Bits**:
- Classical bits exist in states of 0 or 1
- Quantum qubits can exist in superposition of both states simultaneously
- This enables exponential computational power

**Quantum Entanglement**:
- Qubits can be entangled, creating correlations that persist regardless of distance
- This property enables quantum algorithms to solve certain problems exponentially faster

## Current Applications

- Cryptography and security
- Drug discovery and molecular simulation
- Financial modeling and optimization
- Machine learning and AI

While quantum computers are still in their early stages, they represent a fundamental shift in how we think about computation and problem-solving.`,
        'code': `I'd be happy to help you with coding! I can assist with various programming languages, debug code, explain concepts, or help you build applications. What specific programming task are you working on?`,
        'creative': `I love creative writing! I can help you with stories, poems, articles, scripts, or any other creative content. I can adapt my style to match your needs - whether you want something formal, casual, humorous, or dramatic. What kind of creative project interests you?`,
        'analysis': `I can help with various types of analysis including data analysis, text analysis, market research, or any other analytical task. I can break down complex topics, identify patterns, and provide insights. What would you like me to analyze?`,
        'default': `I understand you're asking about "${prompt}". Let me provide you with a comprehensive response based on my training data and knowledge.

This is a realistic AI response that would be generated by ${model} in a real implementation. I can help with a wide range of topics including technology, science, business, creative writing, coding, and much more.

What specific aspect would you like me to elaborate on?`
      },
      'claude-3': {
        'hello': `Hi there! I'm Claude, an AI assistant created by Anthropic. I'm designed to be helpful, harmless, and honest. I can assist with writing, analysis, coding, creative projects, and answer questions across many domains. How can I help you today?`,
        'quantum': `Quantum computing is fascinating! It's a field that's rapidly evolving and has the potential to revolutionize many industries. The key insight is that quantum computers can leverage quantum mechanical phenomena like superposition and entanglement to solve certain problems much faster than classical computers.

The most exciting applications I see are in:
- Cryptography (both breaking and creating new security protocols)
- Drug discovery and materials science
- Optimization problems in logistics and finance
- Machine learning acceleration

What specific aspect of quantum computing interests you most?`,
        'code': `I enjoy helping with programming! I can work with many languages including Python, JavaScript, TypeScript, Rust, Go, and more. I can help debug code, explain algorithms, suggest best practices, or help you architect solutions. What programming challenge are you facing?`,
        'creative': `Creative writing is one of my favorite areas to work in! I can help with fiction, poetry, screenplays, marketing copy, or any other creative text. I try to match the tone and style you're looking for while bringing fresh ideas and perspectives. What kind of creative project are you working on?`,
        'analysis': `I'm well-suited for analytical tasks! I can help with data interpretation, research synthesis, market analysis, competitive intelligence, or any other analytical work. I'm particularly good at breaking down complex information and identifying key insights. What would you like me to analyze?`,
        'default': `That's an interesting question about "${prompt}". Based on my training, I can provide insights and information on this topic.

In a real implementation, I would draw from my knowledge base to give you a thoughtful, accurate response. I'm designed to be helpful while being transparent about my limitations and uncertainties.

Is there a particular angle or aspect of this topic you'd like me to focus on?`
      },
      'gemini-pro': {
        'hello': `Hello! I'm Gemini Pro, Google's advanced AI model. I'm designed to be helpful, creative, and informative across a wide range of tasks. I can assist with writing, coding, analysis, creative projects, and answer questions on many topics. What can I help you with today?`,
        'quantum': `Quantum computing is an incredibly exciting field! Google has been at the forefront of quantum research, achieving quantum supremacy and developing practical quantum algorithms.

Key areas where quantum computing shows promise:
- Optimization problems (logistics, scheduling, resource allocation)
- Machine learning and AI acceleration
- Cryptography and cybersecurity
- Scientific simulation (chemistry, physics, materials)

Google's approach focuses on making quantum computing practical and accessible. What specific quantum computing application interests you?`,
        'code': `I can help with coding in many languages! I'm particularly good with Google technologies like TensorFlow, but I can assist with Python, JavaScript, Java, C++, and more. I can help debug, optimize, or explain code concepts. What programming task are you working on?`,
        'creative': `I love creative projects! I can help with storytelling, poetry, marketing content, or any creative writing. I can adapt my style and approach based on your needs and preferences. What kind of creative work are you interested in?`,
        'analysis': `I'm excellent at analysis and research! I can help with data analysis, market research, competitive analysis, or any analytical task. I can synthesize information from multiple sources and provide clear, actionable insights. What would you like me to analyze?`,
        'default': `I'd be happy to help with "${prompt}". As Gemini Pro, I can provide comprehensive information and assistance on a wide range of topics.

In a real implementation, I would leverage my training data and capabilities to give you accurate, helpful information. I'm designed to be both informative and engaging.

What specific aspect of this topic would you like me to explore further?`
      }
    };

    const modelResponses = responses[model as keyof typeof responses] || responses['gpt-4'];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      return modelResponses.hello;
    } else if (lowerPrompt.includes('quantum')) {
      return modelResponses.quantum;
    } else if (lowerPrompt.includes('code') || lowerPrompt.includes('programming') || lowerPrompt.includes('coding')) {
      return modelResponses.code;
    } else if (lowerPrompt.includes('creative') || lowerPrompt.includes('write') || lowerPrompt.includes('story')) {
      return modelResponses.creative;
    } else if (lowerPrompt.includes('analyze') || lowerPrompt.includes('analysis') || lowerPrompt.includes('research')) {
      return modelResponses.analysis;
    } else {
      return modelResponses.default;
    }
  };

  const generateTextDemo = (prompt: string): string => {
    return generateRealisticAIResponse(prompt, currentModel);
  };

  const simulateTyping = async (message: string, callback: (text: string) => void) => {
    let currentText = '';
    const words = message.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      callback(currentText);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
    }
  };

  const sendChatMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Generate AI response
    const aiResponse = generateRealisticAIResponse(message, currentModel);
    const tokens = Math.floor(aiResponse.length / 4); // Rough token estimation

    // Add typing AI message
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
      model: currentModel,
      tokens
    };

    setChatMessages(prev => [...prev, aiMessage]);

    // Simulate typing
    await simulateTyping(aiResponse, (text) => {
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessage.id 
            ? { ...msg, content: text, isTyping: text !== aiResponse }
            : msg
        )
      );
    });

    setIsTyping(false);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const generateCodeDemo = (prompt: string): string => {
    if (prompt.includes('scraper')) {
      return `import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

class NewsScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def scrape_articles(self, max_articles=10):
        """Scrape news articles from the website"""
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Find article elements (adjust selectors based on website)
            article_elements = soup.find_all('article', limit=max_articles)
            
            for article in article_elements:
                title_elem = article.find('h2') or article.find('h3')
                link_elem = article.find('a')
                
                if title_elem and link_elem:
                    article_data = {
                        'title': title_elem.get_text().strip(),
                        'link': link_elem.get('href', ''),
                        'scraped_at': datetime.now().isoformat()
                    }
                    articles.append(article_data)
            
            return articles
            
        except requests.RequestException as e:
            print(f"Error scraping articles: {e}")
            return []
    
    def save_to_json(self, articles, filename='articles.json'):
        """Save scraped articles to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(articles)} articles to {filename}")

# Usage example
if __name__ == "__main__":
    scraper = NewsScraper("https://example-news-site.com")
    articles = scraper.scrape_articles(max_articles=5)
    scraper.save_to_json(articles)`;
    } else {
      return `# Demo Code Generation

This is a demonstration of code generation capabilities. In a real implementation, the LLM would generate:

1. **Context-aware code** based on your specific requirements
2. **Multiple language support** (Python, JavaScript, Java, C++, etc.)
3. **Best practices** including error handling, documentation, and testing
4. **Framework-specific code** for React, Django, Flask, etc.
5. **Optimized solutions** with performance considerations

The generated code would be:
- ✅ Syntactically correct
- ✅ Following best practices
- ✅ Well-documented
- ✅ Ready to run
- ✅ Customized to your needs`;
    }
  };

  const generateImageDemo = (prompt: string): string => {
    return `🎨 **Generated Image Concept**

**Prompt**: "${prompt}"

**Visual Description**:
- A stunning futuristic cityscape with towering glass buildings
- Warm golden sunset casting long shadows
- Flying vehicles and holographic displays
- Clean, modern architecture with sustainable design elements
- Vibrant colors with excellent composition

**Technical Details**:
- Resolution: 1024x1024 pixels
- Style: Photorealistic with artistic enhancement
- Quality: High-definition with fine details
- Color Palette: Warm golds, cool blues, and vibrant accents

**Generated Elements**:
- Architectural details and textures
- Atmospheric lighting and shadows
- Environmental effects and mood
- Composition and perspective

*Note: This is a demo visualization. In a real implementation, an actual image would be generated and displayed here.*`;
  };

  const generateAnalysisDemo = (prompt: string): string => {
    if (prompt.includes('sentiment')) {
      return `📊 **Sentiment Analysis Results**

**Overall Sentiment**: Positive (78% confidence)

**Detailed Breakdown**:
- 😊 Positive: 45% of reviews
- 😐 Neutral: 33% of reviews  
- 😞 Negative: 22% of reviews

**Key Insights**:
- Customers love the user-friendly interface
- Some concerns about pricing
- High satisfaction with customer support
- Requests for more features

**Top Positive Themes**:
- "Easy to use" (mentioned 156 times)
- "Great support" (mentioned 89 times)
- "Reliable" (mentioned 67 times)

**Top Negative Themes**:
- "Too expensive" (mentioned 34 times)
- "Missing features" (mentioned 23 times)
- "Slow performance" (mentioned 18 times)

**Recommendations**:
1. Highlight ease of use in marketing
2. Address pricing concerns
3. Continue excellent support
4. Consider feature requests`;
    } else {
      return `📈 **Analysis Results**

**Input**: "${prompt}"

**Key Findings**:
- Identified 5 main themes
- Extracted 12 key insights
- Generated 3 actionable recommendations
- Confidence score: 94%

**Summary**:
This analysis demonstrates the power of AI-driven content analysis, providing deep insights and actionable recommendations based on your input data.

**Next Steps**:
1. Review the detailed findings
2. Implement recommended actions
3. Monitor results and iterate`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadResult = (result: GenerationResult) => {
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `llm-result-${result.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">LLM Playground</h1>
            <p className="text-gray-300">Test, Compare, and Explore Multi-Modal AI Capabilities</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="accent" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Multi-Modal
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Real-time
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Production Ready
          </Badge>
        </div>
      </div>

      {/* Main Interface */}
      <div className="w-full">
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'chat' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'text' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Text
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'code' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'image' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Image className="w-4 h-4" />
            Visual
          </button>
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'analysis' ? 'bg-primary text-white' : 'text-gray-300 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Analysis
          </button>
        </div>

        {/* Chat Interface Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="text-xl font-semibold text-white">AI Chat Assistant</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={currentModel}
                      onChange={(e) => setCurrentModel(e.target.value)}
                      className="px-3 py-1 border border-gray-600 rounded-md bg-gray-900 text-white text-sm"
                    >
                      <optgroup label="Premium Models">
                        {models.filter(model => model.category === 'Premium').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Open Source Models">
                        {models.filter(model => model.category === 'OpenSource').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Multilingual Models">
                        {models.filter(model => model.category === 'Multilingual').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Code Generation Models">
                        {models.filter(model => model.category === 'Code').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Research Models">
                        {models.filter(model => model.category === 'Research').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Fine-tuned Models">
                        {models.filter(model => model.category === 'FineTuned').map(model => (
                          <option key={model.id} value={model.name}>
                            {model.name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearChat}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>
                </div>
                <p className="text-white mb-4">
                  Have a conversation with {currentModel}. Ask questions, get help with coding, creative writing, analysis, or any other topic.
                </p>

                {/* Chat Messages */}
                <div className="h-96 overflow-y-auto border border-gray-600 rounded-lg bg-gray-900 p-4 mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Bot className="w-12 h-12 text-white mb-4" />
                      <h4 className="text-lg font-medium text-white mb-2">Start a conversation</h4>
                      <p className="text-gray-300 mb-4">Ask me anything! I can help with coding, writing, analysis, and more.</p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendChatMessage("Hello! How can you help me?")}
                        >
                          Say Hello
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendChatMessage("Help me write a Python function")}
                        >
                          Coding Help
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendChatMessage("Write a creative story")}
                        >
                          Creative Writing
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendChatMessage("Analyze this data")}
                        >
                          Data Analysis
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              message.role === 'user'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-800 border border-gray-600 text-white'
                            }`}
                          >
                            <div className="whitespace-pre-wrap text-sm text-white">
                              {message.content}
                              {message.isTyping && (
                                <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
                              )}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-white/70' : 'text-gray-300'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                              {message.model && ` • ${message.model}`}
                              {message.tokens && ` • ${message.tokens} tokens`}
                            </div>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendChatMessage(inputText);
                        setInputText('');
                      }
                    }}
                    placeholder="Type your message here... (Press Enter to send)"
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={() => {
                      sendChatMessage(inputText);
                      setInputText('');
                    }}
                    disabled={!inputText.trim() || isTyping}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Text Generation Tab */}
        {activeTab === 'text' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-white" />
                  <h3 className="text-xl font-semibold text-white">Text Generation & Creative Writing</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Generate creative content, stories, articles, and more using advanced language models
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="text-prompt" className="block text-sm font-medium text-white mb-2">Your Prompt</label>
                        <textarea
                          id="text-prompt"
                          placeholder="Enter your text generation prompt..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full min-h-[120px] px-3 py-2 border border-gray-600 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Model</label>
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <optgroup label="Premium Models">
                              {models.filter(model => model.category === 'Premium').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Open Source Models">
                              {models.filter(model => model.category === 'OpenSource').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Multilingual Models">
                              {models.filter(model => model.category === 'Multilingual').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Code Generation Models">
                              {models.filter(model => model.category === 'Code').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Research Models">
                              {models.filter(model => model.category === 'Research').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Fine-tuned Models">
                              {models.filter(model => model.category === 'FineTuned').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Temperature: {temperature}</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demoPrompts.text.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(prompt)}
                            className="text-xs"
                          >
                            {prompt.substring(0, 30)}...
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Generated Content</h3>
                        <Button
                          onClick={() => simulateGeneration('text', inputText)}
                          disabled={isGenerating || !inputText.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Wand2 className="w-4 h-4" />
                          )}
                          Generate
                        </Button>
                      </div>

                      {isGenerating && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-gray-300">Generating content...</span>
                          </div>
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${generationProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {results.filter(r => r.type === 'text').slice(0, 1).map(result => (
                        <div key={result.id} className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg border">
                            <div className="whitespace-pre-wrap text-sm text-white">{result.content}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Quality: {Math.round(result.quality * 100)}%</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResult(result)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {results.filter(r => r.type === 'text').length === 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg border">
                          <div className="whitespace-pre-wrap text-sm text-white">
                            This is a demo of text generation. In a real implementation, this would be generated by an actual LLM based on your prompt.
                            
The generated content would be contextually relevant, creative, and tailored to your specific request. Different models would produce different styles and approaches to the same prompt, allowing you to compare and choose the best result for your needs.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Code Generation Tab */}
        {activeTab === 'code' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-white">Code Generation & Programming</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Generate code in multiple programming languages with best practices and documentation
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="code-prompt" className="block text-sm font-medium text-white mb-2">Code Request</label>
                        <textarea
                          id="code-prompt"
                          placeholder="Describe the code you want to generate..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full min-h-[120px] px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Model</label>
                          <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <optgroup label="Premium Models">
                              {models.filter(model => model.category === 'Premium').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Open Source Models">
                              {models.filter(model => model.category === 'OpenSource').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Multilingual Models">
                              {models.filter(model => model.category === 'Multilingual').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Code Generation Models">
                              {models.filter(model => model.category === 'Code').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Research Models">
                              {models.filter(model => model.category === 'Research').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Fine-tuned Models">
                              {models.filter(model => model.category === 'FineTuned').map(model => (
                                <option key={model.id} value={model.id}>
                                  {model.name}
                                </option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Programming Language</label>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang.toLowerCase()}>
                                {lang}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Max Tokens: {maxTokens}</label>
                          <input
                            type="range"
                            min="100"
                            max="4000"
                            step="100"
                            value={maxTokens}
                            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demoPrompts.code.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(prompt)}
                            className="text-xs"
                          >
                            {prompt.substring(0, 30)}...
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Generated Code</h3>
                        <Button
                          onClick={() => simulateGeneration('code', inputText)}
                          disabled={isGenerating || !inputText.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Code className="w-4 h-4" />
                          )}
                          Generate Code
                        </Button>
                      </div>

                      {results.filter(r => r.type === 'code').slice(0, 1).map(result => (
                        <div key={result.id} className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg border">
                            <pre className="text-sm overflow-x-auto text-white">
                              <code className="text-white">{result.content}</code>
                            </pre>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Language: {selectedLanguage}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResult(result)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {results.filter(r => r.type === 'code').length === 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg border">
                          <pre className="text-sm overflow-x-auto text-white">
                            <code className="text-white"># Demo Code Generation

This is a demonstration of code generation capabilities. In a real implementation, the LLM would generate:

1. **Context-aware code** based on your specific requirements
2. **Multiple language support** (Python, JavaScript, Java, C++, etc.)
3. **Best practices** including error handling, documentation, and testing
4. **Framework-specific code** for React, Django, Flask, etc.
5. **Optimized solutions** with performance considerations

The generated code would be:
- ✅ Syntactically correct
- ✅ Following best practices
- ✅ Well-documented
- ✅ Ready to run</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Image Generation Tab */}
        {activeTab === 'image' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Image className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-white">Visual Content Generation</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Create images, diagrams, and visual content using AI-powered generation
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="image-prompt" className="block text-sm font-medium text-white mb-2">Visual Prompt</label>
                        <textarea
                          id="image-prompt"
                          placeholder="Describe the image you want to generate..."
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full min-h-[120px] px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Style</label>
                          <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            {styles.map(style => (
                              <option key={style} value={style.toLowerCase()}>
                                {style}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Quality: {Math.round(temperature * 100)}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demoPrompts.image.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(prompt)}
                            className="text-xs"
                          >
                            {prompt.substring(0, 30)}...
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Generated Visual</h3>
                        <Button
                          onClick={() => simulateGeneration('image', inputText)}
                          disabled={isGenerating || !inputText.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Image className="w-4 h-4" />
                          )}
                          Generate Image
                        </Button>
                      </div>

                      {results.filter(r => r.type === 'image').slice(0, 1).map(result => (
                        <div key={result.id} className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg border">
                            <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <Image className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                                <p className="text-sm text-gray-300">Generated Image</p>
                                <p className="text-xs text-gray-400">1024x1024 • {selectedStyle}</p>
                              </div>
                            </div>
                            <div className="mt-3 text-sm whitespace-pre-wrap text-white">{result.content}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Style: {selectedStyle}</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResult(result)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {results.filter(r => r.type === 'image').length === 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg border">
                          <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Image className="w-12 h-12 mx-auto mb-2 text-blue-500" />
                              <p className="text-sm text-gray-300">Demo Image</p>
                              <p className="text-xs text-gray-400">1024x1024 • {selectedStyle}</p>
                            </div>
                          </div>
                          <div className="mt-3 text-sm whitespace-pre-wrap text-white">
                            This is a demo of image generation. In a real implementation, an actual image would be generated based on your prompt.

The generated image would include:
- High-resolution output (1024x1024 or higher)
- Style-appropriate rendering
- Detailed visual elements
- Professional quality composition
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5" />
                  <h3 className="text-xl font-semibold text-white">Data Analysis & Insights</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Analyze text, data, and content to extract insights and generate reports
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="analysis-prompt" className="block text-sm font-medium text-white mb-2">Analysis Request</label>
                        <textarea
                          id="analysis-prompt"
                          placeholder="What would you like to analyze?"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          className="w-full min-h-[120px] px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Analysis Type</label>
                          <select className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-green-500">
                            <option value="sentiment">Sentiment Analysis</option>
                            <option value="summary">Text Summarization</option>
                            <option value="translation">Translation</option>
                            <option value="classification">Classification</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Confidence: {Math.round(temperature * 100)}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {demoPrompts.analysis.map((prompt, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => setInputText(prompt)}
                            className="text-xs"
                          >
                            {prompt.substring(0, 30)}...
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white">Analysis Results</h3>
                        <Button
                          onClick={() => simulateGeneration('analysis', inputText)}
                          disabled={isGenerating || !inputText.trim()}
                          className="flex items-center gap-2"
                        >
                          {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <BarChart3 className="w-4 h-4" />
                          )}
                          Analyze
                        </Button>
                      </div>

                      {results.filter(r => r.type === 'analysis').slice(0, 1).map(result => (
                        <div key={result.id} className="space-y-3">
                          <div className="p-4 bg-gray-800 rounded-lg border">
                            <div className="whitespace-pre-wrap text-sm text-white">{result.content}</div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Confidence: {Math.round(result.quality * 100)}%</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(result.content)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => downloadResult(result)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {results.filter(r => r.type === 'analysis').length === 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg border">
                          <div className="whitespace-pre-wrap text-sm text-white">
                            📊 **Demo Analysis Results**

**Analysis Type**: Text Analysis
**Confidence**: 85%

**Key Findings**:
- Sentiment: Positive (78% confidence)
- Key Topics: Technology, Innovation, Future
- Language Quality: High
- Readability: Good

**Detailed Breakdown**:
- Positive sentiment detected in 78% of content
- Technical terminology used appropriately
- Clear structure and organization
- Engaging and informative tone

*This is a demo analysis. In a real implementation, the LLM would provide detailed, context-aware analysis based on your specific input.*
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Generation History */}
      {results.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold text-white">Generation History</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Your recent generations and results
            </p>
            <div className="space-y-3">
              {results.slice(0, 5).map((result, index) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      {result.type === 'text' && <FileText className="w-4 h-4 text-primary" />}
                      {result.type === 'code' && <Code className="w-4 h-4 text-primary" />}
                      {result.type === 'image' && <Image className="w-4 h-4 text-primary" />}
                      {result.type === 'analysis' && <BarChart3 className="w-4 h-4 text-primary" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)} Generation
                      </p>
                      <p className="text-xs text-gray-400">
                        {result.timestamp.toLocaleTimeString()} • Quality: {Math.round(result.quality * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.content)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadResult(result)}>
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{results.length}</p>
                <p className="text-xs text-gray-400">Total Generations</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.quality, 0) / results.length * 100) : 0}%
                </p>
                <p className="text-xs text-gray-400">Avg Quality</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">2.3s</p>
                <p className="text-xs text-gray-400">Avg Response</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{models.length}</p>
                <p className="text-xs text-gray-400">Models Available</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}