# FreeIEP

The IEP workspace anyone can use. Clocks, measurable goals, dated evidence, meetings, and a family view. **Not the official IEP.** Totally free. No Pro, no feature gates.

## Run

```bash
npm i
npm run dev -- --port 3002
```

Open http://localhost:3002

Zero environment variables required. Data lives in `data/store.json`. Uploads live in `data/uploads`.

## Demo auth

There is no password. On `/login`, enter an email and click **Send link**. The page shows a clickable `/login?token=...` URL (and the server logs it). Same pattern for family invites and meeting Accept / Suggest / Decline links (stored tokens, 14-day expiry) at `/r/:token`. Meeting reply works with no account.

If `RESEND_API_KEY` exists later, you can send those URLs by email. Mail is optional. `APP_ORIGIN` defaults to `http://localhost:3002`.

## Optional env

| Name | Required | Purpose |
|---|---|---|
| `APP_ORIGIN` | no | Absolute origin for magic links |
| `RESEND_API_KEY` | no | Unused in this demo; reserved for later mail |
| `TOKEN_SECRET` | no | Reserved; tokens are stored server-side with expiry |

## What this is not

- Not a district IEP form overlay or SIS
- Not 504, Medicaid, state reporting, or eligibility
- Not an attorney and not legal advice
- Students never get accounts
- Default path uses **no LLM**. Assist is Settings, bring-your-own-key only, and is hidden without a key. FreeIEP will not invent minutes or placement.

## Reviewer path

1. Start free, magic link, create workspace (school, state, accept Privacy + Terms)
2. **Sample caseload** (3 students; Rivera annual is Overdue)
3. Open a student, write 2 goals (metric + target required), log 3 points, chart
4. Export Plan PDF and Progress PDF
5. Family tab, invite, open the shown magic link, `/family` (clay chrome)
6. Meetings, propose slots, confirm via `/r/:token` with no account
7. PWN-lite on the Meetings tab; family acknowledges; both timestamps stay on the case
