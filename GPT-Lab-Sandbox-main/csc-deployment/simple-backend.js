const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Simple auth
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'demo-token',
    user: { id: '1', email: 'demo@sw4e.org', role: 'researcher' }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    user: { id: '1', email: 'demo@sw4e.org', role: 'researcher' }
  });
});

// Mock APIs
app.get('/api/collaboration/projects', (req, res) => {
  res.json({ projects: [] });
});

app.get('/api/ai-services/catalog', (req, res) => {
  res.json({ services: [] });
});

app.get('/api/hardware/requests', (req, res) => {
  res.json({ requests: [] });
});

app.get('/api/collaboration/subscription/features', (req, res) => {
  res.json({ features: {} });
});

app.get('/api/simple-governance/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(PORT, () => {
  console.log(`🚀 Simple backend running on port ${PORT}`);
});
