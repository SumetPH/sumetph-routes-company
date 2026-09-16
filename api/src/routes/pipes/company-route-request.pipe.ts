import {
  BadRequestException,
  Injectable,
  type PipeTransform,
} from '@nestjs/common';
import type { CompanyRouteRequestDto } from '../dto/company-route.dto.js';
import { isRecord, isCoordinate } from '../utils/validation.js';

@Injectable()
export class CompanyRouteRequestPipe implements PipeTransform<
  unknown,
  CompanyRouteRequestDto
> {
  transform(body: unknown): CompanyRouteRequestDto {
    if (
      !isRecord(body) ||
      Object.keys(body).some((key) => key !== 'origin') ||
      !isRecord(body.origin) ||
      Object.keys(body.origin).some(
        (key) => key !== 'latitude' && key !== 'longitude',
      ) ||
      !isCoordinate(body.origin.latitude, 90) ||
      !isCoordinate(body.origin.longitude, 180)
    ) {
      throw new BadRequestException(
        'Provide only origin.latitude (-90..90) and origin.longitude (-180..180) as numbers.',
      );
    }
    return {
      origin: {
        latitude: body.origin.latitude,
        longitude: body.origin.longitude,
      },
    };
  }
}
