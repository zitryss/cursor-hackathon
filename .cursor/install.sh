#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the Tax Pulse React Router app.
set -euo pipefail

cd "$(dirname "$0")/.."

# Node 24 is required (see package.json "engines"). The base image ships an
# older Node on PATH, so pin the project's Node through nvm.
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

if ! nvm which 24 >/dev/null 2>&1; then
	nvm install 24
fi
nvm alias default 24 >/dev/null
nvm use 24 >/dev/null

# Ensure the pinned pnpm from package.json "packageManager" is available.
corepack enable >/dev/null 2>&1 || true

# Local SQLite connection string used by the server env schema.
if [ ! -f .env ]; then
	printf 'DATABASE_URL=file:local.db\n' > .env
fi

# Install dependencies from the committed lockfile.
corepack pnpm install --frozen-lockfile

# Create/upgrade the local SQLite database from Drizzle migrations.
corepack pnpm run db:migrate

echo "Environment ready: Node $(node -v), pnpm $(corepack pnpm -v)"
