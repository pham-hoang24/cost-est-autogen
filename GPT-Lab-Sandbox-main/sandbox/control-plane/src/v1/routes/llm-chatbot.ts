import { Router, Request, Response } from 'express';

const router = Router();

// LLM Chatbot endpoints
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'LLM Chatbot is operational',
    timestamp: new Date().toISOString(),
    endpoints: ['/health', '/chat', '/demo', '/api/status']
  });
});

router.get('/chat', async (req: Request, res: Response) => {
  res.json({
    message: 'Chat endpoint working!',
    task_types: ['chat', 'code', 'analysis', 'creative', 'qa'],
    models: ['TinyLlama 1B', 'Phi-2', 'Llama 2 7B']
  });
});

router.get('/demo', async (req: Request, res: Response) => {
  res.json({
    message: 'Demo mode activated!',
    features: [
      'Multi-task support (chat, code, analysis, creative, Q&A)',
      'Lightweight models (TinyLlama, Phi-2, Llama 2)',
      'Real deployment with Kubernetes',
      'Professional UI for presentations'
    ],
    demo_urls: {
      main_chat: '/llm-chatbot/chat',
      health_check: '/llm-chatbot/health',
      api_docs: '/api-docs'
    },
    ready_for_demo: true
  });
});

router.get('/api/status', async (req: Request, res: Response) => {
  res.json({
    server: 'SW4E Sandbox Integrated',
    status: 'running',
    integration: 'main-sandbox',
    features: ['Integrated Chat', 'JSON API', 'Demo Ready', 'Sandbox Native']
  });
});

export default router;
