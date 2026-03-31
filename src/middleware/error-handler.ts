import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('Unhandled error:', err.message);

  const message = err.message.toLowerCase();

  // 404 Not Found
  if (message.includes('not found')) {
    res.status(404).json({ error: err.message });
    return;
  }

  // 409 Conflict
  if (message.includes('already registered') || message.includes('already taken') || message.includes('already exists')) {
    res.status(409).json({ error: err.message });
    return;
  }

  // 400 Bad Request
  if (
    message.includes('invalid') ||
    message.includes('must be') ||
    message.includes('required') ||
    message.includes('cannot') ||
    message.includes('start date') ||
    message.includes('severity') ||
    message.includes('intensity') ||
    message.includes('scheduled time')
  ) {
    res.status(400).json({ error: err.message });
    return;
  }

  // 401 Unauthorized
  if (message.includes('unauthorized') || message.includes('authentication')) {
    res.status(401).json({ error: err.message });
    return;
  }

  // 403 Forbidden
  if (message.includes('forbidden') || message.includes('permission')) {
    res.status(403).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
}
