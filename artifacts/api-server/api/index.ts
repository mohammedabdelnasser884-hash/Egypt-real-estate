import app from "../src/app";

// Vercel calls this as a request handler on every invocation instead of
// running `app.listen()`. Do not import "../src/index" here — that file
// reads PORT and calls app.listen(), which is for the long-running
// (non-serverless) deployment target only.
export default app;
