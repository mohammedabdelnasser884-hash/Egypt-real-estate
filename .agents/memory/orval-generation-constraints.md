---
name: Orval generation constraints
description: Non-obvious constraints encountered when regenerating the typed React API client.
---

The OpenAPI client generation currently depends on explicit generator overrides for Zod compatibility, and path-plus-query parameter combinations can produce duplicate generated parameter exports. Preserve the working overrides and resolve duplicate names without changing the public API contract.

**Why:** Workspace catalog versions and Orval plugin behavior do not always agree, and duplicate generated exports can break dependent packages even when the OpenAPI document is valid.

**How to apply:** After changing the OpenAPI document or dependency catalog, regenerate the client and run the dependent package typechecks before relying on generated declarations.