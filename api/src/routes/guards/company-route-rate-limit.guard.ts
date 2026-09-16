import {
  HttpException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class CompanyRouteRateLimitGuard implements CanActivate {
  private readonly windows = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  canActivate(context: ExecutionContext): boolean {
    const now = Date.now();
    for (const [ip, window] of this.windows) {
      if (window.expiresAt <= now) this.windows.delete(ip);
    }
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const window = this.windows.get(ip) ?? {
      count: 0,
      expiresAt: now + 60_000,
    };
    if (window.count >= 10) {
      context
        .switchToHttp()
        .getResponse<Response>()
        .setHeader('Retry-After', Math.ceil((window.expiresAt - now) / 1000));
      throw new HttpException(
        'Route request limit exceeded. Try again later.',
        429,
      );
    }
    window.count += 1;
    this.windows.set(ip, window);
    return true;
  }
}
