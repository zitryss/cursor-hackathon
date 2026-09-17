#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for the Tax Pulse React Router app.
set -euo pipefail

cd "$(dirname "$0")/.."

# --- Node 24 (required by package.json "engines"; base image ships Node 22) ---
# The base image injects an older Node ahead of nvm on PATH, and login-shell
# auto-activation of the nvm default is not reliable in every pod, so resolve
# the Node 24 bin explicitly and put it first on PATH.
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" --no-use

if ! nvm which 24 >/dev/null 2>&1; then
	nvm install 24
fi
nvm alias default 24 >/dev/null

NODE24_BIN="$(dirname "$(nvm which 24)")"
export PATH="$NODE24_BIN:$PATH"

# Persist Node 24 on PATH for future interactive/login agent shells. Idempotent:
# guarded by a marker block and re-resolved dynamically so minor Node 24 bumps
# keep working.
BASHRC="$HOME/.bashrc"
MARKER="# >>> tax-pulse node24 >>>"
if ! grep -qF "$MARKER" "$BASHRC" 2>/dev/null; then
	{
		echo ""
		echo "$MARKER"
		echo 'export NVM_DIR="$HOME/.nvm"'
		echo '[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" --no-use'
		echo 'if command -v nvm >/dev/null 2>&1; then'
		echo '  __n24="$(nvm which 24 2>/dev/null)" && [ -n "$__n24" ] && export PATH="$(dirname "$__n24"):$PATH"'
		echo 'fi'
		echo "# <<< tax-pulse node24 <<<"
	} >> "$BASHRC"
fi

# Ensure the pinned pnpm from package.json "packageManager" is available.
corepack enable >/dev/null 2>&1 || true

# --- Project bootstrap ---
# Local SQLite connection string used by the server env schema.
if [ ! -f .env ]; then
	printf 'DATABASE_URL=file:local.db\n' > .env
fi

# Install dependencies from the committed lockfile.
corepack pnpm install --frozen-lockfile

# Create/upgrade the local SQLite database from Drizzle migrations.
corepack pnpm run db:migrate

echo "Environment ready: Node $(node -v), pnpm $(corepack pnpm -v)"
