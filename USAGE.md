# TaxLens — usage

> TaxLens finds the opportunity. Taxfix helps you capture it, prepare it, and claim it.

TaxLens puts the **potential tax-adjusted price** of a work-related purchase on
the shop page, at the moment the decision is made. The extension is only the
trigger surface — everything durable lands in **My Tax Plan** inside the app.

```text
Browser plugin  →  detects opportunities
Taxfix app      →  manages decisions and documents
Tax return      →  completes the value
```

---

## What is in the repo

| Path | What it is |
| --- | --- |
| `packages/taxlens-core/` | The estimate engine and Tax Plan state machine. Pure TypeScript, no DOM, no storage. Both surfaces import it, so a number shown on a shop page is the same number the app files later. |
| `extension/` | The real browser extension, built with [WXT](https://wxt.dev). Content script, popup, `browser.storage`. |
| `app/features/taxlens/` | The web prototype: a mock retailer page (`/shop`) and My Tax Plan (`/tax-plan`). |

Storage is per-surface on purpose: the extension writes to `browser.storage`,
the app writes to `localStorage`. In production both would sync through a
scoped Taxfix API. Nothing in this prototype leaves the browser.

---

## Install

Either package manager works — the workspace is declared twice, in
`package.json` (`workspaces`, read by bun) and in `pnpm-workspace.yaml`. **Keep
the two lists in sync when you add a package.**

```bash
bun install      # what Sam runs
pnpm install     # equivalent
```

Node `>=24 <25`.

---

## Run the web prototype

```bash
bun dev          # or: pnpm dev
```

| Route | What it shows |
| --- | --- |
| `/shop` | Mock retailer page, €2,000 ProBook 14, with the TaxLens panel inline. |
| `/tax-plan` | My Tax Plan: saved items, missing invoices, readiness, monthly digest. |
| `/` | The existing Tax Pulse prototype (unchanged). |

`/shop` renders the panel inline so the flow demos **without installing the
extension**. It is the same component and the same engine as the real one.

---

## Run the real extension

```bash
cd extension
bun dev                  # Chrome, with hot reload
bun dev:firefox          # Firefox
bun run build            # production build → extension/.output/
```

WXT's dev command launches a browser with the extension already loaded. To load
a build by hand: `chrome://extensions` → Developer mode → **Load unpacked** →
`extension/.output/chrome-mv3`.

### Where it activates

The content script runs only on the hosts in `wxt.config.ts`:

```text
localhost, 127.0.0.1          ← the demo shop
amazon.de, mediamarkt.de, notebooksbilliger.de
```

It reads the product from the page's own schema.org / OpenGraph markup
(`extension/lib/product-detector.ts`) and stays silent unless the category is
one TaxLens is willing to estimate for. With the app dev server and the
extension dev command both running, open `http://localhost:5173/shop` and the
panel is injected into a shadow root — no page-specific code involved.

### Permissions

`storage` plus host permissions for the supported retailers. No `tabs`, no
history, no continuous browsing access. A product is stored only when the user
presses **Save to Taxfix**.

---

## The demo (60 seconds)

1. **`/shop`** — €2,000 laptop. Collapsed TaxLens sits next to the price.
2. **Open the panel** — 80% work use is pre-filled from the Taxfix profile.
   €1,600 tax-relevant · €480 potential effect · **€1,520 tax-adjusted cost**.
3. **Drag the slider to 50%** — every number moves live, €1,700.
4. **Save to Taxfix** → saved state → **Remind me to save the invoice**.
5. **Open My Tax Plan** — the item is there as "Considering purchase".
6. **"Did you buy the ProBook 14?" → Yes, upload invoice** — readiness climbs.
7. The monthly digest is the reason to come back, once a month, not daily.

Closing line:

> We did not build another chatbot. We brought Taxfix to the moment where the
> decision happens.

**Reset between runs:** "Reset demo plan" at the bottom of `/tax-plan`.
**Skip ahead:** "Load demo plan" seeds three months of captured items.

---

## The calculation

Deliberately simplified, and labelled as an estimate everywhere it appears:

```text
tax-relevant = price × work use
benefit      = tax-relevant × illustrative marginal rate
adjusted     = price − benefit
```

Demo profile: employee, Germany, tax year 2026, €55,000 income, 30% illustrative
marginal rate, above the employee allowance.

Real treatment depends on employment status, the tax year, total work-related
expenses, allowances already used, depreciation rules, employer reimbursement,
VAT status and documentation quality. The UI never claims a guaranteed saving.

---

## Checks

```bash
bun run test        # unit tests, incl. packages/taxlens-core
bun run typecheck
bun run verify      # biome + typecheck + db:check + test + build
cd extension && bun run typecheck
```

Playwright is not part of this work — don't run `verify:full` for it.

---

## Notes for review

- `app/routes.ts` gains `/shop` and `/tax-plan`. Nothing existing was changed.
- `app/styles/globals.css` gains `--taxfix-*` brand tokens from `DESIGN.md`.
  The existing hardframe tokens are untouched.
- Root `tsconfig.json` now excludes `extension/` — it resolves `#imports`
  through WXT's generated types, not the app's config.
- `AGENTS.md` still says pnpm everywhere. Both managers work; update it if the
  team wants to settle on one.
