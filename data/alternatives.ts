export type Alternative = {
  slug: string;
  name: string;
  they: string[];
  we: string[];
  willNot: string[];
};

export const alternatives: Alternative[] = [
  {
    slug: "playground-iep",
    name: "Playground IEP",
    they: [
      "Playground sits between a student information system and IEP software.",
      "Their product is known for snapshots, Copilot-style writers, and scheduling.",
      "They do not offer a parent login.",
    ],
    we: [
      "FreeIEP is the working case plus a family view: clocks, required metrics, published progress.",
      "We cost $0 and we do not fill an official form.",
      "We are not a gen-ed snapshot product first.",
    ],
    willNot: [
      "We will not claim to replace their SIS snapshots or Copilot suite.",
      "We will not invent their pricing.",
    ],
  },
  {
    slug: "synciep",
    name: "SyncIEP",
    they: [
      "SyncIEP is a paid educator workspace that drafts on the district PDF with an assistant.",
      "It is known for photo-scored progress and a family portal.",
      "It is built to sit on top of the official form.",
    ],
    we: [
      "FreeIEP does the jobs we can do without a model bill and without form overlay: clocks, measurable goals, dated points, a family view.",
      "We cost $0. Family portal and clocks are the overlap.",
      "We do not overlay the official form.",
    ],
    willNot: [
      "We will not clone their screens or paste their marketing.",
      "We will not claim photo auto-scoring or official-form fill.",
    ],
  },
  {
    slug: "frontline-iep",
    name: "Frontline",
    they: [
      "Frontline Special Programs is a district system of record.",
      "Districts use it for official IEP forms, workflows, and often Medicaid or state reporting.",
      "Procurement and a DPA are the usual path in.",
    ],
    we: [
      "FreeIEP sits beside a system of record. A teacher can start today.",
      "We keep the working case: dates, goals you can measure, a family view.",
      "We do not replace Frontline.",
    ],
    willNot: [
      "We will not claim to file official forms or Medicaid minutes.",
      "We will not invent Frontline pricing or module lists.",
    ],
  },
  {
    slug: "goalbook",
    name: "Goalbook",
    they: [
      "Goalbook is professional development and strategy banks for writing better goals.",
      "Teams use it to study quality and alignment, not to run the weekly case file.",
    ],
    we: [
      "FreeIEP stores the goal you write. Metric, baseline, target, and timeline are required.",
      "We graph the points you log. We are not a PD library.",
    ],
    willNot: [
      "We will not claim a 50-state goal bank.",
      "Not our product: Goalbook’s strategy toolkit.",
    ],
  },
  {
    slug: "spedtrack",
    name: "SpedTrack",
    they: [
      "SpedTrack is a district special education system of record.",
      "Schools use products in this class for official forms and program documentation.",
    ],
    we: [
      "FreeIEP does not replace SpedTrack.",
      "Use us for the working case and family view while the official file stays in the district system.",
    ],
    willNot: [
      "We will not claim state reporting or Medicaid billing.",
      "We will not invent their feature list or price.",
    ],
  },
  {
    slug: "embrace-iep",
    name: "Embrace",
    they: [
      "Embrace is a district IEP system of record.",
      "It is used for official plans and district workflows.",
    ],
    we: [
      "FreeIEP does not replace Embrace.",
      "We sit beside it: clocks, measurable goals, published progress, $0.",
    ],
    willNot: [
      "We will not claim to be the official IEP.",
      "We will not invent Embrace pricing.",
    ],
  },
];

export function alternativeBySlug(slug: string) {
  return alternatives.find((a) => a.slug === slug);
}
