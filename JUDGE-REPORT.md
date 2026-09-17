# TaxPulse — How we built (judge report)

**Team:** TaxPulse · Sal · Eugene · Shirley · Sam  
**Hackathon:** Taxfix × Cursor · Berlin · 17 Sep 2026  
**Product on stage:** TaxFix Card (silent film) + Tax Pulse (live habit loop)

Open this on your phone. Scroll in 60 seconds.

---

## One sentence

Four humans, Cursor, Grok Bot, and a Hermes agent fleet fused competing ideas into one story under a hard 21:00 film gate — then Sal spoke for two minutes while the silent deck ran.

---

## The challenge we chased

**Make taxes year-around** — not another April reminder. People spend all year; TaxFix should ride that year, not only the deadline.

---

## What we shipped vs what we sold

| Layer | What it is |
|--------|------------|
| **Film (vision)** | TaxFix Card — Keep / Keep / Skip → receipts → year → € proof |
| **Live product** | Tax Pulse — weekly keep/skip habit on `/` |
| **Honest path** | Card via licensed BaaS / BIN partner (months, not a banking licence) |
| **EU framing** | Not a US unbanked refund card. Not EU interchange. Win = **retention** |

We told the jury the truth: the film is the product vision; the pulse is what runs today.

---

## How four people’s ideas became one product

We did **not** merge every branch. We **picked a spine** and kept the best of each lane.

1. **Eugene** — timed silent pitch machine (`feat/taxfix-card-pitch`): 120s deck, TaxFix design language, Keep/Skip mime. Became the **film spine**.
2. **Shirley + Sam** — Tax Pulse on `main` / Shirley: typed weekly expense → deductible? → € this week / YTD. Became the **live habit** we can demo.
3. **Sal** — war-room lead from phone: challenge capture, scope cuts, pitch VO, submit veto. Also ran a **SalBot** chat exploration in parallel — kept as research; not the film.
4. **Synthesis (Hackermans / Grok Bot)** — compared `main`, Shirley, SalBot, and the card branch; refused bank-connect / payments / reminder spam; locked **TaxPulse** as team name and **TaxFix Card** as the story.

**Rule of the night:** complementary ideas stay; competing surfaces get one winner. Card film for emotion. Pulse for proof. Chat bot parked.

---

## Multi-agent stack (what actually ran)

### Cursor (organizer credits + Pro)
- IDE Agent + Composer on Sapne (home machine) and Eugene’s laptop for demo runtime
- Cloud Agents for parallel polish (docs, pitch copy, phone-frame UX burns)
- Credits treated as a scarce resource: burn on visible demo quality, not busywork

### Grok Bot — Hackermans (war-room lead)
- Ruthless scope after the challenge drop
- Lane assigns, clock ownership (~19:00–21:15)
- Pitch narrative, VO scripting, EU-card honesty pass
- Coordination of teammates without bot↔bot chatter loops (1:1 command path)

### Hermes Titans (via ivan)
- Parallel seats for `TEAM-PLAN/`, copy packs, acceptance/clock docs
- Heavy coding overflow when Cursor seats were saturated

### Specialist Grok agents (on call)
- **cursor** — Cursor craft + credit discipline  
- **coder** / **feedback** — specs and critique when asked  
- Shared truth folder: `TEAM-PLAN/` (lanes, refuse list, demo, score)

**Pattern:** one human owner per stage · agents multiply speed · humans keep judgment and submit veto.

---

## Timeline (compressed)

| Window | Move |
|--------|------|
| Pre-check / challenge | Sal on phone → Hackermans scopes to year-round pulse |
| Parallel build | Shirley/Sam pulse · Eugene card film · SalBot probe · Titans docs |
| Ruthless cut | Card film = submit surface · Pulse = live proof · SalBot = off-film |
| Pre-21:00 | Silent video + Drive upload (slow Wi-Fi accounted for) |
| Stage | 2 min live VO under the silent film |

---

## Why this is a Cursor / multi-agent story

We did not “vibe one chat.” We ran **named lanes**, a **shared plan folder**, **visible agent seats**, and a **hard refuse list** so the clock could not invent scope.

Cursor was the coding cockpit. Grok Bot was the war room. Titans were the parallel factory. Humans decided what to kill.

That combination is how four people’s ideas fit in one two-minute film.

---

## Links in this repo

- Film branch: `feat/taxfix-card-pitch`
- Live pulse: `/` on `main`
- Plan: `TEAM-PLAN/`
- Refuse list: `TEAM-PLAN/REFUSE.md`
- Short trail: `HOW-WE-BUILT.md`

---

*TaxPulse · Built with Cursor + Grok Bot + Hermes Titans · Humans on judgment.*
