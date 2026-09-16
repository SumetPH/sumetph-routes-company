import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller.js';
import { RoutesService } from './routes.service.js';
import { CompanyRouteRequestPipe } from './pipes/company-route-request.pipe.js';
import { CompanyRouteRateLimitGuard } from './guards/company-route-rate-limit.guard.js';

@Module({
  controllers: [RoutesController],
  providers: [
    RoutesService,
    CompanyRouteRequestPipe,
    CompanyRouteRateLimitGuard,
  ],
})
export class RoutesModule {}
