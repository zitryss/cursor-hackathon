# cursor-hackathon

Taxfix Cursor Hackathon Berlin.

Two prototypes live here:

- **TaxLens** — a browser extension that shows the potential tax-adjusted price
  on the shop page, feeding a year-round **My Tax Plan** inside the app.
- **Tax Pulse** — the weekly tax-save pulse at `/`.

See `TEAM-PLAN/` for shared truth (lanes, demo, score).

## TaxLens

> What if every price tag showed its tax-adjusted price?

Taxfix already answers tax questions after you open the app. TaxLens brings that
intelligence to the moment the money is actually decided — and the extension is
only the trigger surface:

```text
Browser plugin  →  detects opportunities
Taxfix app      →  manages decisions and documents
Tax return      →  completes the value
```

A €2,000 laptop used 80% for work shows **€1,520** instead. Saving it puts the
item, the assumption and the missing invoice into a plan that is waiting when
tax season arrives.

| Path | What it is |
| --- | --- |
| `packages/taxlens-core/` | Shared estimate engine + Tax Plan state machine |
| `extension/` | The WXT browser extension (content script, popup) |
| `app/features/taxlens/` | `/shop` mock retailer and `/tax-plan` |

**Full setup, demo script and review notes: [`USAGE.md`](./USAGE.md).**

### Demo path (60 seconds)

1. Open `/shop` — €2,000 ProBook 14, TaxLens collapsed beside the price.
2. Expand: 80% work use → €1,600 tax-relevant, €480 effect, **€1,520**.
3. Move the slider — every number updates live.
4. **Save to Taxfix**, then activate the invoice reminder.
5. Open `/tax-plan` — the item is there; answer "Did you buy it?" and readiness
   climbs.

## Tax Pulse

1. Open `/` (index is the pulse).
2. Add this week’s expense (try `coworking day pass` + `45`).
3. Instant readout: deductible? why? **€ save this week / YTD**.
4. Tax Pulse + filing confidence grows.
5. Return reason: open next week to see the score — no nags.

Counter scaffold remains at `/counter`.

## How to run

```bash
bun install      # pnpm install also works
bun dev
```

Node `>=24 <25`. Agents must not start the dev server if Sal already has it.

The workspace is declared in both `package.json` (`workspaces`, for bun) and
`pnpm-workspace.yaml` (for pnpm) — keep the two lists in sync.

## Pitch VIDEO

Follow `TEAM-PLAN/DEMO.md`. Upload by **21:00** Berlin. Sal owns upload + present.

## Agent trail

See [`HOW-WE-BUILT.md`](./HOW-WE-BUILT.md) and `TEAM-PLAN/HOW-WE-BUILT.md`.
