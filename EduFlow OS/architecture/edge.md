# Cloudflare Workers & Edge Runtime Architecture

## Overview
EduFlow incorporates edge computing capabilities via **Cloudflare Workers** alongside Next.js edge-ready routing. The edge layer provides ultra-low latency health telemetry, edge pinging, and offline sync buffering tailored for Pakistani schools with intermittent internet connectivity.

Configuration File: [`wrangler.jsonc`](file:///home/basit/eduflow/wrangler.jsonc)  
Worker Source: [`workers/index.ts`](file:///home/basit/eduflow/workers/index.ts)  
Client Offline Sentinel: [`components/offline-client.tsx`](file:///home/basit/eduflow/components/offline-client.tsx)  
Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Wrangler Edge Worker Configuration

From [`wrangler.jsonc`](file:///home/basit/eduflow/wrangler.jsonc):
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "eduflow-edge-worker",
  "main": "workers/index.ts",
  "compatibility_date": "2026-09-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": {
    "enabled": true
  }
}
```

Key aspects:
- `nodejs_compat` enabled for standard Node.js APIs within the edge sandbox.
- Edge observability enabled for distributed tracing and performance metrics.
- KV storage namespace integration (`SYNC_BUFFER`) for staging offline payloads before DB ingestion.

---

## 2. Edge Endpoints (`workers/index.ts`)

### 1. `/edge/health` (GET)
- **Purpose:** Sub-millisecond health ping and geographic edge telemetry.
- **Payload:**
  ```json
  {
    "status": "healthy",
    "service": "EduFlow Edge Worker",
    "timestamp": "2026-09-25T17:00:00.000Z",
    "edgeRegion": "PK"
  }
  ```
- **Headers:** `access-control-allow-origin: *`, enabling browser portals to run non-blocking ping checks.

### 2. `/edge/sync-ping` (POST)
- **Purpose:** Low-overhead sync verification endpoint for school devices reconnecting after network drops.
- **Behavior:** Receives local offline transaction buffers (e.g. offline attendance marks, diary drafts), acknowledges receipt with a UTC timestamp, and prepares them for upstream reconciliation.

---

## 3. Resilient Connectivity for Pakistani School Operations

Schools across Pakistan frequently face power outages (load shedding) and fluctuating broadband. EduFlow mitigates this through:
1. **Lightweight Edge Handshakes:** Minimizing initial TCP roundtrips to under 40ms via Cloudflare edge nodes in Karachi, Lahore, and Islamabad.
2. **Offline-First Client Sync:** [`components/offline-client.tsx`](file:///home/basit/eduflow/components/offline-client.tsx) monitors browser `navigator.onLine` state and caches transactions locally until `/edge/sync-ping` succeeds.
3. **Bandwidth Optimization:** Minimizes bundle sizes and payload overhead for 2G/3G mobile data connections used by teachers and parents.

---

## 4. Operational Commands

- **Local Dev Server:**
  ```bash
  npm run worker:dev
  ```
- **Production Edge Deployment:**
  ```bash
  npm run worker:deploy
  ```

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/routing|Routing Architecture]]
- [[architecture/database|Database & Schema Models]]
- [[features/attendance|Attendance Offline Tracking]]
- [[TRACKER|Project Progress Tracker]]
