# FreeIEP — brand and styling guideline

**For:** Developer  
**Use with:** `tokens.css` in this folder. Put these values in CSS variables. Do not invent a second palette.

FreeIEP should feel like a **public school document that someone finally made kind**: paper, ink, a meadow green for action, a warm clay for family. It must not look like Stripe, Notion, Playground (soft purple/blue SaaS), or a legal-tech dashboard.

---

## 1. Brand in one line

**The IEP workspace anyone can use.**

We are free the way a library is free. Not cheap. Not a trial. Not “open source slop.” Calm, readable, slightly analog.

---

## 2. Name and lockup

- **Name:** FreeIEP (one word, capital F, capital IEP).
- **Never:** Free IEP, freeIEP, Free-Iep, FREEIEP in UI.
- **Wordmark:** `Free` in the sans at regular weight, `IEP` in the same sans at semibold. No space. Tracking −0.02em on the lockup.
- **Mark:** a **rounded square, 8px radius**, fill Meadow (`#2F6B4F`). Inside: two white vertical bars like a simple progress chart, last bar taller (growth). 3px gap, bars 3.5px wide, bottom-aligned. No mascot. No apple. No puzzle piece (avoid disability cliché). No graduation cap.
- **Clear space:** 0.5× the square on all sides.
- **Smallest mark:** 24px.
- **Favicon:** the mark only, no word.
- **Do not** put the mark on a gradient. Do not outline it in gold.

Incorrect: puzzle-piece logos, “AI” sparkles, neural-net glyphs, stock kids-holding-hands.

---

## 3. Voice

**Sound:** a colleague at the next table. Short sentences. Concrete dates and numbers.

**We say:** “Annual is overdue.” “Family can see this.” “You type the minutes. We won’t.”  
**We don’t say:** revolutionize, leverage, seamless, next-gen, unlock, empower, compliance engine, synergy.

**Punctuation:** periods and commas. No exclamation points in product UI. Marketing may use one, not three.

**Reading level:** family-facing strings at ~6th grade. Staff UI can be technical but never jargon for its own sake.

**Bilingual (later):** plan UI strings so Spanish can land. MVP English only is fine; don’t hard-code sentence order that can’t invert.

---

## 4. Color

All UI color comes from these tokens. No extra brand hues.

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#F7F4EE` | App background |
| `--paper-raised` | `#FFFcf7` | Cards, dialogs, inputs |
| `--ink` | `#1C1917` | Primary text |
| `--ink-soft` | `#57534E` | Secondary text |
| `--line` | `#E8E4DC` | Borders, dividers |
| `--meadow` | `#2F6B4F` | Primary action, links, mark |
| `--meadow-deep` | `#1F4A37` | Primary hover / pressed |
| `--meadow-soft` | `#E3EDE7` | Selected row, chips |
| `--clay` | `#C45C26` | Family / shared-with-home |
| `--clay-soft` | `#F8EBE3` | Family-portal tint, “visible to family” |
| `--sun` | `#C98806` | Warning, due soon (≤14 days) |
| `--sun-soft` | `#F8EFC9` | Warning surfaces |
| `--berry` | `#A33B2B` | Overdue, errors, destructive |
| `--berry-soft` | `#F6E4E1` | Error surfaces |
| `--focus` | `#2F6B4F` | Focus ring (2px, offset 2px) |

**Rules**

- Default theme is light. No dark mode in MVP (family print/PDF must match).
- Primary buttons: meadow fill, white label.
- Secondary: paper-raised, ink label, 1px `line` border.
- Destructive: berry text, berry-soft fill, never meadow.
- **Family** anything uses clay, not meadow. A “Published to family” pill is clay-soft + clay text.
- **Overdue** is berry. **Due soon** is sun. **On track** is meadow. Don’t use traffic-light green that isn’t meadow.
- Charts: one series in meadow; baseline a dashed ink-soft; target a solid clay line (target = what we’re aiming for, slightly warm).
- Never use pure `#000` or `#FFF` except photo lightbox chrome.
- Never use purple, electric blue, or neon.

---

## 5. Type

**UI / body:** [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans)  
**Document titles and marketing headlines:** [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4)

Why: IEP is a document. Serif on big titles makes FreeIEP feel like paper, not another AI app. Plex keeps tables and forms honest.

| Role | Font | Size | Weight | Line |
|---|---|---|---|---|
| Display (marketing h1) | Source Serif 4 | 40–48px | 600 | 1.15 |
| Page title (app) | Source Serif 4 | 28px | 600 | 1.2 |
| Section | IBM Plex Sans | 16px | 600 | 1.3 |
| Body | IBM Plex Sans | 15px | 400 | 1.5 |
| UI / labels | IBM Plex Sans | 13px | 500 | 1.3 |
| Meta / clocks | IBM Plex Sans | 12px | 500 | 1.3 |
| Numbers on charts | IBM Plex Sans | 12px tabular | 500 | — |

- Tabular nums on clocks, metrics, caseload dates (`font-variant-numeric: tabular-nums`).
- Max body width in reading views: 38rem.
- Do not use Inter, Geist, Roboto, or system-only as the brand face.
- Links: meadow, underline on hover, 1px offset.

---

## 6. Layout and shape

- **Page padding:** 24px. Student page max 1080px.
- **Cards:** `--paper-raised`, 1px `--line`, **radius 12px**, shadow `0 1px 2px rgb(28 25 23 / 6%)` only. No glow.
- **Controls:** radius **8px**. Height 40px. Input bg paper-raised, border line, focus meadow ring.
- **Pills:** radius 999px, 12px/6px padding.
- **Density:** comfortable. Caseload rows 56px tall. Do not compact to an air-traffic screen.
- **Left nav:** 220px, paper, no icons-only unless <768px.
- **Breakpoints:** 768, 1024. Phone: bottom “Log progress” persistent on student pages.

**Motion:** 120–180ms, ease-out, opacity + 4px translate max. No bounce. Respect `prefers-reduced-motion`.

---

## 7. Iconography and imagery

- Stroke icons, 1.75px, 20px box, rounded caps. Lucide or similar, **not** filled colorful sets.
- No stock photos of diverse smiling children on the marketing page. One abstract paper texture or a real (licensed) empty classroom desk is enough. Prefer type + mark.
- Illustrations if needed: flat, ink + meadow + clay only, no outlines in black.

---

## 8. Key UI patterns

### Caseload row
Name (serif 18) · grade meta · next clock pill (meadow / sun / berry) · quiet overflow menu.

### Goal card
Title. Metric as a sentence: “80% accuracy on 4th-grade oral reading.”  
Sparkline. Button: “Log progress”.

### Family visibility
Every publish control is a **clay** switch labeled “Family can see this.” Default **off**. Never bury it.

### Assist proposal (if BYOK)
Left border 3px meadow-soft. Label “Assist suggestion — you decide.” Three actions: Accept, Edit, Toss. Never auto-apply.

### Empty state
Serif one-liner + one meadow button. Example: “No goals yet. A goal needs a number you can see change.”

### PDF
Same tokens. Header: mark + FreeIEP + “Not the official IEP.” Footer: student name, date, page n. Print on paper (`#F7F4EE` background is optional; white page is fine in print, keep meadow rules).

---

## 9. Marketing page (Slice 0)

```
[mark] FreeIEP                         Start free

The IEP workspace
anyone can use.                        (Source Serif, 2 lines)

Clocks, goals, and a family view.
No card. No district wait.

[ Start free ]

Three columns, no icons circus:
  Keep the dates    Write a goal     Let family in
  honest            you can measure  without a fight
```

Footer: Privacy · Terms · “Student records are not a growth strategy.”

No customer logo wall. No fake testimonials.

---

## 10. Accessibility

- Contrast: ink on paper and white on meadow both pass AA.
- Focus visible always. Do not `outline: none` without a ring.
- Family portal target sizes ≥ 44px for Accept / Acknowledge.
- Do not convey overdue by color alone; include the word “Overdue”.
- Forms: labels outside inputs, not placeholder-only.

---

## 11. What this is not (anti-brand)

- Purple gradients, glassmorphism, AI sparkle buttons
- “Unlock with Pro”
- Playground-like “Copilot suite” marketing tiles
- Dark navy gov-contract look
- Comic / kid-app roundness (we serve adults who teach kids)

---

## 12. Asset checklist for Developer

- [ ] Load IBM Plex Sans (400, 500, 600) and Source Serif 4 (600)
- [ ] Drop in `tokens.css` as the only color/type source
- [ ] SVG mark (meadow square + two bars) as `/public/mark.svg`
- [ ] Favicon from the mark
- [ ] PDF header uses the same mark
- [ ] Family chrome uses clay-soft page tint so staff/family are visually distinct
