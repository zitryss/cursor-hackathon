# SalBot production-engineering notes

Branch: `SalBot` only. Tax Pulse `/` untouched.

## Architecture (chat → verdict → persist)

1. **Input** — free text (+ optional image name stub / voice stub) on `/salbot`.
2. **Parse** — `parseSpend` extracts description + amount; Work/Mixed/Private chips bias the haystack.
3. **Verdict** — reuses `assessDeductibility` / `roughTaxImpactEuro` from year-file **heuristic** (shared logic, not shared storage).
4. **Chat persist** — `salbot-chat-v1` via `salbot-store.ts`.
5. **Akte persist** — `salbot-akte-v1` via `salbot-akte-store.ts` (isolated from Tax Pulse `year-file-pulse-v1`).

Trust boundary: browser localStorage only; no server; heuristic ≠ advice.

## Failure modes

| Failure | Behavior |
| --- | --- |
| Corrupt chat JSON | `loadChat` returns `[]` |
| Corrupt Akte JSON | `loadSalBotAkte` returns empty year-file shape |
| Missing/invalid amount on Save | no-op (no default €40) |
| Double Save / same message id | idempotent (`savedToFile` + `akte-${messageId}`) |
| Oversized / non-image file | rejected; name not set |
| Mid-write crash | last successful `setItem` wins; no cross-key writes |

## StBerG / not-advice

Persistent `NOT_ADVICE` copy in header + footer:
`Keine Steuerberatung / keine Rechtsberatung (StBerG). Heuristik zur Orientierung — not tax advice.`

## TaxML seam (later)

- Keep `assessDeductibility` behind a narrow interface (`AssessSpend` → verdict/share/why).
- Akte store already keyed separately; TaxML adapter can replace heuristic without touching Tax Pulse storage.
- Do not implement TaxML in this pass.

## Voice / image stubs

- Voice: Web Speech API only when present; no remote audio upload.
- Image: `accept="image/*"`, max 5MB, **filename only** — no bytes uploaded, no remote URLs.

## Landed in this PE pass

- Akte key isolation: `salbot-akte-v1` (no writes to `year-file-pulse-v1` from SalBot)
- StBerG not-advice one-liner (constant, two surfaces)
- Validation: chat input clamp, amount required on Save, chat sanitize on load
- Idempotent Akte save by message id
- Image stub size/type guard

## Deferred

- TaxML implementation
- Real OCR / WhatsApp
- Server auth / sync
- Merging to `main`
