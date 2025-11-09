#!/usr/bin/env sh
set -e

export INTERNAL_API_DOMAIN=http://cm-backend:10100

exec node server.js
