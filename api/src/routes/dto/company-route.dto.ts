export type Coordinates = { latitude: number; longitude: number };

export class CompanyRouteRequestDto {
  origin: Coordinates;
}

export class CompanyRouteResponseDto {
  distanceMeters: number;
  durationSeconds: number;
  encodedPolyline: string;
}
