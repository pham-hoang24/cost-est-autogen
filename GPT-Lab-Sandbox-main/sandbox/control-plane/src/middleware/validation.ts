import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Enhanced input validation middleware
export const validateInput = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and sanitize request body
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
        errors: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message
        }))
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid input data'
      });
    }
  };
};

// Common validation schemas
export const userRegistrationSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/, 'Invalid first name'),
  last_name: z.string().min(1).max(100).regex(/^[a-zA-Z\s\-']+$/, 'Invalid last name'),
  organization: z.string().min(1).max(200),
  signup_reason: z.string().max(1000).optional(),
  research_area: z.string().max(500).optional(),
  role: z.enum(['super_admin', 'research_admin', 'researcher', 'viewer']).optional()
});

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128)
});

export const serviceCreationSchema = z.object({
  name: z.string().min(1).max(200).regex(/^[a-zA-Z0-9\s\-_]+$/, 'Invalid service name'),
  description: z.string().max(1000).optional(),
  type: z.enum(['ai-services', 'data-catalog', 'compute', 'storage']),
  config: z.record(z.string(), z.any()),
  endpoint: z.string().url().optional()
});

// Sanitization utilities
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// SQL injection prevention helper
export const escapeSQL = (value: string): string => {
  return value.replace(/'/g, "''");
};

// XSS prevention
export const sanitizeHTML = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
