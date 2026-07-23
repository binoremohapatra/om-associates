import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { isAppError, ValidationError, ConflictError, NotFoundError } from '../types/errors';
import { logger } from '../config/logger';
import type { ApiResponse } from '../types';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErr = new ValidationError('Request validation failed', err.flatten());
    res.status(422).json({
      success: false,
      error: {
        code: validationErr.code,
        message: validationErr.message,
        details: validationErr.details,
      },
    } satisfies ApiResponse);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const conflict = new ConflictError('A record with these values already exists');
      res.status(409).json({
        success: false,
        error: { code: conflict.code, message: conflict.message },
      } satisfies ApiResponse);
      return;
    }
    if (err.code === 'P2025') {
      const notFound = new NotFoundError();
      res.status(404).json({
        success: false,
        error: { code: notFound.code, message: notFound.message },
      } satisfies ApiResponse);
      return;
    }
    logger.error({ err, requestId, prismaCode: err.code }, 'Prisma error');
    res.status(500).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'A database error occurred' },
    } satisfies ApiResponse);
    return;
  }

  // Handle our typed operational errors
  if (isAppError(err)) {
    if (!err.isOperational || err.statusCode >= 500) {
      logger.error({ err, requestId }, 'Operational server error');
    } else {
      logger.warn({ err: { code: err.code, message: err.message }, requestId }, 'Client error');
    }
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.statusCode === 422 && 'details' in err ? { details: (err as ValidationError).details } : {}),
      },
    } satisfies ApiResponse);
    return;
  }

  // Unknown/unhandled errors
  logger.error({ err, requestId }, 'Unhandled error');
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Our team has been notified.',
    },
  } satisfies ApiResponse);
}
