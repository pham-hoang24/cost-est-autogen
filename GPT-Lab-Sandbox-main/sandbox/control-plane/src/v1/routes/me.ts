import { Router } from 'express';

export const meRouter = Router();

meRouter.get('/', (req, res) => {
  // Placeholder: pull from OIDC/JWT in real deployment
  res.json({
    sub: 'user@example.org',
    email: 'user@example.org',
    groups: ['viewer'],
  });
});



