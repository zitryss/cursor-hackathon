# DEMO-SALBOT — 70s film card (SalBot, not Tax Pulse)

**Film this:** `http://127.0.0.1:5173/salbot` then `http://127.0.0.1:5173/how-we-built`  
**Do not film `/` as the product.** Tax Pulse on `/` is Eugene’s path. SalBot is the chat experiment.

Locked to live UI on `origin/SalBot` @ `1a8aa2f` (`app/features/salbot/route.tsx`, `app/features/how-we-built/route.tsx`).  
If the screen disagrees with this card, **the screen wins**.

---
## ORGANIZER RULE — pitch VIDEO is SILENT
- **No audio track** in the export (≤2 min). Mute UI / system sounds while filming.
- **No voiceover in the file.** Sal speaks **live on stage** while the silent video plays.
- On-screen captions / UI copy are OK. The "Say / Talk track" columns below are **live stage VO**, not burn-in audio.
- Prefer: Demo Mode one-tap → hold orch strip → optional `/how-we-built`.

---

## One-tap loop (what Demo Mode actually does)

Header button: **Demo Mode (one tap)** → label flips to **Demo running…**

| Beat | User scrap | Context | Auto-save | On-screen beat (template) |
| --- | --- | --- | --- | --- |
| 1 | `coworking day pass 45` | Work | yes → **Save to Akte** | `{label}? If work → typically absetzbar · +€ this week. Want it in your Akte?` |
| 2 | `Bahn to client meeting 28.50` | Mixed | yes → **Save to Akte** | `Mixed signal — keep the receipt · +€ if the business share holds. Want it in your Akte?` |
| 3 | `Netflix 12.99` | Private | **no** | `Looks private — honest no for the Akte (Netflix/pizza stay out). Client meal? Say so.` + chip **Refusal kept the Akte honest** |
| Close | — | — | — | `Weekly {€} in the Akte. I'd text this in November — not because Taxfix nagged me.` |

Welcome bubble (already on screen before the tap):  
`Drop a scrap like you text a friend — "Bahn 12,40 Buero" or "Laptop 899". One clear beat back. No forms. No nag.`

---

## 70s shot list

| t | Where | Camera | Live VO (stage only; video stays silent) |
| --- | --- | --- | --- |
| **0–8s** | `/salbot` | Hold the header. Do not tap yet. | Eyebrow **SalBot / Taxfix Chat Check**. H1 **Text a spend**. Strip **Live orchestration** with four named seats: **Cursor Agent** `Sapne · $50 · 6c7ecd5→5a99d2b`, **Titans** `plan · docs`, **coder** `PE · Akte · bdb349e→5a99d2b`, **Hackermans** `scope · clock`. Caption: *Useful in November. Soft certainty. No nag.* StBerG line stays on screen — do not skip it. |
| **8–18s** | `/salbot` | Tap **Demo Mode (one tap)**. Hold the chat. | *No forms. One tap.* Typing indicator **SalBot is typing…** then coworking scrap. Soft yes → **Save to Akte** becomes **In your Akte**. Akte week / YTD ticks. |
| **18–32s** | `/salbot` | Stay on chat. | Bahn mixed beat: keep the receipt, still saved. Point at **Work / Mixed / Private** chips only if they are visible — do not open a form. |
| **32–48s** | `/salbot` | Netflix beat + close bubble. | *A confident wrong euro is a failure. A refusal is success.* Chip **Refusal kept the Akte honest**. Do **not** tap **Save anyway**. Close line about November, not nag. |
| **48–50s** | `/salbot` | Finger on **How we built** in the orch strip. | *Visible seats, not sprawl.* |
| **50–58s** | `/how-we-built` | **8 seconds. Full page. No scroll-tour.** | Eyebrow **Multi-agent orchestration · Definition of Done**. H1 **Built with Cursor Agent**. First paragraph: *one clear loop* + *visible seats*. Soft pitch line: *a confident wrong euro is a failure; a refusal is success.* Glance **Parallel seats** (Sal · Hackermans · Cursor Agent · Titans · coder). DoD bullet: `/salbot` Demo Mode: coworking → Bahn → Netflix → Akte. Stop. |
| **58–70s** | back `/salbot` or freeze last `/how-we-built` frame | Face or UI, not architecture. | *Chat beats forms. Honest no kept the Akte clean. Not tax advice.* End. |

Total = 70s. If you overrun, cut 18–32s (Bahn is the same loop as coworking). **Never cut 50–58s.**

---

## Talk track (≤12 lines, say only this)

1. Text a spend. No forms. No nag.
2. Four seats on screen — Cursor Agent on Sapne, Titans, coder, Hackermans.
3. Demo Mode, one tap.
4. Coworking — typically absetzbar — Save to Akte.
5. Bahn — mixed — keep the receipt.
6. Netflix — honest no. Refusal kept the Akte honest.
7. Weekly euros in the Akte because I’d text this in November.
8. How we built — eight seconds.
9. One loop, visible seats, hard gates.
10. Tax Pulse on `/` is untouched.
11. Keine Steuerberatung. Not tax advice.
12. Stop talking.

---

## Pre-roll (60s, not on camera)

- Eugene: `pnpm run dev` → `/salbot` loads, **Demo Mode (one tap)** visible, orch strip populated.
- Hard refresh `/salbot`. If an old chat is in the way, clear it before record (do not narrate the clear).
- Phone portrait, 9:16, max-w on `/salbot` is `max-w-md` — fill the frame with the chat, not desktop chrome.
- Audio: tap click on Demo Mode must be audible; do not talk over the Netflix refusal.
- Do **not** open `/` except the tiny **Tax Pulse /** link if you must prove the film path is still there (optional, ≤1s, silent).

---

## Jury map (why these shots)

| Criterion | Pixel |
| --- | --- |
| Chat > forms | Welcome *No forms. No nag.* + one-tap Demo Mode. No year-file form on camera. |
| Named seats | Live orchestration strip (4 seats) + `/how-we-built` Parallel seats (5, includes Sal). |
| Valuable refusal | Netflix → **Refusal kept the Akte honest** (fovea / bar-loop). |
| Observable orchestration | 8s on `/how-we-built` Handoffs + Definition of Done. |
| StBerG | Header caption stays in 0–8s. |

---

## Refuse on camera

Do not say or show: reminders, streaks, mascot, bank connect, Gmail mining, OCR-as-path, Elster, architecture tours, “Titans wrote SalBot alone.”  
If asked after the 70s: *Typed pulse is the habit; bank, Gmail, and card fill Tax Pulse later — with consent.*

---

## Owners

| Who | Does |
| --- | --- |
| **Sal** | Record this card, upload, present, veto |
| **Eugene** | Keep `pnpm run dev` on `/salbot` |
| **Hackermans** | Clock. If over 70s, cut Bahn hold, never cut `/how-we-built` |
| **cursor / Titans / coder** | Frozen for film — no commit during record unless Sal GO |

Upload target: Sal’s 21:00 slot. This card is the shot list, not the video file.

