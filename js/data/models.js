/* ============================================================
   ManakAI — Domain models (js/data/models.js)
   Structured data contracts the UI consumes. In production these
   map 1:1 to backend API schemas — the UI never embeds compliance
   answers in components, only renders these shapes.
   ============================================================ */

/**
 * Verification states for compliance-critical results.
 * CONFIRMED       — verified against an official source.
 * LIKELY_VERIFY   — likely applies; verify against official text.
 * UNKNOWN         — applicability could not be conclusively determined.
 */
const VERIFICATION = Object.freeze({
  CONFIRMED: { id: 'confirmed', label: 'Confirmed', badge: 'badge-ok', icon: 'check-circle', tone: 'ok' },
  LIKELY_VERIFY: { id: 'likely-verify', label: 'Likely — verify', badge: 'badge-warn', icon: 'alert-circle', tone: 'warn' },
  UNKNOWN: { id: 'unknown', label: 'Unknown', badge: 'badge-unknown', icon: 'help-circle', tone: 'unknown' },
});

/** Journey stages — the compliance pipeline. */
const STAGES = Object.freeze([
  { id: 'discovery', label: 'Discovery', short: 'Understand product & applicable standards' },
  { id: 'requirements', label: 'Requirements', short: 'Verify what applies to your product' },
  { id: 'testing', label: 'Testing', short: 'Testing & laboratory guidance' },
  { id: 'documentation', label: 'Documentation', short: 'Assemble your evidence' },
  { id: 'certification', label: 'Certification', short: 'Registration & certificate' },
]);

/** Task states. */
const TASK_STATES = Object.freeze({
  DONE: 'done',
  CURRENT: 'current',
  LOCKED: 'locked',
});

/** User account (no Aadhaar, PAN, or bank data — deliberately). */
function User(id, name, email, password) {
  return { id, name, email, password, createdAt: new Date().toISOString() };
}

/** Profile — onboarding answers. */
function Profile(userId) {
  return {
    userId,
    userType: '',            // msme | startup | manufacturer | importer | entrepreneur | other
    industry: '',            // free text / preset
    productName: '',
    productCategory: '',     // lighting | kitchenware | electronics | packaging | other
    productDesc: '',
    context: '',             // manufacture-in-india | import | both
    stage: '',              // exploring | product-development | testing | certification | certified
    updatedAt: null,
  };
}

/** A product the user is guiding through compliance. */
function Product(id, name, category, ownerId) {
  return {
    id, name, category, ownerId,
    isDemo: false,
    createdAt: new Date().toISOString(),
    journey: null,           // Journey
  };
}

/**
 * Journey — checklist of tasks + stage history + per-stage conversations.
 * progress is derived, never stored as a lie.
 */
function Journey(productId, templateId) {
  return {
    productId,
    templateId,             // which product template generated it
    tasks: [],              // Task[]
    history: { discovery: [], requirements: [], testing: [], documentation: [], certification: [] },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Task — one checklist step.
 * stepsDone indexes into steps[]. progress = steps completed / total.
 */
function Task(id, stage, num, title, short, why, steps, need, sourceRef, actionLabel) {
  return {
    id, stage, num, title, short, why,
    steps,                   // [{ id, text }]
    stepsDone: [],           // [stepId]
    need,                    // string[] — what you may need
    sourceRef,              // key into SOURCES
    actionLabel,             // next-action microcopy
    state: 'locked',
  };
}

/** Requirement — a structured AI analysis result. */
function Requirement(id, title, applies, why, verification, sourceRef) {
  return { id, title, applies, why, verification, sourceRef };
}

function taskProgress(task) {
  if (!task.steps || !task.steps.length) return task.stepsDone.length ? 100 : 0;
  return Math.round((task.stepsDone.length / task.steps.length) * 100);
}

function isTaskDone(task) { return task.state === 'done'; }

/** Journey progress = average of task progress. */
function journeyProgress(journey) {
  if (!journey || !journey.tasks.length) return 0;
  const total = journey.tasks.reduce((s, t) => s + taskProgress(t), 0);
  return Math.round(total / journey.tasks.length);
}

/** Journey stage = stage of the first non-done task, else certification. */
function journeyStage(journey) {
  const t = journey.tasks.find(t => t.state !== 'done');
  return t ? t.stage : 'certification';
}

/** Next action copy derived from journey state. */
function nextActionText(journey) {
  const t = journey.tasks.find(t => t.state === 'current');
  if (!t) return 'All tasks complete — review your final summary.';
  return t.actionLabel;
}

/** Re-derive states from completion (single source of truth = stepsDone + done flags). */
function normalizeJourney(journey) {
  if (!journey) return;
  let seenCurrent = false;
  for (const t of journey.tasks) {
    if (t.state === 'done') continue;
    if (!seenCurrent) { t.state = 'current'; seenCurrent = true; }
    else t.state = 'locked';
  }
}

/** Conversation message. */
function Message(role, text, meta) {
  return { role, text, meta: meta || null, at: new Date().toISOString() };
}
