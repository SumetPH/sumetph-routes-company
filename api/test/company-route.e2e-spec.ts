import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { vi } from 'vitest';
import { AppModule } from '../src/app.module.js';

const origin = { latitude: 13.75, longitude: 100.5 };
const googleRoute = {
  distanceMeters: 12500,
  duration: '1800.5s',
  polyline: { encodedPolyline: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' },
};

describe('POST /api/routes/company', () => {
  let app: INestApplication;
  const googleFetch = vi.fn<typeof fetch>();

  beforeEach(async () => {
    vi.stubEnv('GOOGLE_MAPS_API_KEY', 'test-server-key');
    vi.stubEnv('COMPANY_LATITUDE', '13.8');
    vi.stubEnv('COMPANY_LONGITUDE', '100.6');
    googleFetch.mockReset();
    vi.stubGlobal('fetch', googleFetch);
    googleFetch.mockResolvedValue(
      new Response(JSON.stringify({ routes: [googleRoute] }), { status: 200 }),
    );
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
  });

  afterEach(async () => {
    await app.close();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns distance, numeric seconds and Google polyline without caching', async () => {
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect({
        distanceMeters: 12500,
        durationSeconds: 1800.5,
        encodedPolyline: googleRoute.polyline.encodedPolyline,
      });
    const [url, options] = googleFetch.mock.calls[0]!;
    expect(url).toBe(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
    );
    expect(JSON.parse(options!.body as string)).toEqual({
      origin: { location: { latLng: origin } },
      destination: {
        location: { latLng: { latitude: 13.8, longitude: 100.6 } },
      },
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
    });
    expect(options!.headers).toMatchObject({
      'X-Goog-Api-Key': 'test-server-key',
    });
  });

  it('calls Google again for every API request', async () => {
    googleFetch.mockImplementation(
      async () => new Response(JSON.stringify({ routes: [googleRoute] })),
    );
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(200);
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(200);
    expect(googleFetch).toHaveBeenCalledTimes(2);
  });

  it.each([
    {},
    { origin: null },
    { origin: { latitude: '13.75', longitude: 100.5 } },
    { origin: { latitude: 91, longitude: 100.5 } },
    { origin: { latitude: 13.75, longitude: -181 } },
    { origin, destination: origin },
    { origin, departureTime: '2030-01-01T00:00:00Z' },
  ])(
    'rejects invalid input or client overrides before calling Google: %j',
    async (body) => {
      await request(app.getHttpServer())
        .post('/api/routes/company')
        .send(body)
        .expect(400);
      expect(googleFetch).not.toHaveBeenCalled();
    },
  );

  it('returns 503 if the destination is unconfigured', async () => {
    vi.stubEnv('COMPANY_LATITUDE', '');
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(503);
    expect(googleFetch).not.toHaveBeenCalled();
  });

  it('accepts zero coordinates as valid configuration and input', async () => {
    vi.stubEnv('COMPANY_LATITUDE', '0');
    vi.stubEnv('COMPANY_LONGITUDE', '0');
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin: { latitude: 0, longitude: 0 } })
      .expect(200);
  });

  it.each([{ routes: [] }, {}])(
    'returns 404 when no route is found: %j',
    async (payload) => {
      googleFetch.mockResolvedValue(new Response(JSON.stringify(payload)));
      await request(app.getHttpServer())
        .post('/api/routes/company')
        .send({ origin })
        .expect(404);
    },
  );

  it('rejects a fallback without traffic data', async () => {
    googleFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [googleRoute],
          fallbackInfo: { routingMode: 'FALLBACK_TRAFFIC_UNAWARE' },
        }),
      ),
    );
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(502);
  });

  it('accepts a fallback that still uses traffic data', async () => {
    googleFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          routes: [googleRoute],
          fallbackInfo: { routingMode: 'FALLBACK_TRAFFIC_AWARE' },
        }),
      ),
    );
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(200);
  });

  it.each([
    { routes: [{ ...googleRoute, duration: 'invalid' }] },
    { routes: [{ ...googleRoute, distanceMeters: -1 }] },
    { routes: [{ ...googleRoute, polyline: {} }] },
    { routes: 'invalid' },
    null,
  ])('rejects malformed Google responses: %j', async (payload) => {
    googleFetch.mockResolvedValue(new Response(JSON.stringify(payload)));
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(502);
  });

  it('returns 502 without exposing Google errors or the key', async () => {
    googleFetch.mockResolvedValue(
      new Response('private upstream detail', { status: 403 }),
    );
    const response = await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(502);
    expect(response.text).not.toContain('private upstream detail');
    expect(response.text).not.toContain('test-server-key');
  });

  it('returns 502 for a network failure', async () => {
    googleFetch.mockRejectedValue(new TypeError('network failure'));
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(502);
  });

  it('returns 504 if the request timeout signal aborts', async () => {
    const controller = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, 'timeout')
      .mockReturnValue(controller.signal);
    googleFetch.mockImplementation(async () => {
      controller.abort(new DOMException('Timed out', 'TimeoutError'));
      throw controller.signal.reason;
    });
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(504);
    expect(timeout).toHaveBeenCalledWith(10_000);
  });

  it('limits the route endpoint to 10 requests per minute', async () => {
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);
    googleFetch.mockImplementation(
      async () => new Response(JSON.stringify({ routes: [googleRoute] })),
    );
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .post('/api/routes/company')
        .send({ origin })
        .expect(200);
    }
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .set('X-Forwarded-For', '203.0.113.2')
      .send({ origin })
      .expect(429)
      .expect('Retry-After', '60');
    expect(googleFetch).toHaveBeenCalledTimes(10);
    await request(app.getHttpServer()).get('/health').expect(200);
    clock.mockReturnValue(now + 60_001);
    await request(app.getHttpServer())
      .post('/api/routes/company')
      .send({ origin })
      .expect(200);
  });
});
