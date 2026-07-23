import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pinoHttp from 'pino-http';
import { logger } from '../config/logger';

// Attach a unique request ID to every incoming request
export function requestId(req: Request, res: Response, next: NextFunction): void {
  req.requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  res.setHeader('x-request-id', req.requestId);
  next();
}

// HTTP request/response logging with pino-http
export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res) => `${req.method} ${req.url} ${res.statusCode}`,
  customErrorMessage: (req, res, err) => `${req.method} ${req.url} ${res.statusCode} — ${err.message}`,
  customAttributeKeys: {
    req: 'request',
    res: 'response',
    err: 'error',
    responseTime: 'duration_ms',
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Validate Zod schema and throw ValidationError on failure
import { ZodObject, ZodError } from 'zod';
import { ValidationError } from '../types/errors';

type ZodTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodObject<any>, target: ZodTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.strict().parse(req[target]);
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ValidationError('Request validation failed', err.flatten()));
      } else {
        next(err);
      }
    }
  };
}

// Idempotency key extractor
export function extractIdempotencyKey(req: Request, _res: Response, next: NextFunction): void {
  const key = req.headers['x-idempotency-key'] as string | undefined;
  if (!key) {
    // Generate a deterministic key for non-idempotent requests
    req.headers['x-idempotency-key'] = uuidv4();
  }
  next();
}
