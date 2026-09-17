# SalBot / Taxfix Chat Check (experiment)

**Branch:** `SalBot` only. **Does not replace Tax Pulse** on `/` (film path).

## Win thesis
People already text friends about spends. SalBot puts Taxfix in that chat:
voice note or text (`coworking 45` / `Bahn 28.50`) → instant deductible? + why + rough EUR → **Save to file** dossier (weekly / YTD). Optional image stub (no OCR). WhatsApp documented; this UI is the Telegram-style live stand-in.

## UVP
- ~20s to know if a spend helps a refund
- See weekly EUR grow — useful in November
- Honest maybe / no
- No nag, mascot, or points

## How to run
```bash
pnpm install   # if needed
pnpm run dev   # humans only
```
- SalBot chat: http://127.0.0.1:5173/salbot
- Tax Pulse film path: http://127.0.0.1:5173/

## Chat film demo script (~90s)
1. Open `/salbot` (empty or hit **Reset chat**).
2. Tap chip **coworking 45** → show likely + why + rough EUR → **Save to file** → weekly/YTD moves.
3. Tap **Bahn 28.50** → maybe → Save.
4. Tap **Netflix 12.99** → unlikely → Save (honest no).
5. Optional: tap **Voice** (Web Speech or mock transcript) → Send.
6. Line: "I'd text this in November — not because Taxfix nagged me."
7. Do **not** film over Tax Pulse `/` unless intentional; Eugene owns that path.

## WhatsApp (docs only)
Needs Meta Business + WhatsApp Cloud API / BSP, webhooks, templates. Too heavy tonight — use `/salbot` as UX prototype.

## Orchestration
See `HOW-WE-BUILT-SALBOT.md`.