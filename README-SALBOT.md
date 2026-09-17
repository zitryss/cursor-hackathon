# SalBot (experiment branch)

Parallel Sal lane. **Does not replace Tax Pulse** (the `/` film path on `main` / `year-file-pulse`).

## What it is
Chat-style UI at **`/salbot`**: send text describing a spend (+ optional amount) → reply with deductible? + why + rough EUR, reusing `app/features/year-file/deductibility` (same heuristic as Tax Pulse).

- Optional image upload is a **stub** (filename noted; **no OCR**).
- Telegram-oriented framing (paste text like a chat).
- WhatsApp: **document only** — Meta WhatsApp Business API / BSP is too heavy for tonight. See below.

## How to run
```bash
pnpm install   # if needed
pnpm run dev   # humans only — agents must not start this
```
Open: http://127.0.0.1:5173/salbot

Tax Pulse film path stays: http://127.0.0.1:5173/

## Try
- `coworking day pass 45`
- `Bahn to client meeting 28.50`
- `Netflix 12.99`

## WhatsApp (docs only)
To ship WhatsApp later you need: Meta Business portfolio, WhatsApp Business account, a BSP or Cloud API app, webhook verify token, and template/session message rules. Out of scope for SalBot tonight — use this web chat as the UX prototype.

## Branch rule
Push only to `origin/SalBot`. Do not merge into the Tax Pulse demo path without Sal + Hackermans.