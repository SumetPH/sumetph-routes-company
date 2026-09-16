import {
  BadGatewayException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  Coordinates,
  CompanyRouteResponseDto,
} from './dto/company-route.dto.js';
import { isRecord, isCoordinate } from './utils/validation.js';

@Injectable()
export class RoutesService {
  async calculateCompanyRoute(
    origin: Coordinates,
  ): Promise<CompanyRouteResponseDto> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY?.trim();
    const latitude = process.env.COMPANY_LATITUDE?.trim();
    const longitude = process.env.COMPANY_LONGITUDE?.trim();
    const destination = {
      latitude: Number(latitude),
      longitude: Number(longitude),
    };
    if (
      !apiKey ||
      !latitude ||
      !longitude ||
      !isCoordinate(destination.latitude, 90) ||
      !isCoordinate(destination.longitude, 180)
    ) {
      throw new ServiceUnavailableException(
        'Configure GOOGLE_MAPS_API_KEY, COMPANY_LATITUDE and COMPANY_LONGITUDE on the API server.',
      );
    }

    const signal = AbortSignal.timeout(10_000);
    let payload: unknown;
    try {
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask':
              'routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,fallbackInfo',
          },
          body: JSON.stringify({
            origin: { location: { latLng: origin } },
            destination: { location: { latLng: destination } },
            travelMode: 'DRIVE',
            routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
            computeAlternativeRoutes: false,
            polylineEncoding: 'ENCODED_POLYLINE',
            polylineQuality: 'OVERVIEW',
            routeModifiers: {
              avoidTolls: false,
              avoidHighways: false,
              avoidFerries: true,
            },
            // Omit departureTime: Google uses its request time for departure now.
          }),
          signal,
        },
      );
      if (!response.ok) throw new Error('Google Routes request failed.');
      payload = await response.json();
    } catch {
      if (signal.aborted)
        throw new GatewayTimeoutException(
          'Google Routes did not respond within 10 seconds.',
        );
      throw new BadGatewayException(
        'Google Routes is unavailable. Check the server API key, Routes API activation, billing and quota.',
      );
    }

    if (
      !isRecord(payload) ||
      (payload.routes !== undefined && !Array.isArray(payload.routes))
    ) {
      throw new BadGatewayException(
        'Google Routes returned an invalid response.',
      );
    }
    if (
      isRecord(payload.fallbackInfo) &&
      payload.fallbackInfo.routingMode !== 'FALLBACK_TRAFFIC_AWARE'
    ) {
      throw new BadGatewayException(
        'Google Routes could not provide a traffic-aware route.',
      );
    }
    // Protobuf JSON can omit an empty repeated field entirely.
    if (!Array.isArray(payload.routes) || payload.routes.length === 0)
      throw new NotFoundException('No driving route to the company was found.');

    const route: unknown = payload.routes[0];
    if (!isRecord(route) || !isRecord(route.polyline)) {
      throw new BadGatewayException('Google Routes returned an invalid route.');
    }
    const { distanceMeters, duration } = route;
    const { encodedPolyline } = route.polyline;
    const durationSeconds =
      typeof duration === 'string' && /^\d+(?:\.\d{1,9})?s$/.test(duration)
        ? Number(duration.slice(0, -1))
        : NaN;
    if (
      typeof distanceMeters !== 'number' ||
      !Number.isInteger(distanceMeters) ||
      distanceMeters < 0 ||
      !Number.isFinite(durationSeconds) ||
      typeof encodedPolyline !== 'string' ||
      !encodedPolyline
    ) {
      throw new BadGatewayException(
        'Google Routes returned incomplete route details.',
      );
    }
    return { distanceMeters, durationSeconds, encodedPolyline };
  }
}
