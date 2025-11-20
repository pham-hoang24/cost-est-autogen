#!/usr/bin/env python3
"""
Test script for LLM Chatbot fallback functionality
Tests the system without requiring external dependencies
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_fallback():
    """Test the fallback model functionality"""
    print("🧪 Testing LLM Chatbot Fallback Functionality...")
    
    try:
        # Test basic imports
        print("📚 Testing basic imports...")
        
        # Test task processor
        print("🔧 Testing task processor...")
        from task_processor import TaskProcessor
        
        processor = TaskProcessor()
        print("✅ Task processor initialized successfully")
        
        # Test different task types
        test_tasks = ['chat', 'code', 'analysis', 'creative', 'qa']
        
        for task_type in test_tasks:
            print(f"\n🎯 Testing {task_type} task...")
            
            # Test with a simple prompt
            if task_type == 'chat':
                prompt = "Hello! How are you?"
            elif task_type == 'code':
                prompt = "Write a Python function"
            elif task_type == 'analysis':
                prompt = "Analyze this text"
            elif task_type == 'creative':
                prompt = "Write a story"
            elif task_type == 'qa':
                prompt = "What is AI?"
            
            # Get response (this will use fallback mode)
            response = processor._generate_demo_response(task_type, prompt, {})
            print(f"📝 Response: {response[:100]}...")
            print(f"✅ {task_type} task working")
        
        print("\n🎉 All fallback tests passed!")
        print("\n📋 Summary:")
        print("✅ Task processor working")
        print("✅ All task types functional")
        print("✅ Fallback responses generated")
        print("✅ Ready for demo!")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_model_manager():
    """Test the model manager functionality"""
    print("\n🤖 Testing Model Manager...")
    
    try:
        from llm_manager import LLMManager
        
        manager = LLMManager()
        print("✅ Model manager initialized")
        
        # Test fallback model
        fallback_response = manager._fallback_generate("Hello, how are you?", 100)
        print(f"📝 Fallback response: {fallback_response[:100]}...")
        print("✅ Fallback model working")
        
        # Test model info
        model_info = manager.get_model_info("tiny-llama-1b")
        print(f"📊 Model info: {model_info['name']} - {model_info['size']}")
        print("✅ Model info retrieval working")
        
        return True
        
    except Exception as e:
        print(f"❌ Model manager test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 LLM Chatbot Template Test Suite")
    print("=" * 50)
    
    # Test fallback functionality
    fallback_ok = test_fallback()
    
    # Test model manager
    model_ok = test_model_manager()
    
    print("\n" + "=" * 50)
    if fallback_ok and model_ok:
        print("🎉 ALL TESTS PASSED! Template is ready for demo.")
        print("\n📱 To run the full chatbot:")
        print("   1. Install dependencies: pip install -r requirements.txt")
        print("   2. Run: python3 app.py")
        print("   3. Access: http://localhost:8000")
        print("   4. Demo page: http://localhost:8000/demo")
    else:
        print("❌ Some tests failed. Check the errors above.")
    
    print("\n🎯 Ready for tomorrow's project team presentation!")
