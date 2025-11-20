import { Router } from 'express';

export const privacyRouter = Router();

privacyRouter.post('/export-data', async (_req, res) => {
  // Placeholder: enqueue export job and require admin approval
  res.status(202).json({ status: 'pending' });
});

privacyRouter.post('/delete-data', async (_req, res) => {
  // Placeholder: enqueue deletion job and require admin approval
  res.status(202).json({ status: 'pending' });
});



