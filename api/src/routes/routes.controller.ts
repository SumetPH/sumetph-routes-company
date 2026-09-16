import {
  Body,
  Controller,
  Header,
  HttpCode,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service.js';
import {
  CompanyRouteRequestDto,
  type CompanyRouteResponseDto,
} from './dto/company-route.dto.js';
import { CompanyRouteRequestPipe } from './pipes/company-route-request.pipe.js';
import { CompanyRouteRateLimitGuard } from './guards/company-route-rate-limit.guard.js';

@Controller('api/routes')
@UseGuards(CompanyRouteRateLimitGuard)
export class RoutesController {
  constructor(@Inject(RoutesService) private readonly routes: RoutesService) {}

  @Post('company')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  calculateCompanyRoute(
    @Body(CompanyRouteRequestPipe) body: CompanyRouteRequestDto,
  ): Promise<CompanyRouteResponseDto> {
    return this.routes.calculateCompanyRoute(body.origin);
  }
}
