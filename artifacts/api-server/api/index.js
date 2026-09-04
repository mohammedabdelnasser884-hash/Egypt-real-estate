// Vercel's `functions` glob (see vercel.json) requires matches to live
// under /api. This file just re-exports the already-bundled, already
// esbuild-compiled handler — no TypeScript is compiled here, so Vercel's
// own from-source compiler never touches the monorepo's cross-package
// imports.
export { default } from "../dist/serverless.mjs";
