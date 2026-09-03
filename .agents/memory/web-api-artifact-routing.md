---
name: Web/API artifact routing
description: Routing convention when a Vite web artifact calls a separately mounted Express API artifact.
---

The generated React web client is the source of truth for request paths. In this project its generated URLs already include `/api`, which is the platform proxy mount for the API artifact. The browser should use those URLs directly; adding `setBaseUrl('/api')` creates `/api/api/...` failures.

**Why:** The web frontend and API server are separate artifacts with different preview services, and the platform routes the shared `/api` prefix before the API server receives the request.

**How to apply:** When changing the OpenAPI `servers` setting or regenerating the client, inspect one generated URL and verify a browser request reaches `/api/<route>` exactly once.