'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  Clock,
  CheckCircle,
  Sparkles,
  Shield,
  Brain,
  Globe,
  HelpCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface ChatbotProps {
  position?: 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
}

export default function DemoChatbot({ position = 'bottom-right', theme = 'light' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo responses for common questions
  const demoResponses: { [key: string]: string } = {
    'hello': 'Hello! Welcome to GPT-Lab’s Sandbox. I\'m here to help you learn about our EU AI Act compliant research collaboration platform. How can I assist you today?',
    'hi': 'Hi there! I\'m the GPT-Lab’s Sandbox assistant. Feel free to ask me about our platform, pricing, compliance features, or anything else!',
    'pricing': 'Our platform offers three tiers: Starter (for individual researchers), Professional (for research teams), and Enterprise (for large institutions). All plans include 14-day free trials and full EU compliance. Would you like me to connect you with our sales team for detailed pricing?',
    'plans': 'We have three subscription plans:\n\n**Starter Plan**: Perfect for individual researchers\n• 3 research projects\n• 5 team members per project\n• EU GDPR compliance\n\n**Professional**: Advanced features for institutions\n• 10 research projects\n• AI services platform\n• Cross-border data sharing\n\n**Enterprise**: Custom solutions for large organizations\n• Unlimited projects\n• Custom compliance frameworks\n• Dedicated support\n\nWould you like to start a free trial?',
    'compliance': 'GPT-Lab’s Sandbox is fully compliant with:\n\n**EU AI Act (2024/1689)**: AI system classification, risk assessment, human oversight\n**GDPR**: Data subject rights, consent management, breach notification\n**Research Exemption (Article 89)**: Special provisions for scientific research\n**Cross-border Transfers**: Standard Contractual Clauses (SCCs)\n\nAll compliance features are built-in and automated!',
    'ai act': 'The EU AI Act is Europe\'s comprehensive AI regulation. Our platform helps you comply by:\n\n• Automatic AI system risk classification\n• Built-in human oversight controls\n• Transparency and explainability features\n• Technical documentation management\n• Compliance monitoring and reporting\n\nWe handle the complexity so you can focus on research!',
    'gdpr': 'GDPR compliance is built into every feature:\n\n**Data Subject Rights**: Access, rectification, erasure, portability\n**Consent Management**: Granular consent tracking and withdrawal\n**Data Minimization**: Only collect and process necessary data\n**Breach Notification**: Automated 72-hour reporting\n**Privacy by Design**: Security and privacy built-in from the start\n\nPlus special research exemption support under Article 89!',
    'features': 'GPT-Lab’s Sandbox includes:\n\n**Research Project Management**: Organize projects, invite collaborators\n**AI Services Platform**: Deploy ML models with EU AI Act compliance\n**Advanced Data Catalog**: Discover, manage, and share research data\n**Security & Compliance**: Built-in GDPR, EU AI Act, and audit tools\n**Cross-border Collaboration**: Secure international research partnerships\n\nWhat specific feature interests you most?',
    'demo': 'I\'d love to show you around! Here are some things you can try:\n\n**Explore the Platform**: Click "Explore Features" to see our capabilities\n**View Pricing**: Check out our subscription tiers\n**Read Documentation**: Comprehensive guides and API docs\n**Learn About Compliance**: See how we handle EU regulations\n\nWould you like to start a free trial or schedule a personalized demo?',
    'trial': 'Great choice! Our 14-day free trial includes:\n\n• Full access to Starter plan features\n• No credit card required\n• Cancel anytime\n• Personal onboarding session\n• Full compliance features\n\nClick "Start Free Trial" on the homepage to get started, or I can connect you with our team for a guided setup!',
    'help': 'I\'m here to help! You can ask me about:\n\n**Platform Overview**: What GPT-Lab’s Sandbox does\n**Pricing & Plans**: Subscription tiers and features\n**Compliance**: GDPR, EU AI Act, research exemptions\n**Research Features**: Project management, collaboration tools\n**AI Services**: Machine learning and analytics\n**Security**: Data protection and privacy\n\nWhat would you like to know more about?',
    'contact': 'Here are the best ways to reach our team:\n\n**General Inquiries**: hello@sw4e.org\n**Sales**: sales@sw4e.org\n**Privacy & Compliance**: privacy@sw4e.org\n**Technical Support**: support@sw4e.org\n\n**Phone**: +32 2 XXX XXXX (EU business hours)\n**Live Chat**: Available 24/7 (that\'s me!)\n\nWould you like me to connect you with a specific team member?',
    'default': 'I\'m here to help you learn about GPT-Lab’s Sandbox! You can ask me about:\n\n• Platform features and capabilities\n• Pricing and subscription plans\n• EU compliance (GDPR, AI Act)\n• Research collaboration tools\n• Getting started with a free trial\n\nWhat would you like to know?'
  };

  const quickSuggestions = [
    { text: 'What is GPT-Lab’s Sandbox?', key: 'features' },
    { text: 'Show me pricing plans', key: 'plans' },
    { text: 'How does EU compliance work?', key: 'compliance' },
    { text: 'Start free trial', key: 'trial' }
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: 'Hello! Welcome to GPT-Lab’s Sandbox. I\'m your AI assistant, here to help you learn about our EU AI Act compliant research platform. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateTyping = (response: string) => {
    setIsTyping(true);
    
    // Simulate realistic typing delay based on message length
    const typingDelay = Math.min(Math.max(response.length * 30, 1000), 3000);
    
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }, typingDelay);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, response] of Object.entries(demoResponses)) {
      if (key !== 'default' && input.includes(key)) {
        return response;
      }
    }
    
    // Check for common variations
    if (input.includes('what') && (input.includes('is') || input.includes('does'))) {
      return demoResponses.features;
    }
    if (input.includes('how') && input.includes('much')) {
      return demoResponses.pricing;
    }
    if (input.includes('free') && input.includes('trial')) {
      return demoResponses.trial;
    }
    if (input.includes('start') || input.includes('begin') || input.includes('get started')) {
      return demoResponses.trial;
    }
    if (input.includes('eu') || input.includes('europe') || input.includes('regulation')) {
      return demoResponses.compliance;
    }
    
    return demoResponses.default;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const response = getBotResponse(inputValue);
    setInputValue('');
    
    simulateTyping(response);
  };

  const handleQuickSuggestion = (suggestionKey: string) => {
    const response = demoResponses[suggestionKey] || demoResponses.default;
    simulateTyping(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <div className={`fixed ${position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'} z-[9999]`}>
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-2xl relative ring-4 ring-blue-200"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${position === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'} z-[9999]`}>
          <Card className={`w-96 h-[500px] shadow-2xl border-2 border-white bg-white overflow-hidden ${
            isMinimized ? 'h-16' : 'h-[500px]'
          } transition-all duration-300 ring-4 ring-blue-100`}>
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between border-b border-blue-500 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-white">GPT-Lab's Assistant</h3>
                  <div className="flex items-center gap-1 text-xs text-blue-100">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Online • Typically replies in minutes</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto h-80 bg-white">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`max-w-[280px] ${message.type === 'user' ? 'order-first' : ''}`}>
                        <div className={`p-3 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-blue-600 text-white ml-auto' 
                            : 'bg-gray-100 border border-gray-200 text-gray-800'
                        }`}>
                          <div className="text-sm whitespace-pre-line">{message.content}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(message.timestamp)}
                          {message.type === 'user' && <CheckCircle className="w-3 h-3 text-green-500" />}
                        </div>
                      </div>
                      
                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 border border-gray-200 p-3 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 1 && !isTyping && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm font-medium text-gray-800 mb-3">Quick questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          size="sm"
                          onClick={() => handleQuickSuggestion(suggestion.key)}
                          className="text-xs h-8 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 shadow-sm transition-colors"
                        >
                          {suggestion.text}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask me anything about GPT-Lab’s Sandbox..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white shadow-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-500" />
                      <span>Powered by GPT-Lab’s AI</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span>GDPR Safe</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span>EU Hosted</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
