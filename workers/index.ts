/// <reference types="@cloudflare/workers-types" />
/**
 * EduFlow Edge Worker - Cloudflare Workers Scaffold
 * Provides high-speed edge telemetry, health checks, and sync buffering for school portals.
 */

export interface Env {
  ENVIRONMENT?: string;
  SYNC_BUFFER?: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Edge Health Check
    if (url.pathname === '/edge/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          service: 'EduFlow Edge Worker',
          timestamp: new Date().toISOString(),
          edgeRegion: request.headers.get('cf-ipcountry') || 'global',
        }),
        {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        }
      );
    }

    // Edge Sync Ping Endpoint for low-bandwidth offline/online reconciliation
    if (url.pathname === '/edge/sync-ping' && request.method === 'POST') {
      const payload = await request.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          ack: true,
          syncedAt: Date.now(),
          receivedPayload: payload,
        }),
        {
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        message: 'EduFlow Cloudflare Edge Worker Scaffold is running.',
        routes: ['/edge/health', '/edge/sync-ping'],
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }
    );
  },
};
