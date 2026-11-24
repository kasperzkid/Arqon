#!/usr/bin/env sh
# Start the Arqon frontend dev server. Usage: ./scripts/run-frontend.sh
set -e
cd "$(dirname "$0")/../frontend"

npm run dev -- --host "${ARQON_FRONTEND_HOST:-127.0.0.1}"
