export type Role = "owner" | "member" | "family";

export type ClockKind =
  | "annual_review"
  | "reevaluation"
  | "progress_report"
  | "meeting_notice";

export type ClockTone = "overdue" | "due_soon" | "on_track" | "done";

export type Metric =
  | "percent_accuracy"
  | "wcpm"
  | "trials"
  | "rubric"
  | "count"
  | "custom";

export type MeetingType = "annual" | "amendment" | "reeval";
export type MeetingStatus = "drafted" | "finding_time" | "confirmed" | "done";

export type TokenKind =
  | "login"
  | "family_invite"
  | "member_invite"
  | "meeting_accept"
  | "meeting_suggest"
  | "meeting_decline";

export type User = {
  id: string;
  email: string;
  name?: string;
  role: Role;
  workspaceId: string | null;
  studentId?: string;
  assignedStudentIds?: string[];
  assistKey?: string;
  createdAt: string;
  acceptedLegalAt?: string;
};

export type Session = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  kind: "staff" | "family";
};

export type Token = {
  id: string;
  kind: TokenKind;
  email?: string;
  userId?: string;
  studentId?: string;
  studentIds?: string[];
  meetingId?: string;
  slotId?: string;
  workspaceId?: string;
  expiresAt: string;
  usedAt?: string;
};

export type Workspace = {
  id: string;
  name: string;
  state: string;
  ownerId: string;
  createdAt: string;
  removedMemberEmails?: string[];
};

export type PresentLevels = {
  strengths: string;
  needs: string;
  baselines: string;
};

export type Goal = {
  id: string;
  title: string;
  metric: Metric;
  baseline: string;
  target: string;
  unit: string;
  timelineDate: string;
  standardCode?: string;
  objectives: string[];
};

export type Accommodation = { id: string; text: string };

export type Service = {
  id: string;
  name: string;
  minutes: string;
  frequency: string;
};

export type IepPlan = {
  presentLevels: PresentLevels;
  goals: Goal[];
  accommodations: Accommodation[];
  services: Service[];
};

export type DataPoint = {
  id: string;
  goalId: string;
  date: string;
  value: number;
  note: string;
  photoId?: string;
  authorId: string;
};

export type Clock = {
  id: string;
  kind: ClockKind;
  dueOn: string;
  assignedTo?: string;
  done?: boolean;
};

export type Task = {
  id: string;
  title: string;
  dueOn?: string;
  done: boolean;
  assignees: string[];
};

export type MeetingSlot = {
  id: string;
  startsAt: string;
  endsAt: string;
};

export type MeetingAttendee = {
  email: string;
  name?: string;
  reply?: "accept" | "suggest" | "decline";
  repliedAt?: string;
  slotId?: string;
  suggestNote?: string;
};

export type Meeting = {
  id: string;
  type: MeetingType;
  status: MeetingStatus;
  slots: MeetingSlot[];
  attendees: MeetingAttendee[];
  confirmedAt?: string;
  confirmedSlotId?: string;
  notes?: string;
  roleBrief?: string;
};

export type Notice = {
  id: string;
  date: string;
  proposeOrRefuse: "propose" | "refuse";
  description: string;
  reasons: string;
  options: string;
  sentAt?: string;
  ackedAt?: string;
};

export type DocumentFile = {
  id: string;
  filename: string;
  storedName: string;
  mime: string;
  kind: string;
  publishedToFamily: boolean;
  size: number;
  createdAt: string;
};

export type ProgressReport = {
  id: string;
  from: string;
  to: string;
  summaries: { goalId: string; text: string }[];
  publishedToFamily: boolean;
  createdAt: string;
};

export type Activity = {
  id: string;
  who: string;
  verb: string;
  object: string;
  at: string;
};

export type Student = {
  id: string;
  workspaceId: string;
  firstName: string;
  lastName: string;
  localId?: string;
  grade: string;
  state: string;
  disabilityCategory?: string;
  documents: DocumentFile[];
  iepPlan: IepPlan;
  dataPoints: DataPoint[];
  clocks: Clock[];
  tasks: Task[];
  meetings: Meeting[];
  notices: Notice[];
  activity: Activity[];
  progressReports: ProgressReport[];
  createdAt: string;
  revokedFamilyEmails?: string[];
};

export type StoreData = {
  users: User[];
  sessions: Session[];
  tokens: Token[];
  workspaces: Workspace[];
  students: Student[];
};

export const METRIC_LABELS: Record<Metric, string> = {
  percent_accuracy: "percent accuracy",
  wcpm: "words correct per minute",
  trials: "trials",
  rubric: "rubric",
  count: "count",
  custom: "custom",
};

export const CLOCK_LABELS: Record<ClockKind, string> = {
  annual_review: "Annual",
  reevaluation: "Reeval",
  progress_report: "Progress report",
  meeting_notice: "Meeting notice",
};

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

export type FamilyInviteStatus = "none" | "pending" | "active" | "revoked";

export type FamilyHubRow = {
  id: string;
  name: string;
  grade: string;
  inviteStatus: FamilyInviteStatus;
  lastPublishedProgress: string | null;
  unsignedNotices: number;
  unconfirmedMeetings: number;
  inviteTokenId: string | null;
  inviteEmail: string | null;
  canRevoke: boolean;
};

export type NoticeHubRow = {
  id: string;
  studentId: string;
  student: string;
  grade: string;
  date: string;
  action: "propose" | "refuse";
  description: string;
  sent: boolean;
  acked: boolean;
  sentAt: string | null;
  ackedAt: string | null;
};
