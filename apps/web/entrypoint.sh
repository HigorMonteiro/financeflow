#!/bin/sh
set -e

if [ "$NODE_ENV" = "production" ]; then
  exec pm2-runtime start ecosystem.config.cjs
else
  exec node server.js
fi

