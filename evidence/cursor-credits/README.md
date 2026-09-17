# Cursor credit-burn evidence log

## Account identity (machine state, not Usage UI)
- Sapne Cursor process: running (many Cursor.exe PIDs)
- Sentry scope email extracted from %APPDATA%\Cursor\sentry\scope_v3.json: **salahuddinuqaili@outlook.com**
- Sal confirmed Usage UI still **$50 / 0%** (his screenshot) — credits unused

## Blocked paths (this agent)
1. **Cloud Agents**: launch rejected — "not available on your current plan. Upgrade to Pro"
2. **Sapne GUI drive**: remote Shell cannot SendKeys / interactive desktop ("Access is denied") — cannot open Settings → Account or Agent panel from Grok Shell
3. **Grok Bot box**: desktop has Chrome + Terminal only — **no Cursor IDE installed** yet; Sal said he will log into Cursor on box PC

## Screenshots captured
- desktop-before.png / cursor-foreground.png — Sapne primary display (Cursor may be on another display / session)
- Failed: Settings Account UI (SendKeys denied)

## Next (Sal)
1. Install/open Cursor on Grok Bot box OR stay on Sapne interactive session
2. Login salahuddinuqaili@outlook.com
3. Settings → Account → screenshot Usage before
4. Run Agent/Composer on SalBot with a real prompt
5. Screenshot Usage after — that is the only credit-burn proof

Product tip freeze remains (d298643 / later polish SHAs) — exception is credit evidence only.
