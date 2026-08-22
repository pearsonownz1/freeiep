# FreeIEP — MVP specification

**For:** Developer  
**From:** SyncIEP  
**Product:** FreeIEP (`freeiep.com` if available; app hosts `app.freeiep.org` staff, `family.freeiep.org` families)  
**Constraint:** Totally free. No paid SKU. No feature gate. No “Pro”. If a feature costs money to run at scale, it is out of MVP or it is bring-your-own-key.

This is a **new product**, not a reskin of SyncIEP or Playground. Do not copy their copy, component names, mascots (no Nora, no Copilot), screenshots, or visual system. The *job* is the same category: help a case manager keep an IEP week in one place, and let a family see the same student in plain language.

---

## 1. What we are building

A **web workspace** for US IDEA IEP teams that a single special education teacher can start today with no district contract.

**The product is the working case, not the legal IEP.** The official document still lives in Frontline / SEIS / EasyIEP / Word. FreeIEP holds clocks, goals, evidence, meeting times, and a family view. Export is a clean PDF the teacher can attach or re-key. We do **not** overlay a district’s official IEP form in MVP.

**One sentence:** Add a student, write goals you can measure, log what actually happened, keep the annual dates honest, and let the family see progress without a fight.

---

## 2. Who it is for (MVP)

| Role | Can they start alone? | What they do |
|---|---|---|
| **Case manager** (primary user and only paid-equivalent seat, except we charge $0) | Yes | Owns the case. Creates students, goals, clocks, meetings, invites. |
| **Family / educational rights-holder** | Invite only, free | Signs in (or replies to a meeting link with no account). Sees published progress, documents, meeting times. Signs/acks. |
| **Co-teacher / provider** (stretch if time) | Invite only | Sees accommodations + goals on assigned students. Can add a data point. Cannot delete the case. |

**Out of MVP as users:** district admin dashboards, advocates, students (no student accounts, COPPA).

Terms copy: user must be an educator/provider acting in a professional capacity, or an invited family member.

---

## 3. Why a teacher would use this instead of the district system

District IEP software is the time clock. FreeIEP is the week.

- District tool: state form, eligibility, Medicaid, reporting. Ugly, slow, no family-readable progress.
- Playground: AI writers + gen-ed snapshots. Output is copy-paste. No family login. Individuals currently free Copilot.
- SyncIEP: live district PDF + Nora + photo-scored mastery + family portal. $10/teacher. AI bill.

**FreeIEP wedge:** the caseload + clocks + measurable goals + dated evidence + family view, **with zero AI required** and **zero card**. We win teachers who will not pay $10 and districts that will not sign a DPA for a paid vendor yet.

---

## 4. Non-goals (do not build)

- Live editing of a district’s official IEP PDF / form library
- SIS connectors (PowerSchool, Infinite Campus, Skyward, SEIS write-back)
- 504, MTSS, EL, gifted, BIP authoring, eligibility determinations
- Medicaid billing / service claiming
- State reporting (PEIMS, EMIS, CALPADS, Florida Matrix)
- Autonomous AI decisions, auto-filing into the official IEP
- Parent-advocacy letter factory, due-process templates, “cite IDEA at the school”
- Native iOS/Android apps
- Paid plans, usage metering that locks features, ads against student data
- Training foundation models on student records
- A public student directory or social feed

---

## 5. How “totally free” stays alive

This is a product constraint, not a slogan.

1. **Default path uses no LLM.** Drafting is structured forms. Teachers type. Templates are static.
2. **Assist (optional)** is **bring-your-own-key** (OpenAI / Anthropic). Key is stored per-user, encrypted, never logged. If no key, Assist is hidden. Do not put a shared vendor key on the server in MVP.
3. **Photo OCR / auto-score** is post-MVP. MVP progress is manual (number + note + optional photo stored, not scored).
4. **Hosting:** cheap Postgres + object storage. Cap uploads (10 MB / file, 50 files / student in MVP).
5. **Email:** transactional only (invite, magic link, meeting). No marketing blasts.
6. **Legal:** FERPA school-official framing. Privacy policy + terms before first student. Simple DPA PDF download (even if not SDPC-listed yet). US-only hosting.

If you have to choose between a clever AI feature and shipping clocks + family view, ship clocks + family view.

---

## 6. Object model

```
Workspace
  users[] (role: owner | member | family)
  students[]
    profile (name, local_id optional, grade, state, disability_category optional)
    documents[] (file, kind, published_to_family bool)
    iep_plan
      present_levels (plain text sections: strengths, needs, baselines)
      goals[]
        title
        metric (enum: percent_accuracy | wcpm | trials | rubric | count | custom)
        baseline, target, unit, timeline_date
        standard_code optional (free text in MVP, not a 50-state bank)
        objectives[] optional
      accommodations[] (plain text list)
      services[] (name, minutes, frequency — **typed by human**, never AI-invented)
    data_points[] (goal_id, date, value, note, photo_url optional, author_id)
    clocks[] (kind, due_on, assigned_to, status)
    tasks[] (title, due_on, done, student_id, assignees[])
    meetings[] (type, status, slots[], attendees[], confirmed_at, notes)
    notices[] (PWN-lite: body, sent_at, acked_at)
    activity[] (who, verb, object, at)
```

**Clock kinds (MVP):** `annual_review`, `reevaluation`, `progress_report`, `meeting_notice`.  
Optional later: `initial_eval_60`.

**Meeting types (MVP):** `annual`, `amendment`, `reeval`. Status: `drafted` → `finding_time` → `confirmed` → `done`.

**Deny-wins access:** family sees only their student and only `published_to_family` docs + published progress reports. Staff-only notes never leak. Co-teacher/provider sees only assigned students.

---

## 7. Screens (build in this order)

### Slice 0 — Shell
- Marketing: one page. Headline, 3 jobs, “Start free”, privacy one-liner, no pricing table.
- Auth: email magic link **or** Google. No password-complexity theater if magic link works.
- Create workspace (school name, state). Accept terms + privacy.
- App chrome: left nav (Caseload, Calendar, Settings). Student page is the unit of work.

### Slice 1 — Caseload + student
- Caseload board: student, next clock, overdue in **Sun** (see brand). Empty state: “Add your first student.”
- Add student (name, grade, state required).
- Student home: clocks strip, goals list, recent activity, “Add data”, “Schedule meeting”.
- Bulk CSV import: name, grade, annual_date, reeval_date. Column mapper. Validate, then create. No SIS.

### Slice 2 — Plan (present levels + goals)
- Present levels: three text areas (strengths, needs, baselines). Autosave.
- Goal editor: title, metric, baseline, target, timeline. Cannot save a goal without a metric and a target.
- Accommodations: simple list.
- Services: name + minutes + frequency. Label in UI: “You type this. FreeIEP will not invent minutes or placement.”
- Export **Plan PDF** (our layout, not a district form). Filename `Lastname_plan_YYYY-MM-DD.pdf`.

### Slice 3 — Progress
- “Log progress” on a goal: date (default today), value in the goal’s unit, optional note, optional photo upload (stored, not OCR’d).
- Goal chart: baseline, target, points over time (simple SVG). Click point → note + photo.
- **Publish progress report:** picks date range, pulls points, teacher writes 2–4 sentences per goal (template stubs allowed). Generates PDF. Toggle “visible to family”.
- No voice notes, no AI summaries unless BYOK Assist is on (see §11).

### Slice 4 — Clocks + tasks
- On student create/edit, set annual and reeval dates. Progress-report cadence: quarterly default or custom next date.
- Caseload sorts by soonest overdue.
- Tasks: “Send notice”, “Log data”, “Attach eval”. Check-off. Nudge is a simple in-app reminder, not SMS.

### Slice 5 — Meetings
- Propose 1–3 slots. Add attendees by email (staff or family).
- Email: “Accept / Suggest other / Decline” links that work **without an account** (signed token, 14-day expiry).
- First slot that works auto-confirms. Write a calendar `.ics` attachment. Google/Outlook OAuth is **nice-to-have**, not Slice 5 blocker.
- Role brief: one text box the case manager fills (“What gen-ed should know”). Not an AI brief.

### Slice 6 — Family portal
- Invite family by email. They get a magic link. One student only.
- Home: “Waiting on you” (unsigned notice, unconfirmed meeting), then goal progress in **plain language** (show metric as “12 of 20 words correct”, not raw JSON).
- Document library: only published files.
- Meeting reply UI (same as token links).
- No family-to-family anything. No other students.

### Slice 7 — PWN-lite
- Template: date, student, “we propose / refuse”, description, reasons, options considered. Teacher fills blanks.
- Send to family via portal + email. Timestamp `acked_at` when they click acknowledge.
- Store on the case. Not legal advice. Footer: “This is a record your team keeps. It is not a substitute for your district’s official notice if your district requires a specific form.”

### Slice 8 — Team (if time)
- Invite co-teacher/provider by email. Role scoped. They can add data points and view accommodations.
- Activity trail: “Maya logged 80% on Goal 2”, “Family acked notice”.

**Do not start Slice 8 before Slice 6.** Family view is the product difference vs Playground.

---

## 8. Acceptance criteria (MVP is done when)

A case manager can, in one sitting, without paying:

1. Create a workspace and a student.
2. Write 2 goals with real metrics.
3. Log 3 data points and see a chart.
4. See an annual date turn red when overdue (or a seeded demo student).
5. Export a Plan PDF and a Progress PDF.
6. Invite a family member who can open the student and see **only** published progress.
7. Propose a meeting; family confirms from email with no account.
8. Send a PWN-lite; family acknowledges; both timestamps show on the case.

If 6–7 are missing, it is not FreeIEP. It is a notes app.

---

## 9. Suggested stack (opinionated, change if you have a reason)

- **App:** Next.js (App Router) + TypeScript
- **DB:** Postgres (Supabase or Neon). Row-level security by workspace + role.
- **Auth:** magic link + Google
- **Files:** S3-compatible, private, signed URLs, virus-scan if cheap; otherwise type/size allowlist (pdf, png, jpg, webp)
- **Email:** Resend or Postmark
- **PDF:** server-side (react-pdf or similar), our brand
- **Charts:** no heavy analytics suite; one small chart component
- **Hosting:** Vercel/Fly + US region only
- **No:** client-side student data in third-party analytics. If you add Posthog/etc., scrub PII.

Seed a **demo workspace** toggle for QA (“Load sample caseload of 3 students”).

---

## 10. Privacy and safety (ship with Slice 0–1)

- Privacy + terms pages before any student field is saved.
- Encryption in transit (TLS) and at rest (provider default + private buckets).
- Roles: deny-wins. Family never listed on caseload of another teacher.
- Export my data (JSON + files). Delete student: purge files within 30 days (say 30, do 30).
- No ads. No sale of records. No model training on records.
- AI Assist: student names stripped from prompts where possible; never send photos to a model in MVP; log only that a call happened, not the prompt body.
- Breach: email workspace owners within 72 hours (policy text).
- Students do not create accounts.

---

## 11. Optional Assist (BYOK only)

Hidden unless Settings → “Add your own API key”.

Allowed actions:

- Rewrite present levels for clarity (input = current text, output = suggestion, teacher must accept).
- Turn a goal title + metric into a cleaner SMART sentence.
- Plain-language a progress note for the family view.

Forbidden:

- Invent service minutes, placement, eligibility, disability, or data points.
- Draft a full IEP from an empty student.
- Send the official-form PDF or eval batteries to a model in MVP.

UI: every suggestion is a **proposal** with Accept / Edit / Toss. Same interaction pattern as a careful IEP tool, different name. Call it **Assist**, not Nora, not Copilot.

---

## 12. Information architecture

```
/                       marketing
/privacy  /terms        legal
/login    /r/:token      auth + family/meeting tokens
/app                    caseload
/app/students/new
/app/students/:id       tabs: Plan | Progress | Meetings | Files | Family
/app/calendar
/app/settings           workspace, members, assist key, export/delete
/family                 family home (host or /family route)
```

Mobile: responsive web. Caseload and “Log progress” must work on a phone. No native app.

---

## 13. Copy rules (product UI)

- Talk like a tired teacher, not a vendor. “Annual is in 12 days.” not “Upcoming compliance event.”
- Never say we replace the district IEP.
- Never say we are an attorney.
- Metrics in human units.
- Empty states tell you the next click.
- Errors say what to do.

---

## 14. Phased after MVP (do not build now)

1. Photo auto-score (OCR + metric).  
2. Google/Outlook free/busy.  
3. District form overlay / PDF fill.  
4. 50-state goal standards pack.  
5. Admin rollup.  
6. Open-source the app if we want the civic AIEP lane.

---

## 15. Definition of done for Developer

- Repo with the slices above, in order, each slice mergable.
- Brand tokens from `FREEIEP-BRAND.md` and `tokens.css` applied. No leftover default shadcn look-alike purple.
- Sample data button.
- README: how to run, env vars, what is out of scope.
- Do not implement a pricing page.

Ship Slice 1–6 before polishing marketing illustrations.
