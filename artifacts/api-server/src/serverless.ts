import app from "./app";

// Used only as the Vercel Functions entry point. Vercel invokes the
// default-exported Express app directly per request instead of calling
// app.listen() (see src/index.ts, which is for the long-running deployment
// target). Kept as a separate file so esbuild — not Vercel's own from-source
// TypeScript compiler — is what bundles it, since our project references
// span outside this package's rootDir and Vercel's compiler chokes on that.
export default app;
