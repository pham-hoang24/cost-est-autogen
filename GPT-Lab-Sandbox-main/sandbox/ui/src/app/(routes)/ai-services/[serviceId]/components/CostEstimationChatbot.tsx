'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  MessageSquare,
  Target,
  Code,
  Users,
  BarChart3,
  Layers,
  Brain,
  Zap,
  CheckCircle
} from 'lucide-react';

interface MethodCard {
  id: string;
  name: string;
  description: string;
  category: string;
  accuracy: string;
  complexity: string;
  cost: string;
  icon: any;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'method-recommendation';
  content: string;
  timestamp: Date;
  methodCards?: MethodCard[];
  recommendedMethod?: MethodCard;
  hybridOption?: boolean;
}

interface CostEstimationChatbotProps {
  onUpdateBasics?: (field: string, value: any) => void;
  onMethodSelected?: (methodIds: string[]) => void;
  onEstimationReady?: (ready: boolean) => void;
  className?: string;
}

export default function CostEstimationChatbot({ onUpdateBasics, onMethodSelected, onEstimationReady, className = '' }: CostEstimationChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const methodsDatabase: MethodCard[] = [
    {
      id: 'cocomo',
      name: 'COCOMO II',
      description: 'Industry-standard software cost estimation model',
      category: 'Software Development',
      accuracy: '85-95%',
      complexity: 'High',
      cost: '$0.25/estimation',
      icon: Code
    },
    {
      id: 'function-points',
      name: 'Function Point Analysis',
      description: 'ISO/IEC 14143 standard for measuring software functional size',
      category: 'Software Metrics',
      accuracy: '80-90%',
      complexity: 'Medium',
      cost: '$0.20/estimation',
      icon: Target
    },
    {
      id: 'story-points',
      name: 'Story Points & Velocity',
      description: 'Agile methodology for estimating user stories',
      category: 'Agile Development',
      accuracy: '70-85%',
      complexity: 'Low',
      cost: '$0.15/estimation',
      icon: Users
    },
    {
      id: 'parametric',
      name: 'Parametric Estimation',
      description: 'Statistical models based on historical data',
      category: 'Statistical Analysis',
      accuracy: '75-90%',
      complexity: 'Medium',
      cost: '$0.30/estimation',
      icon: BarChart3
    },
    {
      id: 'bottom-up',
      name: 'Bottom-Up Estimation',
      description: 'Detailed estimation by breaking down work',
      category: 'Detailed Planning',
      accuracy: '90-95%',
      complexity: 'Very High',
      cost: '$0.40/estimation',
      icon: Layers
    },
    {
      id: 'analogous',
      name: 'Analogous Estimation',
      description: 'Based on similar past projects',
      category: 'Expert Judgment',
      accuracy: '60-80%',
      complexity: 'Low',
      cost: '$0.10/estimation',
      icon: Brain
    }
  ];

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: "Hello! I'm the Cost Estimation Assistant. I can help you define your project requirements and recommend the best estimation methodology. What kind of project are you planning?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputValue.trim() && selectedMethods.length === 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue || 'Selected methods for estimation',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Check if user is confirming method selection
    const isMethodConfirmation = selectedMethods.length > 0 && !inputValue.trim();
    
    if (isMethodConfirmation) {
      // Simulate backend validation check
      setTimeout(() => {
        const validationMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Perfect! I have sufficient information to generate a cost estimation. You can now proceed with the estimation.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, validationMsg]);
        setIsTyping(false);
        
        // Notify parent that estimation can be generated
        if (onEstimationReady) {
          onEstimationReady(true);
        }
      }, 1000);
      return;
    }

    setTimeout(() => {
      const lowerInput = userMsg.content.toLowerCase();
      let responseText = "I see. Could you tell me more about the complexity and the expected duration?";
      let showMethodRecommendation = false;
      
      if (lowerInput.includes('web') || lowerInput.includes('app') || lowerInput.includes('software')) {
        responseText = "A software project! Based on your requirements, let me recommend the best estimation methodologies for you:";
        showMethodRecommendation = true;
        if (onUpdateBasics) onUpdateBasics('projectType', 'web');
      } else if (lowerInput.includes('mobile')) {
        responseText = "A mobile application! Here are my recommended estimation methods for mobile projects:";
        showMethodRecommendation = true;
        if (onUpdateBasics) onUpdateBasics('projectType', 'mobile');
      } else if (lowerInput.includes('complex') || lowerInput.includes('enterprise')) {
        responseText = "A complex project that requires detailed analysis. Here are the most suitable estimation methodologies:";
        showMethodRecommendation = true;
        if (onUpdateBasics) onUpdateBasics('complexity', 'complex');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      if (showMethodRecommendation) {
        setTimeout(() => {
          const methodRecommendationMsg: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'method-recommendation',
            content: '',
            timestamp: new Date(),
            recommendedMethod: methodsDatabase[0], // COCOMO
            methodCards: methodsDatabase.slice(1), // Other methods
            hybridOption: true
          };
          setMessages(prev => [...prev, methodRecommendationMsg]);
        }, 500);
      }
    }, 1500);
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethods(prev => {
      const newSelection = prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId];
      
      if (onMethodSelected) {
        onMethodSelected(newSelection);
      }
      return newSelection;
    });
  };

  const handleHybridSelect = () => {
    setSelectedMethods(prev => {
      const isCurrentlySelected = prev.includes('hybrid');
      const newSelection = isCurrentlySelected ? [] : ['hybrid'];
      
      if (onMethodSelected) {
        onMethodSelected(newSelection);
      }
      return newSelection;
    });
  };

  const renderMethodCard = (method: MethodCard, isRecommended: boolean = false) => {
    const IconComponent = method.icon;
    const isSelected = selectedMethods.includes(method.id);
    
    return (
      <div
        key={method.id}
        onClick={() => handleMethodSelect(method.id)}
        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500'
        } ${isRecommended ? 'ring-2 ring-green-500/50' : ''}`}
      >
        {isRecommended && (
          <div className="flex items-center gap-1 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs text-green-500 font-semibold">Recommended</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <IconComponent className="w-5 h-5 text-blue-400" />
          <h5 className="font-semibold text-white text-sm">{method.name}</h5>
        </div>
        <p className="text-xs text-gray-400 mb-2">{method.description}</p>
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Accuracy:</span>
            <span className="text-green-400 font-medium">{method.accuracy}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Complexity:</span>
            <span className="text-white">{method.complexity}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`flex flex-col h-[700px] bg-gray-900 border-gray-800 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-gray-800/50">
        <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-white flex items-center gap-2">
            Estimation Assistant
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </h3>
          <p className="text-xs text-gray-400">AI-powered methodology recommendations</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.type === 'method-recommendation' ? (
              <div className="space-y-4">
                {/* Recommended Method Section */}
                {msg.recommendedMethod && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">✨ Recommended Method:</h4>
                    {renderMethodCard(msg.recommendedMethod, true)}
                  </div>
                )}

                {/* Other Methods Section */}
                {msg.methodCards && msg.methodCards.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Other Methods We Provide:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {msg.methodCards.map(method => renderMethodCard(method))}
                    </div>
                  </div>
                )}

                {/* Hybrid Method Section */}
                {msg.hybridOption && (
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Want to start estimation right away?</h4>
                    <div
                      onClick={handleHybridSelect}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethods.includes('hybrid')
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <h5 className="font-semibold text-white">Hybrid Method</h5>
                        <Badge variant="accent" className="text-xs">Quick Estimate</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">
                        Perfect if you:
                      </p>
                      <ul className="text-xs text-gray-300 space-y-1 ml-4">
                        <li>• Have very little project information</li>
                        <li>• Want a quick, approximate estimate</li>
                        <li>• Need <strong>low emphasis on accuracy</strong></li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.type === 'bot' && (
                  <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-blue-500" />
                  </div>
                )}
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                  {msg.content}
                </div>
                {msg.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-blue-500" />
            </div>
            <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800/30 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Describe your project..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() && selectedMethods.length === 0} 
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-500">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Conversational Agent</span>
        </div>
      </div>
    </Card>
  );
}
