export type UsePage = {
  slug: string;
  title: string;
  oneLine: string;
  doItems: [string, string, string];
  dontItems: [string, string];
  related: { href: string; label: string }[];
};

export const uses: UsePage[] = [
  {
    slug: "caseload-management-app-for-special-education-teachers",
    title: "Caseload for a case manager",
    oneLine: "Dates and students on one board.",
    doItems: [
      "See every student with the next date that matters and an overdue pill in red.",
      "Open a student and stay in the case: plan, progress, meetings, files, family.",
      "Import a CSV of name, grade, annual date, and reevaluation date. You map the columns.",
    ],
    dontItems: [
      "No live PowerSchool or SIS sync.",
      "No director command center in this version.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/for/case-managers", label: "For case managers" },
    ],
  },
  {
    slug: "iep-writing-software-for-special-education-teachers",
    title: "Writing the plan",
    oneLine: "Present levels and goals you can export.",
    doItems: [
      "Write present levels: strengths, needs, baselines. Autosave.",
      "Save a goal only when it has a metric, baseline, target, and timeline.",
      "Export a Plan PDF. The header says “Not the official IEP.”",
    ],
    dontItems: [
      "We do not overlay Frontline, SEIS, or EasyIEP PDFs.",
      "No 50-state goal bank in this version.",
    ],
    related: [
      { href: "/features/plan", label: "Plan & goals" },
      { href: "/resources/measurable-goals", label: "Writing measurable goals" },
    ],
  },
  {
    slug: "iep-present-levels-generator",
    title: "Present levels",
    oneLine: "Three boxes: strengths, needs, baselines. You write. Assist is optional.",
    doItems: [
      "Type strengths, needs, and baselines on the student plan.",
      "Keep the text with the goals so progress has a starting point.",
      "Export the plan when you need a paper copy.",
    ],
    dontItems: [
      "We do not invent present levels from a test file.",
      "Assist is hidden unless you add your own API key.",
    ],
    related: [
      { href: "/features/plan", label: "Plan & goals" },
      { href: "/uses/ai-iep-writing-assistant", label: "Optional Assist" },
    ],
  },
  {
    slug: "iep-goal-bank-aligned-to-state-standards",
    title: "Measurable goals",
    oneLine: "Required metric. Standard code is optional text, not a 50-state bank yet.",
    doItems: [
      "A goal needs title, metric, baseline, target, and timeline or it will not save.",
      "Log dated points in the goal’s unit and watch the line move.",
      "Put a standard code in as optional text if your team uses one.",
    ],
    dontItems: [
      "No 50-state standards pack yet. Standard code is optional text.",
      "We do not invent service minutes or placement from a goal.",
    ],
    related: [
      { href: "/resources/measurable-goals", label: "Writing measurable goals" },
      { href: "/features/plan", label: "Plan & goals" },
    ],
  },
  {
    slug: "iep-deadline-tracker",
    title: "Deadline tracker",
    oneLine: "Annual, reeval, progress windows.",
    doItems: [
      "Keep annual, reevaluation, and progress-report windows on the student.",
      "See overdue in red on the caseload board.",
      "Open the student when a clock is close and do the work there.",
    ],
    dontItems: [
      "We do not file PEIMS, EMIS, CALPADS, or Florida Matrix.",
      "We are not your district’s official calendar of record.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/resources/iep-timeline", label: "The IEP timeline" },
    ],
  },
  {
    slug: "iep-annual-review-tracker",
    title: "Annual review tracker",
    oneLine: "The annual date lives on the student.",
    doItems: [
      "Set the annual date when you add the student.",
      "See it on the caseload so it is not only in a spreadsheet.",
      "Propose meeting times when the annual is due.",
    ],
    dontItems: [
      "We do not auto-schedule your whole calendar.",
      "The official IEP still lives where your district keeps it.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/features/scheduling", label: "Meetings" },
    ],
  },
  {
    slug: "iep-meeting-scheduler",
    title: "Meeting scheduler",
    oneLine: "Propose slots. Family answers from email.",
    doItems: [
      "Propose one to three times for annual, amendment, or reevaluation.",
      "Family can Accept, Suggest, or Decline from a link with no account.",
      "Download a .ics once a time is set.",
    ],
    dontItems: [
      "We do not scan your existing calendar events in this version.",
      "Google and Outlook connect is later.",
    ],
    related: [
      { href: "/features/scheduling", label: "Meetings" },
      { href: "/resources/family-iep-meeting-guide", label: "Family meeting guide" },
    ],
  },
  {
    slug: "iep-parent-portal-software",
    title: "Family portal",
    oneLine: "Published progress only.",
    doItems: [
      "Invite a family to one child. They see only what you publish.",
      "Publish a progress note in plain language when you choose.",
      "They can confirm a meeting from an email link with no account.",
    ],
    dontItems: [
      "Staff notes stay staff. Unpublished files stay unpublished.",
      "This is not a parent advocacy letter factory.",
    ],
    related: [
      { href: "/features/family-portal", label: "Family portal" },
      { href: "/for/families", label: "For families" },
    ],
  },
  {
    slug: "prior-written-notice-software-for-special-education",
    title: "Prior written notice",
    oneLine: "PWN-lite. Not your district’s official form.",
    doItems: [
      "Keep a dated notice record on the case when the team proposes or refuses a change.",
      "Write the words yourself. FreeIEP will not invent them.",
      "Export or share only what you choose to publish.",
    ],
    dontItems: [
      "If your district requires a specific notice form, use that form. This is a dated record on the case.",
      "This is not legal advice and not a substitute for required district paper.",
    ],
    related: [
      { href: "/features/plan", label: "Plan & goals" },
      { href: "/resources/iep-timeline", label: "The IEP timeline" },
    ],
  },
  {
    slug: "iep-progress-monitoring-software-for-slps",
    title: "Progress for SLPs",
    oneLine: "Trials and percents on the same goal.",
    doItems: [
      "Log a session against a goal the case manager already wrote.",
      "Use the goal’s unit — trials, percents, words correct.",
      "The family can see progress if the teacher publishes it.",
    ],
    dontItems: [
      "Not Medicaid claiming.",
      "We do not auto-score photos or audio.",
    ],
    related: [
      { href: "/features/progress", label: "Progress" },
      { href: "/for/service-providers", label: "For service providers" },
    ],
  },
  {
    slug: "iep-progress-monitoring-for-school-psychologists",
    title: "Progress for school psychologists",
    oneLine: "Dated points. Not a full BIP module.",
    doItems: [
      "Log a dated value in the goal’s unit.",
      "Add an optional photo stored on the point, not auto-scored.",
      "See baseline, points, and target on one chart.",
    ],
    dontItems: [
      "Not a full BIP module.",
      "Not a psychoeducational report writer.",
    ],
    related: [
      { href: "/features/progress", label: "Progress" },
      { href: "/for/service-providers", label: "For service providers" },
    ],
  },
  {
    slug: "progress-monitoring-software-for-resource-teachers",
    title: "Progress for resource teachers",
    oneLine: "Log from class. Photo optional.",
    doItems: [
      "Log progress from the student page. Phone-friendly.",
      "Click a point to see the note and photo.",
      "Publish a short progress report when you are ready.",
    ],
    dontItems: [
      "No OCR scoring yet.",
      "AI summaries stay off unless you add your own API key.",
    ],
    related: [
      { href: "/features/progress", label: "Progress" },
      { href: "/for/co-teachers", label: "For co-teachers" },
    ],
  },
  {
    slug: "ferpa-compliant-iep-software",
    title: "FERPA-minded workspace",
    oneLine: "Roles, export, delete, no ads.",
    doItems: [
      "Students never create accounts. Family sees one student; deny wins.",
      "Export JSON and files. Delete a student and files go within 30 days.",
      "No ads. No sale of records. No training a model on your caseload.",
    ],
    dontItems: [
      "We are FERPA-minded, not a lawyer’s certification stamp.",
      "US hosting. Read the full policy on Privacy.",
    ],
    related: [
      { href: "/features/privacy", label: "Privacy feature" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
  {
    slug: "iep-software-for-a-single-special-education-teacher",
    title: "One teacher",
    oneLine: "Start today. No contract.",
    doItems: [
      "Add a student, set the annual date, write two goals with numbers.",
      "Log points from class and publish a note the family can read.",
      "Invite family when you are ready. No procurement wait.",
    ],
    dontItems: [
      "$0. You still need your district form for the legal IEP.",
      "No school-wide rollup in this version.",
    ],
    related: [
      { href: "/for/case-managers", label: "For case managers" },
      { href: "/pricing", label: "It’s free" },
    ],
  },
  {
    slug: "iep-software-pricing-for-small-districts",
    title: "Small districts",
    oneLine: "$0. Still not state reporting.",
    doItems: [
      "A case manager can begin today with every feature.",
      "Family and invited staff are also $0.",
      "Keep clocks and progress off a personal spreadsheet.",
    ],
    dontItems: [
      "$0. You still need your district form for the legal IEP.",
      "We do not file PEIMS, EMIS, CALPADS, or Florida Matrix.",
    ],
    related: [
      { href: "/pricing", label: "It’s free" },
      { href: "/for/administrators", label: "For administrators" },
    ],
  },
  {
    slug: "iep-software-cost-per-student",
    title: "Cost per student",
    oneLine: "$0.",
    doItems: [
      "No per-student fee. No card.",
      "Case manager, family, invited co-teachers and providers: $0.",
      "Every feature. No trial cliff. No Pro.",
    ],
    dontItems: [
      "$0. You still need your district form for the legal IEP.",
      "If you turn on Assist, you still pay for your own model key.",
    ],
    related: [
      { href: "/pricing", label: "It’s free" },
      { href: "/features/privacy", label: "Privacy" },
    ],
  },
  {
    slug: "iep-software-for-private-schools",
    title: "Private schools",
    oneLine: "Word is not a caseload.",
    doItems: [
      "Keep students, clocks, and goals in one workspace.",
      "Export a Plan PDF that says it is not the official IEP.",
      "Let family see only what you publish.",
    ],
    dontItems: [
      "We do not replace a district IEP if the student has one.",
      "No SIS connector. CSV in, Plan PDF out.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/features/plan", label: "Plan & goals" },
    ],
  },
  {
    slug: "iep-software-for-charter-schools",
    title: "Charter schools",
    oneLine: "Same free workspace.",
    doItems: [
      "Start with one teacher. No contract.",
      "Same clocks, measurable goals, and family view.",
      "Sit beside whatever official form your authorizer uses.",
    ],
    dontItems: [
      "We are not the system of record.",
      "No network rollup yet.",
    ],
    related: [
      { href: "/for/case-managers", label: "For case managers" },
      { href: "/pricing", label: "It’s free" },
    ],
  },
  {
    slug: "iep-software-for-charter-networks",
    title: "Charter networks",
    oneLine: "Start per campus. No network rollup yet.",
    doItems: [
      "A campus case manager can start today.",
      "Keep dates and progress on each student.",
      "Export what you need. No card.",
    ],
    dontItems: [
      "No multi-school dashboard in this version.",
      "We do not file state reporting for the network.",
    ],
    related: [
      { href: "/for/administrators", label: "For administrators" },
      { href: "/uses/iep-compliance-tracking-for-special-education-directors", label: "Directors" },
    ],
  },
  {
    slug: "iep-software-for-microschools",
    title: "Microschools",
    oneLine: "Tiny team, same clocks.",
    doItems: [
      "Add a small caseload and keep the annual dates honest.",
      "Write goals with numbers and log what happened.",
      "Invite family to the same student, not a different story.",
    ],
    dontItems: [
      "Not Medicaid. Not state reporting.",
      "Not a full district IEP form.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/for/families", label: "For families" },
    ],
  },
  {
    slug: "iep-software-for-special-education-co-ops",
    title: "Co-ops",
    oneLine: "Shared students later. Today: one workspace.",
    doItems: [
      "One workspace for the teacher who owns the case.",
      "Log sessions against goals already on the student.",
      "Publish progress the family can read.",
    ],
    dontItems: [
      "Shared students across workspaces ship later.",
      "Today: one workspace, not a co-op directory.",
    ],
    related: [
      { href: "/for/service-providers", label: "For service providers" },
      { href: "/features/caseload", label: "Caseload" },
    ],
  },
  {
    slug: "texas-ard-software",
    title: "Texas ARD",
    oneLine: "Meetings and clocks. Not PEIMS.",
    doItems: [
      "Keep annual and reevaluation dates on the student.",
      "Propose ARD times. Family answers from email.",
      "Write goals with metrics you can graph.",
    ],
    dontItems: [
      "Not PEIMS. Not a state reporting system.",
      "Not an official Texas IEP form overlay.",
    ],
    related: [
      { href: "/features/scheduling", label: "Meetings" },
      { href: "/resources/iep-timeline", label: "The IEP timeline" },
    ],
  },
  {
    slug: "florida-iep-software",
    title: "Florida",
    oneLine: "Not Matrix of Services.",
    doItems: [
      "Keep US IDEA clocks on the student.",
      "Write measurable goals and log dated points.",
      "Sit beside the district system that files the official plan.",
    ],
    dontItems: [
      "Does not calculate Matrix of Services or file with the state.",
      "Not your district’s official IEP form.",
    ],
    related: [
      { href: "/features/plan", label: "Plan & goals" },
      { href: "/pricing", label: "It’s free" },
    ],
  },
  {
    slug: "illinois-iep-software",
    title: "Illinois",
    oneLine: "US IDEA clocks.",
    doItems: [
      "Track annual, reevaluation, and progress windows.",
      "Write goals that will not save without a metric.",
      "Invite family to published progress only.",
    ],
    dontItems: [
      "Not ISBE’s official IEP system.",
      "We do not replace required district forms.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/features/privacy", label: "Privacy" },
    ],
  },
  {
    slug: "ohio-iep-software",
    title: "Ohio",
    oneLine: "Not EMIS.",
    doItems: [
      "Keep clocks and goals on the working case.",
      "Log progress you can date.",
      "Export a Plan PDF that is not the official IEP.",
    ],
    dontItems: [
      "Does not submit to EMIS.",
      "Not a substitute for the district system of record.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/for/administrators", label: "For administrators" },
    ],
  },
  {
    slug: "switch-iep-software-mid-year",
    title: "Mid-year start",
    oneLine: "Import a CSV. Keep the district form.",
    doItems: [
      "Import name, grade, annual date, and reevaluation date.",
      "Write the working goals here. Keep the official form where it is.",
      "Invite family when you publish something they should see.",
    ],
    dontItems: [
      "No Frontline/SEIS connector. CSV in, Plan PDF out.",
      "We do not migrate Medicaid or state reporting history.",
    ],
    related: [
      { href: "/features/caseload", label: "Caseload" },
      { href: "/uses/migrating-iep-data-to-a-new-system", label: "Moving records" },
    ],
  },
  {
    slug: "migrating-iep-data-to-a-new-system",
    title: "Moving records",
    oneLine: "CSV + PDF export. No SIS pipe.",
    doItems: [
      "Export JSON and files from Settings.",
      "Export a Plan PDF per student.",
      "Bring a CSV in when you start a workspace.",
    ],
    dontItems: [
      "No Frontline/SEIS connector. CSV in, Plan PDF out.",
      "We do not talk to your SIS.",
    ],
    related: [
      { href: "/features/privacy", label: "Privacy" },
      { href: "/features/plan", label: "Plan & goals" },
    ],
  },
  {
    slug: "iep-compliance-tracking-for-special-education-directors",
    title: "Directors",
    oneLine: "One teacher first. No district dashboard yet.",
    doItems: [
      "A case manager can begin today. No procurement.",
      "Clocks live on each student they add.",
      "Read Privacy before a wider try.",
    ],
    dontItems: [
      "No multi-school dashboard in this version.",
      "If you need state reporting and official forms, keep your district system.",
    ],
    related: [
      { href: "/for/administrators", label: "For administrators" },
      { href: "/research", label: "Research" },
    ],
  },
  {
    slug: "ai-iep-writing-assistant",
    title: "Optional Assist",
    oneLine: "BYOK only. Never minutes or placement.",
    doItems: [
      "Assist stays hidden until you add your own API key in Settings.",
      "You write present levels and goals. Assist can suggest language you accept or toss.",
      "You still type services and minutes yourself.",
    ],
    dontItems: [
      "Hidden unless you add your own API key. We do not run a shared model. We will not invent minutes, placement, eligibility, or data points.",
      "Prompts are not stored. We will not send photos to a model in this version.",
    ],
    related: [
      { href: "/features/plan", label: "Plan & goals" },
      { href: "/features/privacy", label: "Privacy" },
    ],
  },
  {
    slug: "ai-progress-monitoring-for-special-education",
    title: "Assist on progress notes",
    oneLine: "Optional rewrite. You accept.",
    doItems: [
      "You log the dated number. That is the record.",
      "If Assist is on, you can ask for a rewrite of 2–4 sentences per goal.",
      "You accept, edit, or toss. Nothing auto-applies.",
    ],
    dontItems: [
      "Hidden unless you add your own API key. We do not run a shared model. We will not invent minutes, placement, eligibility, or data points.",
      "No OCR scoring of photos yet.",
    ],
    related: [
      { href: "/features/progress", label: "Progress" },
      { href: "/uses/ai-iep-writing-assistant", label: "Optional Assist" },
    ],
  },
];

export function useBySlug(slug: string) {
  return uses.find((u) => u.slug === slug);
}
