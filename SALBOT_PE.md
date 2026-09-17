# SalBot production-engineering notes

Branch: `SalBot` only. Tax Pulse `/` untouched.

## Architecture (chat â†’ verdict â†’ persist)

1. **Input** â€” free text (+ optional image name stub / voice stub) on `/salbot`.
2. **Parse** â€” `parseSpend` extracts description + amount; Work/Mixed/Private chips bias the haystack.
3. **Verdict** â€” reuses `assessDeductibility` / `roughTaxImpactEuro` from year-file **heuristic** (shared logic, not shared storage).
4. **Chat persist** â€” `salbot-chat-v1` via `salbot-store.ts`.
5. **Akte persist** â€” `salbot-akte-v1` via `salbot-akte-store.ts` (isolated from Tax Pulse `year-file-pulse-v1`).

Trust boundary: browser localStorage only; no server; heuristic â‰  advice.

## Failure modes

| Failure | Behavior |
| --- | --- |
| Corrupt chat JSON | `loadChat` returns `[]` |
| Corrupt Akte JSON | `loadSalBotAkte` returns empty year-file shape |
| Missing/invalid amount on Save | no-op (no default â‚¬40) |
| Double Save / same message id | idempotent (`savedToFile` + `akte-${messageId}`) |
| Oversized / non-image file | rejected; name not set |
| Mid-write crash | last successful `setItem` wins; no cross-key writes |

## StBerG / not-advice

Persistent `NOT_ADVICE` copy in header + footer:
`Keine Steuerberatung / keine Rechtsberatung (StBerG). Heuristik zur Orientierung â€” not tax advice.`

## TaxML seam (later)

- Keep `assessDeductibility` behind a narrow interface (`AssessSpend` â†’ verdict/share/why).
- Akte store already keyed separately; TaxML adapter can replace heuristic without touching Tax Pulse storage.
- Do not implement TaxML in this pass.

## Voice / image stubs

- Voice: Web Speech API only when present; no remote audio upload.
- Image: `accept="image/*"`, max 5MB, **filename only** â€” no bytes uploaded, no remote URLs.

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

## Demo reset / race (reliability pass)

- **Stale React Akte state:** `addExpenseToSalBotAkte` always merges from `localStorage` (`salbot-akte-v1`), not the React `yearFile` closure â€” rapid Saves cannot drop prior rows.
- **Save mutex:** `savingRef` blocks overlapping Save clicks while state updates flush.
- **Reset Demo:** clears `salbot-chat-v1` **and** `salbot-akte-v1`, resets in-memory Akte, stops voice recognition â€” week/YTD and chat both return to empty demo.
- **Still isolated:** SalBot never reads/writes `year-file-pulse-v1`.

## Demo Mode autoplay + voice (post-6c7ecd5)

- Shared wipeSalBotDemoSurface() for Reset + Demo start: stop mic, clear chat+Akte keys, canonical saveChat([WELCOME]) so persist effect cannot resurrect prior transcript.
- saveBotMessage uses savingRef mutex; Akte merge still from localStorage inside ddExpenseToSalBotAkte.
- Voice fallback unified via pplyVoiceFallback (API missing / onerror / start throw) → MOCK_VOICE_TEXT from DEMO_SCRIPT[0], edit-or-Send path.

