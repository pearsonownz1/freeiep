# FreeIEP marketing pages — copy deck for Developer

**Do this next.** Add these routes to the Next app. Use `FREEIEP-BRAND.md` and `tokens.css`. Do not copy SyncIEP sentences, screenshots, or “Nora”. This is original FreeIEP copy.

Shared rules for every page:
- CTA: **Start free** → `/login`. Secondary: **Log in**.
- One meadow primary button. Family mentions use clay.
- Footer on every public page (spec at the bottom).
- Title format: `{Page} · FreeIEP`
- Meta description: use the given `description`.
- Legal footer line: “Not the official IEP. Not legal advice.”
- No pricing table with paid tiers. No fake logos or testimonials.

Existing routes to keep and upgrade: `/` `/login` `/privacy` `/terms`. New routes listed below.

---

## Shared footer (every marketing page)

Match this IA (same map as SyncIEP’s footer, FreeIEP names):

**Brand (left)**
- Mark + wordmark FreeIEP
- Line: “The IEP workspace anyone can use.”
- Line: “Clocks, goals, evidence, and a family view. No card.”

**Features**
- Caseload → `/features/caseload`
- Plan & goals → `/features/plan`
- Progress → `/features/progress`
- Meetings → `/features/scheduling`
- Family portal → `/features/family-portal`
- Privacy → `/features/privacy`
- It’s free → `/pricing`

**Who it’s for**
- Case managers → `/for/case-managers`
- Co-teachers → `/for/co-teachers`
- Service providers → `/for/service-providers`
- Families → `/for/families`
- Administrators → `/for/administrators`

**Resources**
- All resources → `/resources`
- Uses → `/uses`
- Alternatives → `/alternatives`
- Research → `/research`
- The IEP timeline → `/resources/iep-timeline`
- Writing measurable goals → `/resources/measurable-goals`
- A family’s guide to the meeting → `/resources/family-iep-meeting-guide`

**Company**
- Create an account → `/login`
- Log in → `/login`
- Terms → `/terms`
- Privacy → `/privacy`

---

## Home `/`

**title:** FreeIEP · The IEP workspace anyone can use  
**description:** Free caseload clocks, measurable goals, progress you can date, and a family view. Not the official IEP. No card.

**H1 (serif, two lines):** The IEP workspace  
anyone can use.

**Lede:** Clocks, goals, and a family view. No card. No district wait.

**Primary:** Start free  
**Note under button:** Takes a minute. Students never get accounts.

**Three columns**
1. **Keep the dates honest** — Annual, reevaluation, and progress-report windows sit on the student, not in a spreadsheet.
2. **Write a goal you can measure** — A goal will not save without a metric and a target. Log what happened. See the line move.
3. **Let family in** — They see only what you publish. They can confirm a meeting from an email link with no account.

**What it is not (plain list):** Not your district’s IEP form. Not Medicaid. Not state reporting. Not an attorney.

**How a week looks**
1. Add a student. Set the annual date.
2. Write two goals with numbers.
3. Log three points from class.
4. Publish a progress note the family can read.
5. Propose two meeting times. They pick one.

**Close:** Start free. The official IEP still lives where your district keeps it.

---

## Features

### `/features/caseload`

**H1:** One board for the whole caseload  
**Lede:** Every student, the next date that matters, overdue in red. Empty state is “Add your first student,” not a blank database.

**Body**
- Name, grade, next clock, overdue pill.
- Open a student and you are in the case: plan, progress, meetings, files, family.
- CSV import: name, grade, annual date, reevaluation date. You map columns. We do not talk to your SIS.
- Sample caseload button for a first look.

**Not this:** live PowerSchool sync, Medicaid minutes claiming, a director command center (that is later).

### `/features/plan`

**H1:** A plan you can export, not a fake district form  
**Lede:** Present levels, goals with metrics, accommodations, and services you type yourself.

**Body**
- Present levels: strengths, needs, baselines. Autosave.
- Goal: title, metric, baseline, target, timeline. No metric, no save.
- Services and minutes are human-typed. FreeIEP will not invent them.
- Export a Plan PDF. Header says “Not the official IEP.”

**Not this:** overlay of Frontline/SEIS/EasyIEP PDFs. No 50-state goal bank in this version.

### `/features/progress`

**H1:** Progress is a date and a number  
**Lede:** Log a value in the goal’s unit. Optional photo (stored, not auto-scored). Chart baseline, points, target.

**Body**
- “Log progress” from the student page. Phone-friendly.
- Click a point to see the note and photo.
- Publish a progress report: you write 2–4 sentences per goal. PDF. Toggle “Family can see this” (off by default).

**Not this:** AI summaries unless you add your own API key in Settings. No OCR scoring yet.

### `/features/scheduling`

**H1:** One invite, not an email chain  
**Lede:** Propose one to three times. Staff and family answer. First yes that works is the time.

**Body**
- Meeting types: annual, amendment, reevaluation.
- Family can Accept / Suggest / Decline from a link. No account required.
- `.ics` download. Google/Outlook connect is later.
- A brief box: what gen-ed should know. You write it.

**Not this:** scanning your whole calendar. We do not read existing events in this version.

### `/features/family-portal`

**H1:** Family sees the same student, not a different story  
**Lede:** Invited by you. One child. Only what you publish.

**Body**
- Home: “Waiting on you” (unsigned notice, unconfirmed meeting), then progress in plain language (“12 of 20 words correct”).
- Document library is published files only. Staff notes stay staff.
- Clay chrome so it does not look like the staff app.
- Meeting reply works from email even if they never sign in.

**Not this:** a parent advocacy letter factory. We do not draft due-process mail.

### `/features/privacy`

**H1:** Student records are not a growth strategy  
**Lede:** FERPA-minded. US hosting. No ads. No sale of records. No training a model on your caseload.

**Body**
- Magic link or Google. Students never create accounts.
- Family sees one student, deny-wins.
- Export JSON + files. Delete a student, files go within 30 days.
- Assist (optional) is your key. Prompts are not stored. We will not send photos to a model in this version.
- Full policy: `/privacy`. Terms: `/terms`.

---

## `/pricing`

**H1:** It’s free.  
**Lede:** Every feature. No trial cliff. No Pro.

**Body**
- Case manager: $0.
- Family: $0.
- Invited co-teachers and providers: $0.
- No per-student fee. No card.

**What you still pay:** your time, and if you turn on Assist, your own model key.

**What you do not get for $0 (honest):** we are not your district IEP system. We do not file PEIMS, EMIS, CALPADS, or Florida Matrix. We do not bill Medicaid.

**CTA:** Start free

---

## Who it’s for

### `/for/case-managers`

**H1:** Built for the person who owns the case  
**Lede:** You add the student. You write the goals. You send the invite. The week lives here. The official form still lives at the district.

**Jobs:** clocks, measurable goals, dated points, meeting slots, PWN-lite, family publish.

### `/for/co-teachers`

**H1:** What to try today, not a 40-page PDF  
**Lede:** See accommodations and goals for students on your roster. Log a data point from class. You cannot delete the case.

**Note:** Extra team roles ship after the family portal. If invite is not in the build yet, say “coming next” and still use this page.

### `/for/service-providers`

**H1:** Minutes and notes on the same student  
**Lede:** Log a session against a goal the case manager already wrote. The family can see progress if the teacher publishes it.

**Not this:** Medicaid claiming.

### `/for/families`

**H1:** One place the school actually invited you to  
**Lede:** See goals in plain language. Sign or acknowledge what’s waiting. Pick a meeting time from your email.

**You will not see:** other children, staff-only notes, anything unpublished.

**This is not:** a tool for writing demand letters. If you need advocacy, that’s a different product.

### `/for/administrators`

**H1:** Start with one teacher  
**Lede:** A case manager can begin today. No procurement. No DPA wait to try it (still read Privacy). A school-wide rollup is not in this version.

**Honest:** if you need state reporting and official forms, keep your district system. FreeIEP sits beside it.

---

## Resources

### `/resources`

**H1:** Short guides. No newsletter wall.  
**Cards:**
- The IEP timeline → `/resources/iep-timeline`
- Writing measurable goals → `/resources/measurable-goals`
- A family’s guide to the meeting → `/resources/family-iep-meeting-guide`
- Uses → `/uses`
- Research notes → `/research`

### `/resources/iep-timeline`

**H1:** The IEP timeline, without the fog  
**Intro:** This is a plain-language sketch of common IDEA clocks in the US. Your state can be shorter. Your district’s official dates win. FreeIEP is not legal advice.

**Sections (write as short paragraphs, not a legal memo):**
1. **Referral and consent.** School gets a request to evaluate. They need your consent to start.
2. **Initial evaluation.** Many places use about 60 days from consent. Some states are tighter.
3. **Eligibility and the first IEP.** If the student qualifies, the team writes the first plan. Services start by the date on that plan.
4. **Progress reports.** As often as the IEP says. Often quarterly. The number should match the goal’s metric.
5. **Annual review.** At least once a year. The team looks at progress and updates the plan.
6. **Reevaluation.** At least every three years, unless the team agrees otherwise. Sometimes sooner.
7. **Notice.** Before the school proposes or refuses a change in identification, evaluation, placement, or FAPE, they owe you written notice. Your district may have a required form. FreeIEP’s notice is a record your team can keep. It does not replace a required district form.

**Close:** Put the dates on the student in FreeIEP so they do not live in a spreadsheet.

### `/resources/measurable-goals`

**H1:** A goal is a number you can see change  
**Intro:** If you cannot graph it, it is a hope, not a goal.

**Pattern:** By [date], given [condition], [student] will [skill] at [metric], from [baseline] to [target], as measured by [source].

**Good:** By May 15, given a fourth-grade passage, Jordan will read 92 words correct per minute, up from 61, on three of four weekly probes.

**Weak:** Jordan will improve reading. Jordan will try their best. Jordan will be successful in class.

**In FreeIEP:** metric, baseline, target, and timeline are required. We do not save a goal that is only a sentence.

**We do not:** invent service minutes or placement from a goal.

### `/resources/family-iep-meeting-guide`

**H1:** A family’s guide to the IEP meeting  
**Intro:** You are part of the team. The meeting should not feel like a briefing you were not invited to.

**Before**
- Ask for the draft and recent progress in time to read them.
- Write two things that work at home and two that do not.
- Know the time. If it is wrong, say so. In FreeIEP you can pick a slot from email.

**During**
- Present levels should sound like your child, not a test code.
- Every goal needs a number. Ask “How will we know?”
- Services and minutes are a team decision. Software should not invent them.
- You can ask for a break.

**After**
- You should get the plan and any notice in writing.
- In FreeIEP, published progress and acknowledgments stay on the student.

**Close:** This is not legal advice. For rights in your state, ask your parent center or an attorney.

---

## `/uses`

**H1:** How people actually use FreeIEP  
**Lede:** Same product. Different door.

Index cards (title + one line + link):

| Title | Path | One line |
|---|---|---|
| Caseload for a case manager | `/uses/caseload-management-app-for-special-education-teachers` | Dates and students on one board. |
| Writing the plan | `/uses/iep-writing-software-for-special-education-teachers` | Present levels and goals you can export. |
| Present levels | `/uses/iep-present-levels-generator` | Three boxes: strengths, needs, baselines. You write. Assist is optional. |
| Measurable goals | `/uses/iep-goal-bank-aligned-to-state-standards` | Required metric. Standard code is optional text, not a 50-state bank yet. |
| Deadline tracker | `/uses/iep-deadline-tracker` | Annual, reeval, progress windows. |
| Annual review tracker | `/uses/iep-annual-review-tracker` | The annual date lives on the student. |
| Meeting scheduler | `/uses/iep-meeting-scheduler` | Propose slots. Family answers from email. |
| Family portal | `/uses/iep-parent-portal-software` | Published progress only. |
| Prior written notice | `/uses/prior-written-notice-software-for-special-education` | PWN-lite. Not your district’s official form. |
| Progress for SLPs | `/uses/iep-progress-monitoring-software-for-slps` | Trials and percents on the same goal. |
| Progress for school psychologists | `/uses/iep-progress-monitoring-for-school-psychologists` | Dated points. Not a full BIP module. |
| Progress for resource teachers | `/uses/progress-monitoring-software-for-resource-teachers` | Log from class. Photo optional. |
| FERPA-minded workspace | `/uses/ferpa-compliant-iep-software` | Roles, export, delete, no ads. |
| One teacher | `/uses/iep-software-for-a-single-special-education-teacher` | Start today. No contract. |
| Small districts | `/uses/iep-software-pricing-for-small-districts` | $0. Still not state reporting. |
| Cost per student | `/uses/iep-software-cost-per-student` | $0. |
| Private schools | `/uses/iep-software-for-private-schools` | Word is not a caseload. |
| Charter schools | `/uses/iep-software-for-charter-schools` | Same free workspace. |
| Charter networks | `/uses/iep-software-for-charter-networks` | Start per campus. No network rollup yet. |
| Microschools | `/uses/iep-software-for-microschools` | Tiny team, same clocks. |
| Co-ops | `/uses/iep-software-for-special-education-co-ops` | Shared students later. Today: one workspace. |
| Texas ARD | `/uses/texas-ard-software` | Meetings and clocks. Not PEIMS. |
| Florida | `/uses/florida-iep-software` | Not Matrix of Services. |
| Illinois | `/uses/illinois-iep-software` | US IDEA clocks. |
| Ohio | `/uses/ohio-iep-software` | Not EMIS. |
| Mid-year start | `/uses/switch-iep-software-mid-year` | Import a CSV. Keep the district form. |
| Moving records | `/uses/migrating-iep-data-to-a-new-system` | CSV + PDF export. No SIS pipe. |
| Directors | `/uses/iep-compliance-tracking-for-special-education-directors` | One teacher first. No district dashboard yet. |
| Optional Assist | `/uses/ai-iep-writing-assistant` | BYOK only. Never minutes or placement. |
| Assist on progress notes | `/uses/ai-progress-monitoring-for-special-education` | Optional rewrite. You accept. |

**Template for every `/uses/*` page (do not invent extra claims):**

```
H1: {Title}
Lede: {One line from the table}. FreeIEP is not the official IEP.

What you do
- 3 bullets that map to shipped features only.

What you do not get
- 2 bullets of honest non-goals.

CTA: Start free
Related: 2 links to feature or resource pages.
```

**Use-specific “What you do not get” lines (must appear on that page):**
- Texas: “Not PEIMS. Not a state reporting system.”
- Florida: “Does not calculate Matrix of Services or file with the state.”
- Ohio: “Does not submit to EMIS.”
- Illinois: “Not ISBE’s official IEP system.”
- Cost / small district / one teacher: “$0. You still need your district form for the legal IEP.”
- AI pages: “Hidden unless you add your own API key. We do not run a shared model. We will not invent minutes, placement, eligibility, or data points.”
- PWN: “If your district requires a specific notice form, use that form. This is a dated record on the case.”
- Goal bank: “No 50-state standards pack yet. Standard code is optional text.”
- Directors: “No multi-school dashboard in this version.”
- Migrate / mid-year: “No Frontline/SEIS connector. CSV in, Plan PDF out.”

---

## Alternatives

### `/alternatives`

**H1:** How FreeIEP sits next to other tools  
**Lede:** We are free. We are not the system of record. Pick the row that is true.

**Table (render as cards on mobile):**

| If you need | Use | FreeIEP |
|---|---|---|
| Official state IEP forms, Medicaid, state reporting | Frontline, PowerSchool Special Programs, SEIS, EasyIEP, Embrace, SpedTrack, SameGoal | No. Sit beside them. |
| AI writers and gen-ed snapshots, IEP stays in the district system | Playground IEP | We are the working case + family view, not a Copilot suite. |
| Goal-writing PD and strategy banks | Goalbook | Not our product. |
| A paid all-in-one that fills the district PDF | SyncIEP | We do not overlay the official form. We cost $0. Family portal and clocks are the overlap. |
| Parent-only advocacy (letters, cited law, hidden from school) | IEP Compass, IEP Desk, IEP Guardian | We are school-invited. Not a demand-letter tool. |

**Links:**
- `/alternatives/playground-iep`
- `/alternatives/synciep`
- `/alternatives/frontline-iep`
- `/alternatives/goalbook`
- `/alternatives/spedtrack`
- `/alternatives/embrace-iep`

### Alternative page template

**H1:** FreeIEP and {Name}  
**Lede:** Different job. Do not rip their marketing.

Then three headings: **What they are for** (2–3 factual sentences, no invented pricing if you are unsure), **What FreeIEP is for**, **What we will not claim**.

**Playground:** They sit between SIS and IEP software. Snapshots, Copilot writers, scheduling. No parent login. FreeIEP: family portal, required metrics, $0, no official-form fill. We are not a gen-ed snapshot product first.

**SyncIEP:** Paid educator workspace that drafts on the district PDF with an assistant, photo-scored progress, family portal. FreeIEP: same *jobs* we can do without a model bill and without form overlay. Do not clone their screens.

**Frontline / Embrace / SpedTrack:** District system of record. FreeIEP does not replace them.

**Goalbook:** PD and goal quality. FreeIEP stores the goal you write.

Each page ends: “Not affiliated with {Name}.”

---

## Research

### `/research`

**H1:** Notes, not a journal  
**Lede:** Short pieces with sources. No fake statistics.

**Card:**
- Special education staffing pressure → `/research/special-education-teacher-shortage-statistics`

### `/research/special-education-teacher-shortage-statistics`

**H1:** Why a free workspace is even a conversation  
**Body (keep sourced and modest):**
- Special education has been a shortage area in the US for years. Districts report unfilled SPED posts more often than many other teaching fields. Cite NCES / US Dept of Ed teacher shortage area lists and CEC commentary. Do **not** invent a percentage. If you cannot pull a current public figure at build time, write: “Shortage designations are published annually by the Department of Education. Check the current shortage-area list for your state.” Link: https://tsa.ed.gov
- Paperwork is the usual complaint next to caseload size. FreeIEP does not fix hiring. It keeps clocks and progress off a personal spreadsheet.
- **Do not** claim FreeIEP reduces burnout by a number.

---

## Company / legal (upgrade existing)

### `/privacy` (replace thin page if needed)

**H1:** Privacy  
Cover: what we collect (name, email, school, student records you enter, files), why (to run the workspace), FERPA school-official framing, no sale, no ads, no model training on student data, US hosting, family scope, export, 30-day delete, breach email to workspace owners within 72 hours, contact placeholder `privacy@freeiep.org`. Students do not create accounts. COPPA: not for children as users.

### `/terms`

**H1:** Terms  
Cover: educator/provider or invited family only, $0, not the official IEP, not legal advice, you are responsible for what you enter, Assist is optional and your key, we can take a workspace down for abuse, US law placeholder (you can set state later).

### `/login`
Keep demo magic link. Add a line: “No password. We’ll show the link on this page in demo.”

---

## Implementation notes for Developer

1. Shared `MarketingFooter` + `MarketingHeader` (mark, Start free).
2. Shared `DocPage` layout: serif H1, 38rem prose for resources, wider for feature grids.
3. Feature and For pages: H1, lede, 2–3 sections, CTA band.
4. Uses pages: one React template + a `uses.ts` array from the table above so you are not hand-writing 29 layouts.
5. Alternatives: one template + `alternatives.ts`.
6. Do not add SyncIEP, Playground, or Frontline logos without permission. Text names only.
7. Sitemap.xml should list these public routes.
8. Skip Slice 8 work until these pages render. Home and footer first, then features, for, resources, uses template, alternatives, research.

**Acceptance:** every footer link 200s with the copy above, not lorem, not SyncIEP paste.
