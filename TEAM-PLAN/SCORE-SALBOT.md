# SCORE-SALBOT — 25% × 4 + 25s (chat > forms)

**Product (this lane):** SalBot / Taxfix Chat Check on `/salbot`
**Does not replace** Tax Pulse film path on `/`. That SCORE lives in `TEAM-PLAN/SCORE.md`.
**Live:** `http://127.0.0.1:5173/salbot` after `pnpm run dev` (humans only).
**Reuse:** `app/features/year-file/deductibility` + isolated SalBot Akte. No forked tax logic.

Jury scores **25% × 4**. This card maps **chat > forms** onto those pillars, then a **25s spoken beat**. Reminders stay on the refuse list — they are not the headline. Named seats are on the live strip + `/how-we-built`.

| Pillar (25%) | How SalBot hits it | Chat > forms (say this) |
| --- | --- | --- |
| Innovation | One scrap in the chat people already use. Voice or text (`coworking 45`) → one soft beat + rough EUR. Honest **no** on Netflix. Welcome: **No forms. No nag.** | Tax Pulse `/` is two labeled fields + **Check deductibility**. SalBot is one textarea. We did not ship a prettier form. |
| Multi-agent | Visible seats, not a slide. Live strip on `/salbot`: **Hackermans** · **Cursor Agent** · **Titans** · **coder**. **Sal** on `/how-we-built` (capture, veto, pitch). | Four tiles on screen during the 25s. Q&A opens `/how-we-built`. |
| taxfix scope | Voluntary loop: **Save to Akte** → week / YTD / confidence. Zero reminders, nudges, points, mascot, streaks. | You open `/salbot` in November because the **euro moved** — not because a form or a nag told you to. |
| Demo quality | Working `/salbot`: **Demo Mode (one tap)** or chips → soft beat → **Save to Akte** → Akte week/YTD. Voice or mock. Image = caption stub (no OCR). | Three seeds in ~25s of screen. Do **not** steal `/` from Eugene’s film. |

## 25s spoken beat (chat > forms)

Time this out loud. Hard out **0:25**. No architecture. No WhatsApp. No bank.

**0:00–0:07 — problem**
Tax apps are forms. Description. Amount. Submit. Taxfix is a July panic button. People already text friends about spends.

**0:07–0:18 — product (on `/salbot`)**
SalBot puts Taxfix in that chat. Tap **coworking 45** — if work, typically absetzbar, euros this week. **Bahn 28.50** — mixed, keep the receipt. **Netflix 12.99** — looks private. Save to Akte. Week / YTD moves.

**0:18–0:25 — why chat > forms**
I didn't fill a tax form. I texted a spend. Named seats on screen. I'd text this in November.

## Contrast (if jury asks “isn't `/` the product?”)

| | Tax Pulse `/` (forms) | SalBot `/salbot` (chat) |
| --- | --- | --- |
| Capture | Two fields: **What did you spend on?** + **Amount (EUR)** | One scrap: `Bahn 12,40 Buero` / `Laptop 899` |
| Action | **Check deductibility** | **Send** / chip / **Voice** |
| Return | Instant read card + pulse list | Soft beat + **Save to Akte** |
| Film | Eugene 70s on `/` — do not steal | This 25s on `/salbot` |

Same three seeds. Same deductibility heuristic. Different habit: chat, not a tax form.

## On-screen holds (if jury watches, not just hears)

Live copy is a **soft beat**, not the old verdict labels. Optional **Work / Mixed / Private** chips hint context; demo chips (or **Demo Mode**) still drive the 25s.

| t | Chip / action | Instant read (live beat) | This week (sketch) |
| --- | --- | --- | ---: |
| 1 | coworking 45 | If work → typically absetzbar · Save to Akte | ~13,50 € |
| 2 | Bahn 28.50 | Mixed signal — keep the receipt · Save to Akte | ~4,28 € |
| 3 | Netflix 12.99 | Looks private — skip, or was it a client meal? · Save anyway | 0,00 € |

End hold: header **Akte week / YTD** after three Saves. Linger on Netflix **private**. That is the clever beat.

Optional 2s: **Live orchestration** tiles (Hackermans / Cursor Agent / Titans / coder). **First cut if over 25s.**

Sketch math (shared heuristic, 30% demo rate): coworking 45 × 1.0 × 0.3; Bahn 28.50 × 0.5 × 0.3; Netflix share 0. Not tax advice.

## Named seats (Q&A — not the 25s)

Strip on `/salbot` is four tiles. Sal is the fifth seat on `/how-we-built`. Do not invent Sal on the strip.

| Seat | Where | One line |
| --- | --- | --- |
| **Sal** | `/how-we-built` | Phone capture, veto, pitch video |
| **Hackermans** | strip + `/how-we-built` | Ruthless scope · clock |
| **Cursor Agent** | strip + `/how-we-built` | Sapne co-drive · $50 credits · shipped `/salbot` |
| **Titans** | strip + `/how-we-built` | TEAM-PLAN / SCORE / docs in parallel |
| **coder** | strip + `/how-we-built` | PE: Akte isolation, StBerG |

Trail: `HOW-WE-BUILT-SALBOT.md` · `/how-we-built` · this file.

## Refuse on the 25s (and on camera)

Do not say or show: reminders, nudges, push, streaks, badges, mascot, points, fake urgency, WhatsApp Cloud API as shipped, payments, bank AIS, OCR-as-path, Elster, architecture tours, “don’t forget”, “we killed Tax Pulse”.

**If asked WhatsApp (one line):** “Meta Business + templates are later. This Telegram-style chat is the live stand-in tonight.”
**If asked bank (one line):** “Typed/voice pulse is the habit; bank is how we fill the Akte later — with consent.”
**If asked forms (one line):** “`/` is still the form film. `/salbot` is chat > forms — one scrap, not two fields.”

## Evidence (do not claim more)

- Route: `app/features/salbot/route.tsx` (`/salbot`) — welcome **No forms. No nag.** · live orchestration strip · Demo Mode
- Store: `app/features/salbot/salbot-store.ts` (`salbot-chat-v1`) · isolated Akte (not Tax Pulse `year-file-pulse-v1`)
- Tax logic: `app/features/year-file/deductibility.ts` (shared)
- Seats page: `app/features/how-we-built/route.tsx` (`/how-we-built`)
- Form contrast: `app/features/year-file/route.tsx` (`/` — two fields, leave it)
- Runbook: `README-SALBOT.md`
- Orch: `HOW-WE-BUILT-SALBOT.md`
- SHAs: `002e4e0` · `76a4054` · `423f7f6` · `6c7ecd5` (Demo Mode + live strip) · tip `d1b3a0f`
- Tax Pulse SCORE (other product): `TEAM-PLAN/SCORE.md` — leave it; this file is SalBot only
