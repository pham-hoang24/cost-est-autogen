#!/usr/bin/env python3
"""
Task Processor for LLM Chatbot
Handles different types of tasks and optimizes prompts for each task type
"""

import re
import json
from typing import Dict, Any, Optional, List
import logging

logger = logging.getLogger(__name__)

class TaskProcessor:
    """Processes different types of tasks and optimizes them for the LLM"""
    
    def __init__(self):
        self.task_templates = self._load_task_templates()
        self.task_optimizers = self._load_task_optimizers()
    
    def _load_task_templates(self) -> Dict[str, str]:
        """Load task-specific prompt templates"""
        return {
            "chat": "You are a helpful AI assistant. Please respond to the following message in a friendly and helpful way:\n\n{prompt}",
            
            "code": "You are an expert programmer. Please help with the following coding task. Provide clear, well-commented code and explanations:\n\n{prompt}",
            
            "analysis": "You are an expert analyst. Please analyze the following text and provide insights, summaries, or extract key information:\n\n{prompt}",
            
            "creative": "You are a creative writer. Please create engaging and imaginative content based on the following prompt:\n\n{prompt}",
            
            "qa": "You are a knowledgeable expert. Please answer the following question clearly and accurately:\n\n{prompt}"
        }
    
    def _load_task_optimizers(self) -> Dict[str, Dict[str, Any]]:
        """Load task-specific optimization parameters"""
        return {
            "chat": {
                "max_length": 150,
                "temperature": 0.8,
                "top_p": 0.9,
                "system_prompt": "You are a friendly, helpful AI assistant. Keep responses conversational and engaging."
            },
            "code": {
                "max_length": 300,
                "temperature": 0.3,
                "top_p": 0.8,
                "system_prompt": "You are an expert programmer. Provide clear, well-structured code with explanations."
            },
            "analysis": {
                "max_length": 200,
                "temperature": 0.5,
                "top_p": 0.9,
                "system_prompt": "You are an expert analyst. Provide clear, structured analysis with key insights."
            },
            "creative": {
                "max_length": 250,
                "temperature": 0.9,
                "top_p": 0.95,
                "system_prompt": "You are a creative writer. Be imaginative, engaging, and original in your responses."
            },
            "qa": {
                "max_length": 200,
                "temperature": 0.4,
                "top_p": 0.8,
                "system_prompt": "You are a knowledgeable expert. Provide accurate, helpful answers with relevant details."
            }
        }
    
    async def process_task(self, task_type: str, prompt: str, context: Optional[Dict[str, Any]] = None, parameters: Optional[Dict[str, Any]] = None) -> str:
        """Process a task with the specified type"""
        try:
            # Validate task type
            if task_type not in self.task_templates:
                task_type = "chat"  # Default to chat if unknown
            
            # Get task-specific parameters
            task_params = self.task_optimizers.get(task_type, {})
            
            # Override with user parameters if provided
            if parameters:
                task_params.update(parameters)
            
            # Optimize the prompt for the task type
            optimized_prompt = self._optimize_prompt(task_type, prompt, context)
            
            # Get the task template
            template = self.task_templates.get(task_type, self.task_templates["chat"])
            formatted_prompt = template.format(prompt=optimized_prompt)
            
            # Add system prompt if available
            if task_params.get("system_prompt"):
                formatted_prompt = f"{task_params['system_prompt']}\n\n{formatted_prompt}"
            
            # For now, return a demo response based on task type
            # In production, this would call the LLM manager
            return self._generate_demo_response(task_type, prompt, task_params)
            
        except Exception as e:
            logger.error(f"Task processing failed: {e}")
            return f"I'm sorry, I encountered an error while processing your {task_type} task. Please try again."
    
    def _optimize_prompt(self, task_type: str, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Optimize the prompt for the specific task type"""
        optimized = prompt.strip()
        
        # Add context if provided
        if context:
            if task_type == "analysis" and "text" in context:
                optimized = f"Text to analyze: {context['text']}\n\nAnalysis request: {optimized}"
            elif task_type == "qa" and "context" in context:
                optimized = f"Context: {context['context']}\n\nQuestion: {optimized}"
            elif task_type == "code" and "language" in context:
                optimized = f"Programming language: {context['language']}\n\nTask: {optimized}"
        
        # Task-specific optimizations
        if task_type == "code":
            optimized = self._optimize_code_prompt(optimized)
        elif task_type == "analysis":
            optimized = self._optimize_analysis_prompt(optimized)
        elif task_type == "creative":
            optimized = self._optimize_creative_prompt(optimized)
        
        return optimized
    
    def _optimize_code_prompt(self, prompt: str) -> str:
        """Optimize prompts for code generation tasks"""
        # Add common code generation instructions
        if "function" in prompt.lower() or "def" in prompt.lower():
            prompt += "\n\nPlease include:\n- Function signature with type hints\n- Docstring\n- Example usage\n- Error handling if applicable"
        elif "class" in prompt.lower():
            prompt += "\n\nPlease include:\n- Class definition with proper structure\n- Methods with docstrings\n- Example instantiation and usage"
        elif "debug" in prompt.lower():
            prompt += "\n\nPlease:\n- Identify the issue\n- Explain the problem\n- Provide the corrected code\n- Explain why the fix works"
        
        return prompt
    
    def _optimize_analysis_prompt(self, prompt: str) -> str:
        """Optimize prompts for analysis tasks"""
        # Add analysis structure
        if "summarize" in prompt.lower():
            prompt += "\n\nPlease provide:\n- Key points summary\n- Main themes\n- Important details\n- Overall conclusion"
        elif "sentiment" in prompt.lower():
            prompt += "\n\nPlease analyze:\n- Overall sentiment\n- Key emotional indicators\n- Confidence level\n- Supporting evidence"
        elif "extract" in prompt.lower():
            prompt += "\n\nPlease extract:\n- Key information\n- Important facts\n- Relevant details\n- Organized format"
        
        return prompt
    
    def _optimize_creative_prompt(self, prompt: str) -> str:
        """Optimize prompts for creative writing tasks"""
        # Add creative writing guidance
        if "story" in prompt.lower():
            prompt += "\n\nPlease create:\n- Engaging opening\n- Clear plot structure\n- Vivid descriptions\n- Satisfying conclusion"
        elif "poem" in prompt.lower():
            prompt += "\n\nPlease create:\n- Evocative imagery\n- Emotional resonance\n- Appropriate structure\n- Creative language"
        elif "slogan" in prompt.lower():
            prompt += "\n\nPlease create:\n- Memorable phrase\n- Clear message\n- Emotional appeal\n- Brand alignment"
        
        return prompt
    
    def _generate_demo_response(self, task_type: str, prompt: str, task_params: Dict[str, Any]) -> str:
        """Generate demo responses for different task types"""
        prompt_lower = prompt.lower()
        
        if task_type == "chat":
            return self._generate_chat_response(prompt_lower)
        elif task_type == "code":
            return self._generate_code_response(prompt_lower)
        elif task_type == "analysis":
            return self._generate_analysis_response(prompt_lower)
        elif task_type == "creative":
            return self._generate_creative_response(prompt_lower)
        elif task_type == "qa":
            return self._generate_qa_response(prompt_lower)
        else:
            return self._generate_chat_response(prompt_lower)
    
    def _generate_chat_response(self, prompt: str) -> str:
        """Generate chat responses"""
        if "hello" in prompt or "hi" in prompt:
            return "Hello! 👋 I'm your AI assistant. I'm here to help you with various tasks like coding, analysis, creative writing, and general questions. What would you like to work on today?"
        
        elif "how are you" in prompt:
            return "I'm doing great, thank you for asking! 😊 I'm excited to help you with your tasks. I can assist with programming, text analysis, creative writing, and much more. What can I help you with?"
        
        elif "joke" in prompt:
            return "Here's a programming joke for you: Why do programmers prefer dark mode? Because light attracts bugs! 🐛😄 What else would you like to chat about?"
        
        elif "weather" in prompt:
            return "I'm sorry, I don't have access to real-time weather data. 🌤️ But I can help you with many other things like coding, writing, analysis, or just having a friendly chat!"
        
        else:
            return "That's interesting! 🤔 I'm here to help you with various tasks. I can assist with coding, text analysis, creative writing, answering questions, or just having a conversation. What would you like to explore?"
    
    def _generate_code_response(self, prompt: str) -> str:
        """Generate code-related responses"""
        if "python" in prompt and "function" in prompt:
            return """Here's a Python function for you:

```python
def fibonacci(n: int) -> int:
    \"\"\"
    Calculate the nth Fibonacci number.
    
    Args:
        n (int): The position in the Fibonacci sequence (0-indexed)
    
    Returns:
        int: The nth Fibonacci number
    
    Raises:
        ValueError: If n is negative
    \"\"\"
    if n < 0:
        raise ValueError("Input must be non-negative")
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Example usage
print(fibonacci(10))  # Output: 55
print(fibonacci(20))  # Output: 6765
```

This function uses an iterative approach for efficiency. Would you like me to explain any part of it or help with a different coding task?"""
        
        elif "javascript" in prompt and "async" in prompt:
            return """Here's how to use async/await in JavaScript:

```javascript
// Basic async function
async function fetchUserData(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Using the async function
async function displayUser(userId) {
    try {
        const user = await fetchUserData(userId);
        console.log('User:', user.name);
    } catch (error) {
        console.error('Failed to display user:', error);
    }
}

// Call the function
displayUser(123);
```

Key points:
- `async` functions always return a Promise
- `await` pauses execution until the Promise resolves
- Use try-catch for error handling
- `await` can only be used inside `async` functions

Need help with anything else?"""
        
        elif "debug" in prompt:
            return """I can help you debug code! Here's a systematic approach:

1. **Identify the Error**: Look at error messages and stack traces
2. **Reproduce the Issue**: Create a minimal example that shows the problem
3. **Check Common Issues**: 
   - Syntax errors (missing brackets, semicolons, etc.)
   - Logic errors (off-by-one, wrong conditions)
   - Type errors (string vs number comparisons)
4. **Use Debugging Tools**: Print statements, debugger, logging
5. **Test Incrementally**: Fix one issue at a time

Could you share the specific code you're having trouble with? Include:
- The error message
- The problematic code
- What you expected vs. what happened

I'll help you identify and fix the issue! 🐛"""
        
        else:
            return """I'm here to help with your coding tasks! 💻 I can:

• **Generate code** in Python, JavaScript, Java, C++, and more
• **Explain concepts** like algorithms, data structures, and design patterns
• **Debug issues** by analyzing error messages and code logic
• **Optimize code** for better performance and readability
• **Suggest improvements** for code quality and best practices

What specific coding help do you need? Feel free to ask about any programming language or concept!"""
    
    def _generate_analysis_response(self, prompt: str) -> str:
        """Generate analysis responses"""
        if "summarize" in prompt:
            return """I can help you summarize text! 📊 Here's what I'll provide:

**Summary Structure:**
• **Key Points**: Main ideas and concepts
• **Main Themes**: Recurring topics and patterns
• **Important Details**: Critical information and data
• **Overall Conclusion**: Bottom-line insights

**Analysis Approach:**
• Identify the main purpose and scope
• Extract key facts and figures
• Highlight important relationships
• Provide actionable insights

Just share the text you'd like me to analyze, and I'll give you a comprehensive summary! 📝"""
        
        elif "sentiment" in prompt:
            return """I can analyze text sentiment for you! 😊😐😔 Here's what I'll examine:

**Sentiment Analysis:**
• **Overall Sentiment**: Positive, negative, or neutral
• **Emotional Indicators**: Specific words and phrases
• **Confidence Level**: How certain I am about the sentiment
• **Supporting Evidence**: Examples from the text

**What I Look For:**
• Emotional words and expressions
• Tone and context
• Intensity of feelings
• Mixed emotions if present

Share the text you'd like me to analyze, and I'll give you a detailed sentiment breakdown! 🎭"""
        
        else:
            return """I'm your text analysis expert! 📊 I can help you:

• **Summarize** long documents and articles
• **Analyze sentiment** to understand emotional tone
• **Extract key information** from text
• **Identify patterns** and themes
• **Compare multiple texts** for insights
• **Generate reports** with structured analysis

Just tell me what you'd like to analyze and what insights you're looking for. I'll provide a comprehensive analysis! 🔍"""
    
    def _generate_creative_response(self, prompt: str) -> str:
        """Generate creative writing responses"""
        if "story" in prompt:
            return """I'd love to write a story for you! ✍️ Here's what I can create:

**Story Elements:**
• **Engaging Opening**: Hook that draws readers in
• **Clear Plot Structure**: Beginning, middle, and end
• **Vivid Descriptions**: Sensory details and imagery
• **Character Development**: Relatable and interesting characters
• **Satisfying Conclusion**: Resolution that feels complete

**Genres I Can Write:**
• Science fiction and fantasy
• Mystery and adventure
• Heartwarming tales
• Educational stories
• Humorous narratives

What kind of story would you like? Tell me about the characters, setting, or theme you have in mind! 📚✨"""
        
        elif "poem" in prompt:
            return """I'd be happy to write a poem for you! ✍️ Here's what I can create:

**Poetic Elements:**
• **Evocative Imagery**: Vivid and sensory language
• **Emotional Resonance**: Feelings that connect with readers
• **Appropriate Structure**: Form that fits the content
• **Creative Language**: Unique and memorable phrases
• **Rhythm and Flow**: Natural reading cadence

**Poem Types:**
• Free verse and structured forms
• Haiku and sonnets
• Narrative and lyrical poetry
• Modern and classical styles
• Themed collections

What would you like the poem to be about? Share your inspiration, mood, or theme! 🌸📝"""
        
        else:
            return """I'm your creative writing partner! ✍️ I can help you create:

• **Stories** with engaging plots and characters
• **Poems** with vivid imagery and emotion
• **Marketing copy** that captures attention
• **Creative descriptions** for products or places
• **Character profiles** with depth and personality
• **Dialogue** that feels natural and engaging

What creative project would you like to work on? I'm here to spark your imagination and help bring your ideas to life! 🎨✨"""
    
    def _generate_qa_response(self, prompt: str) -> str:
        """Generate Q&A responses"""
        if "machine learning" in prompt:
            return """Great question! 🤖 **Machine Learning** is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.

**Key Concepts:**
• **Supervised Learning**: Learning from labeled examples (like teaching with answers)
• **Unsupervised Learning**: Finding patterns in unlabeled data
• **Reinforcement Learning**: Learning through trial and error with rewards

**Common Applications:**
• Image and speech recognition
• Recommendation systems
• Fraud detection
• Medical diagnosis
• Autonomous vehicles

**How It Works:**
1. **Data Collection**: Gather relevant training data
2. **Feature Engineering**: Extract meaningful patterns
3. **Model Training**: Teach the algorithm to recognize patterns
4. **Evaluation**: Test performance on new data
5. **Deployment**: Use the trained model for predictions

Would you like me to explain any specific aspect of machine learning in more detail? 📚"""
        
        elif "blockchain" in prompt:
            return """Excellent question! 🔗 **Blockchain** is a distributed, decentralized digital ledger that records transactions across multiple computers securely and transparently.

**Key Features:**
• **Decentralization**: No single point of control
• **Immutability**: Once recorded, data cannot be altered
• **Transparency**: All transactions are visible to participants
• **Security**: Cryptographic protection against tampering

**How It Works:**
1. **Transaction Creation**: Users initiate digital transactions
2. **Verification**: Network validates transaction authenticity
3. **Block Formation**: Valid transactions grouped into blocks
4. **Consensus**: Network agrees on block validity
5. **Chain Addition**: New block added to existing chain

**Applications:**
• Cryptocurrencies (Bitcoin, Ethereum)
• Smart contracts
• Supply chain tracking
• Digital identity verification
• Voting systems

**Benefits:**
• Enhanced security and transparency
• Reduced intermediaries
• Lower transaction costs
• Increased trust and efficiency

Would you like me to dive deeper into any blockchain concept? 🌐"""
        
        else:
            return """I'm here to answer your questions! ❓ I can help with:

• **Technology**: AI, blockchain, programming, cybersecurity
• **Science**: Physics, chemistry, biology, mathematics
• **Business**: Marketing, finance, management, strategy
• **Arts**: Literature, music, visual arts, design
• **History**: Events, people, cultures, civilizations
• **General Knowledge**: Current events, trivia, facts

Just ask your question, and I'll provide a clear, accurate answer with relevant details! 📚✨"""
    
    def get_task_info(self, task_type: str) -> Dict[str, Any]:
        """Get information about a specific task type"""
        if task_type not in self.task_optimizers:
            return {"error": "Unknown task type"}
        
        return {
            "task_type": task_type,
            "description": self._get_task_description(task_type),
            "parameters": self.task_optimizers[task_type],
            "template": self.task_templates[task_type],
            "examples": self._get_task_examples(task_type)
        }
    
    def _get_task_description(self, task_type: str) -> str:
        """Get description for a task type"""
        descriptions = {
            "chat": "General conversation and casual interaction",
            "code": "Programming assistance, code generation, and debugging",
            "analysis": "Text analysis, summarization, and insight extraction",
            "creative": "Creative writing, storytelling, and imaginative content",
            "qa": "Question answering and knowledge sharing"
        }
        return descriptions.get(task_type, "Unknown task type")
    
    def _get_task_examples(self, task_type: str) -> List[str]:
        """Get example prompts for a task type"""
        examples = {
            "chat": [
                "Hello! How are you today?",
                "Tell me a joke",
                "What's your favorite color?"
            ],
            "code": [
                "Write a Python function to sort a list",
                "Explain how recursion works",
                "Help me debug this JavaScript code"
            ],
            "analysis": [
                "Summarize this article",
                "Analyze the sentiment of this text",
                "Extract key points from this document"
            ],
            "creative": [
                "Write a story about a robot",
                "Create a poem about nature",
                "Generate a marketing slogan"
            ],
            "qa": [
                "What is artificial intelligence?",
                "How does photosynthesis work?",
                "What are the benefits of exercise?"
            ]
        }
        return examples.get(task_type, [])
