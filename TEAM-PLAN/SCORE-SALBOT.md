# SCORE-SALBOT — 25% × 4 + 25s (chat vs reminders)

**Product (this lane):** SalBot / Taxfix Chat Check on `/salbot`
**Does not replace** Tax Pulse film path on `/`.
**Live:** `http://127.0.0.1:5173/salbot` after `pnpm run dev` (humans only).
**Reuse:** `app/features/year-file/deductibility` + year-file Akte. No forked tax logic.

Jury scores **25% × 4**. This card maps **chat vs reminders** onto those pillars, then a **25s spoken beat**. Leave `TEAM-PLAN/SCORE.md` for Tax Pulse.

| Pillar (25%) | How SalBot hits it | Chat vs reminders (say this) |
| --- | --- | --- |
| Innovation | Taxfix lives in the chat people already use. Voice or text (`coworking 45`) → one soft beat + rough EUR. Honest **no** on Netflix. | Reminders invent a habit. Chat **is** the habit. We did not invent a ping. |
| Multi-agent | Sal → Hackermans scope → cursor on Sapne (`SalBot`) + Titans TEAM-PLAN; Shirley/Sam if present. Trail: `HOW-WE-BUILT-SALBOT.md` + this file. | Named seats, one owner per file. Reused Tax Pulse deductibility — did not fork. |
| taxfix scope | Voluntary loop: **Save to Akte** → week / YTD / confidence. Zero reminders, nudges, points, mascot, streaks. | You open `/salbot` in November because the **euro moved**, not because Taxfix nagged. |
| Demo quality | Working `/salbot`: chips → soft beat → **Save to Akte** → Akte week/YTD. Voice or mock. Image = caption stub (no OCR). | Three seeds in ~25s of screen. Do **not** steal `/` from Eugene’s film. |

## 25s spoken beat (chat vs reminders)

Time this out loud. Hard out **0:25**. No architecture. No WhatsApp. No bank.

**0:00–0:07 — problem**
People already text friends about spends. Taxfix is a July panic button. Reminders would be theatre.

**0:07–0:18 — product (on `/salbot`)**
SalBot puts Taxfix in that chat. Tap **coworking 45** — if work, typically absetzbar, euros this week. **Bahn 28.50** — mixed, keep the receipt. **Netflix 12.99** — looks private. Save to Akte. Week / YTD moves.

**0:18–0:25 — why not reminders**
I’d text this in November — not because Taxfix nagged me. No reminder. No points. The product is the chat plus the euro.

## On-screen holds (if jury watches, not just hears)

Live copy is a **soft beat**, not the old verdict labels. Optional **Work / Mixed / Private** chips hint context; demo chips still drive the 25s.

| t | Chip / action | Instant read (live beat) | This week (sketch) |
| --- | --- | --- | ---: |
| 1 | coworking 45 | If work → typically absetzbar · Save to Akte | ~13,50 € |
| 2 | Bahn 28.50 | Mixed signal — keep the receipt · Save to Akte | ~4,28 € |
| 3 | Netflix 12.99 | Looks private — skip, or was it a client meal? · Save anyway | 0,00 € |

End hold: header **Akte week / YTD** after three Saves. Linger on Netflix **private**. That is the clever beat.

Sketch math (shared heuristic, 30% demo rate): coworking 45 × 1.0 × 0.3; Bahn 28.50 × 0.5 × 0.3; Netflix share 0. Not tax advice.

## Refuse on the 25s (and on camera)

Do not say or show: reminders, nudges, push, streaks, badges, mascot, points, fake urgency, WhatsApp Cloud API as shipped, payments, bank AIS, OCR-as-path, Elster, architecture tours, “don’t forget”.

**If asked WhatsApp (one line):** “Meta Business + templates are later. This Telegram-style chat is the live stand-in tonight.”
**If asked bank (one line):** “Typed/voice pulse is the habit; bank is how we fill the Akte later — with consent.”

## Evidence (do not claim more)

- Route: `app/features/salbot/route.tsx` (`/salbot`)
- Store: `app/features/salbot/salbot-store.ts` (`salbot-chat-v1`)
- Tax logic: `app/features/year-file/deductibility.ts` (shared)
- Runbook: `README-SALBOT.md`
- Orch: `HOW-WE-BUILT-SALBOT.md`
- Tax Pulse SCORE (other product): `TEAM-PLAN/SCORE.md` — leave it; this file is SalBot only
