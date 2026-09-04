{
  "buildCommand": "node ./build.mjs",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/api/index" }
  ]
}
