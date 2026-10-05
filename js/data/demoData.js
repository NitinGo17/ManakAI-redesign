/* ============================================================
   ManakAI — Demo & template data (js/data/demoData.js)
   Product templates drive MockAIService analysis + checklist
   generation. Compliance facts for the LED-lamp demo trace to
   the BIS CRS Scheme II product list and the IS 16102 standards;
   anything not grounded is explicitly marked LIKELY—VERIFY or UNKNOWN.
   ============================================================ */

/* ---------- Product templates ---------- */
const PRODUCT_TEMPLATES = {

  /* Self-ballasted LED lamps — grounded in the BIS CRS Scheme II product list
     (bis.gov.in, Sl. No. 21) and IS 16102 Parts 1 & 2. */
  led_bulb: {
    id: 'led_bulb',
    match: ['led bulb', 'led lamp', 'led bulbs', 'led lamps', 'bulb', 'lamp', 'light bulb', 'led light', 'led'],
    category: 'Lighting — self-ballasted LED lamps',
    productType: 'Self-ballasted LED lamp (general lighting services)',
    requirements: [
      {
        id: 'led-crs',
        title: 'BIS Registration under the Compulsory Registration Scheme (CRS)',
        applies: 'Required before selling or importing in India',
        why: 'Self-ballasted LED lamps for general lighting services appear in the BIS CRS Scheme II product list against IS 16102 (Part 1). Products in this list cannot legally be sold in India without registration.',
        verification: 'CONFIRMED',
        sourceRef: 'BIS_CRS_LED_LAMPS',
      },
      {
        id: 'led-safety',
        title: 'Safety testing to IS 16102 (Part 1): 2012',
        applies: 'Applies to your product',
        why: 'This is the safety standard listed against your product category in the CRS product list. Testing is done at a BIS-recognised laboratory.',
        verification: 'CONFIRMED',
        sourceRef: 'IS_16102_PART1',
      },
      {
        id: 'led-performance',
        title: 'Performance testing to IS 16102 (Part 2): 2017',
        applies: 'Likely applies — verify at application time',
        why: 'The BIS catalogue lists performance requirements for self-ballasted LED lamps. A first revision of Part 1 was published in 2026, so confirm which standard versions apply when you apply.',
        verification: 'LIKELY_VERIFY',
        sourceRef: 'IS_16102_PART2',
      },
      {
        id: 'led-marking',
        title: 'Marking & labelling requirements',
        applies: 'Likely applies — verify against the standard text',
        why: 'Indian Standards for lamps typically require specific markings (rated voltage, wattage, and more). The exact clauses must be read in the standard text available from BIS.',
        verification: 'LIKELY_VERIFY',
        sourceRef: 'IS_16102_PART1',
      },
      {
        id: 'led-state',
        title: 'State-level or buyer-specific requirements',
        applies: 'Applicability could not be conclusively determined from the available information.',
        why: 'Some buyers (e.g., government tenders, discom programmes) ask for additional certifications. ManakAI could not conclusively determine these from the available information — check with your buyer or state authority.',
        verification: 'UNKNOWN',
        sourceRef: 'MANAKAI_GUIDANCE',
      },
    ],
    tests: [
      { id: 'led-t1', name: 'Electrical safety tests', purpose: 'Checks protection against electric shock, insulation, and endurance expected by the safety standard.', status: 'not-started' },
      { id: 'led-t2', name: 'Photometric & performance tests', purpose: 'Measures light output, efficacy, and lumen maintenance relevant to the performance standard.', status: 'not-started' },
      { id: 'led-t3', name: 'Marking & construction review', purpose: 'Confirms markings and construction details match the standard\'s requirements.', status: 'not-started' },
    ],
  },

  /* Stainless steel water bottles — no standard confirmed from available
     sources, so the template demonstrates honest uncertainty. */
  ss_bottle: {
    id: 'ss_bottle',
    match: ['bottle', 'steel bottle', 'stainless steel', 'water bottle', 'flask', 'tumbler', 'vacuum flask'],
    category: 'Kitchenware — stainless steel bottles & flasks',
    productType: 'Stainless steel water bottle / flask',
    requirements: [
      {
        id: 'ss-is',
        title: 'Applicable Indian Standard for stainless steel bottles',
        applies: 'Applicability could not be conclusively determined from the available information.',
        why: 'A relevant Indian Standard may exist for this product family. ManakAI could not conclusively determine applicability from the available information, so this must be verified on the BIS "Know Your Standards" portal before proceeding.',
        verification: 'UNKNOWN',
        sourceRef: 'BIS_KYS',
      },
      {
        id: 'ss-qco',
        title: 'Quality Control Order (QCO) coverage',
        applies: 'Possibly — needs verification',
        why: 'The Government periodically notifies QCOs that make BIS certification mandatory for specific goods. Coverage for this exact product must be checked in current QCO notifications.',
        verification: 'LIKELY_VERIFY',
        sourceRef: 'BIS_KYS',
      },
      {
        id: 'ss-food',
        title: 'Food-contact material safety',
        applies: 'Likely applies — verify',
        why: 'A product that holds drinking water will usually need to meet food-contact safety expectations. The exact Indian requirements must be verified.',
        verification: 'LIKELY_VERIFY',
        sourceRef: 'MANAKAI_GUIDANCE',
      },
    ],
    tests: [
      { id: 'ss-t1', name: 'Material composition verification', purpose: 'Confirms the grade of stainless steel used, which buyers and standards commonly specify.', status: 'not-started' },
      { id: 'ss-t2', name: 'Food-contact safety tests', purpose: 'Checks migration and safety for materials in contact with drinking water — exact scope to be confirmed once the applicable standard is verified.', status: 'not-started' },
    ],
  },

  /* Generic fallback template for anything else. */
  generic: {
    id: 'generic',
    match: [],
    category: 'General product',
    productType: 'Your product',
    requirements: [
      {
        id: 'gen-is',
        title: 'Applicable Indian Standard',
        applies: 'Applicability could not be conclusively determined from the available information.',
        why: 'Most products sold in India fall under either an Indian Standard (voluntary or mandatory) or a Quality Control Order. The specific one for your product must be identified via the BIS Know Your Standards portal or BIS direct enquiry.',
        verification: 'UNKNOWN',
        sourceRef: 'BIS_KYS',
      },
      {
        id: 'gen-crs',
        title: 'Compulsory Registration / certification coverage',
        applies: 'Possibly — needs verification',
        why: 'Electronics and several other categories are covered by the Compulsory Registration Scheme; other goods by QCOs. This must be confirmed for your exact product.',
        verification: 'LIKELY_VERIFY',
        sourceRef: 'BIS_CRS_PORTAL',
      },
    ],
    tests: [
      { id: 'gen-t1', name: 'Applicable tests', purpose: 'Will be defined once the applicable standard is confirmed.', status: 'not-started' },
    ],
  },
};

function matchTemplate(text) {
  const t = (text || '').toLowerCase();
  for (const tpl of [PRODUCT_TEMPLATES.led_bulb, PRODUCT_TEMPLATES.ss_bottle]) {
    if (tpl.match.some(m => t.includes(m))) return tpl;
  }
  return PRODUCT_TEMPLATES.generic;
}

/* ---------- Checklist task templates (per product template) ---------- */
function taskTemplatesFor(tpl) {
  const common = [
    {
      id: 't-understand', stage: 'discovery', num: '01',
      title: 'Understand Applicable Standard',
      short: 'Identify which Indian Standard or scheme covers your product.',
      why: 'Everything downstream — testing, documents, certification — depends on knowing the right standard. Starting with the wrong one wastes months.',
      steps: [
        { id: 'u1', text: 'Review the standard ManakAI identified for your product' },
        { id: 'u2', text: 'Confirm the standard\'s scope matches your exact product variant' },
        { id: 'u3', text: 'Note the standard version that currently applies' },
      ],
      need: ['Product specification sheet', 'Technical datasheet if available', 'ManakAI requirement analysis'],
      sourceRef: 'BIS_KYS',
      actionLabel: 'Confirm which standard applies to your product',
    },
    {
      id: 't-verify', stage: 'requirements', num: '02',
      title: 'Verify Product Requirements',
      short: 'Check your product details against the requirements in the standard.',
      why: 'Before paying for laboratory testing, verify that your product\'s construction, materials, and markings are consistent with the standard — this is the cheapest place to catch problems.',
      steps: [
        { id: 'v1', text: 'Verify materials used' },
        { id: 'v2', text: 'Verify dimensions and ratings' },
        { id: 'v3', text: 'Check applicable safety requirements' },
        { id: 'v4', text: 'Compare specifications against the standard' },
      ],
      need: ['Product specification', 'Technical documentation', 'Test information from your supplier, if any'],
      sourceRef: 'IS_16102_PART1',
      actionLabel: 'Check your product details against the requirements',
    },
    {
      id: 't-testing', stage: 'testing', num: '03',
      title: 'Complete Product Testing',
      short: 'Submit samples to a recognised laboratory and receive your test reports.',
      why: 'Testing at a BIS-recognised laboratory is how compliance is actually evidenced. Reports must be in the format BIS accepts.',
      steps: [
        { id: 'p1', text: 'Choose a BIS-recognised laboratory' },
        { id: 'p2', text: 'Submit samples for the required tests' },
        { id: 'p3', text: 'Review the test report when it arrives' },
      ],
      need: ['Product samples', 'Test fees', 'ManakAI lab guidance'],
      sourceRef: 'BIS_LIMS',
      actionLabel: 'Submit product for required testing',
    },
    {
      id: 't-docs', stage: 'documentation', num: '04',
      title: 'Prepare Documentation',
      short: 'Assemble the documents your application will need.',
      why: 'Applications are commonly delayed or returned because of incomplete or inconsistent documents. Preparing them carefully saves weeks.',
      steps: [
        { id: 'd1', text: 'Collect factory and business documents' },
        { id: 'd2', text: 'Prepare the technical construction file' },
        { id: 'd3', text: 'Organise test reports and declarations' },
      ],
      need: ['Business registration documents', 'Test reports', 'Product technical file'],
      sourceRef: 'BIS_CRS_PORTAL',
      actionLabel: 'Assemble your application documents',
    },
    {
      id: 't-cert', stage: 'certification', num: '05',
      title: 'Certification Process',
      short: 'File the application and follow it through to registration.',
      why: 'The final step converts all your preparation into a registration or licence you can show to buyers and authorities.',
      steps: [
        { id: 'c1', text: 'File the application on the official portal' },
        { id: 'c2', text: 'Respond to any queries from the authority' },
        { id: 'c3', text: 'Receive and record your registration' },
      ],
      need: ['Completed documentation', 'Application fees', 'Test reports'],
      sourceRef: 'BIS_CRS_PORTAL',
      actionLabel: 'Start the certification process',
    },
  ];
  return common.map(t => ({ ...t }));
}

function buildJourneyForTemplate(templateId) {
  const tpl = Object.values(PRODUCT_TEMPLATES).find(t => t.id === templateId) || PRODUCT_TEMPLATES.generic;
  const j = Journey('pending', templateId);
  j.tasks = taskTemplatesFor(tpl).map(t => {
    const task = Task(t.id, t.stage, t.num, t.title, t.short, t.why, t.steps, t.need, t.sourceRef, t.actionLabel);
    return task;
  });
  normalizeJourney(j);
  return j;
}

/* ---------- Demo Mode data ----------
   LED Bulb journey fixed at 42% (avg of task progress):
   01 done (100) · 02 done (100) · 03 current with 1/3 steps (33)
   → (100 + 100 + 33 + 0 + 0) / 5 ≈ 42%                              */
function buildDemoJourney(productId) {
  const j = buildJourneyForTemplate('led_bulb');
  j.productId = productId;
  j.isDemo = true;
  const t1 = j.tasks[0]; t1.state = 'done'; t1.stepsDone = t1.steps.map(s => s.id);
  const t2 = j.tasks[1]; t2.state = 'done'; t2.stepsDone = t2.steps.map(s => s.id);
  // Granular 10-step testing task with 1 done -> (100 + 100 + 10 + 0 + 0) / 5 = 42%.
  const t3 = j.tasks[2]; t3.state = 'current';
  t3.steps = [
    { id: 'p1', text: 'Choose a BIS-recognised laboratory' },
    { id: 'p2', text: 'Confirm the lab covers the required standard' },
    { id: 'p3', text: 'Confirm sample requirements with the lab' },
    { id: 'p4', text: 'Prepare product samples' },
    { id: 'p5', text: 'Submit samples to the laboratory' },
    { id: 'p6', text: 'Track the testing schedule' },
    { id: 'p7', text: 'Respond to any lab queries' },
    { id: 'p8', text: 'Receive the test report' },
    { id: 'p9', text: 'Review results against the standard' },
    { id: 'p10', text: 'File the report with your documentation' },
  ];
  t3.stepsDone = ['p1'];
  j.tasks[3].state = 'locked';
  j.tasks[4].state = 'locked';
  // Pre-seeded conversation history for the demo (Testing stage).
  j.history.testing = [
    Message('ai', 'Welcome back. Your requirements are verified — the next step is product testing.', null),
    Message('user', 'Where should I get the testing done?', null),
    Message('ai', 'Testing must happen at a laboratory recognised by BIS. I have prepared lab guidance with the recognised-lab directory source — open it from your journey.', null),
  ];
  return j;
}

function buildDemoState() {
  const user = User('demo-user', 'Ananya Sharma', 'demo@manakai.in', 'demo1234');
  const profile = Profile(user.id);
  Object.assign(profile, {
    userType: 'msme',
    industry: 'Lighting & electricals',
    productName: 'LED Bulb',
    productCategory: 'lighting',
    productDesc: '9W self-ballasted LED bulb for residential general lighting',
    context: 'manufacture-in-india',
    stage: 'testing',
    updatedAt: new Date().toISOString(),
  });
  const led = Product('demo-led', 'LED Bulb', 'lighting', user.id);
  led.isDemo = true;
  led.journey = buildDemoJourney('demo-led');

  const fan = Product('demo-fan', 'Smart Ceiling Fan', 'electronics', user.id);
  fan.isDemo = true;
  const fj = buildJourneyForTemplate('generic');
  fj.productId = fan.id;
  const ft1 = fj.tasks[0]; ft1.stepsDone = ft1.steps.map(s => s.id); ft1.state = 'done';
  const ft2 = fj.tasks[1]; ft2.stepsDone = ['v1', 'v2']; ft2.state = 'current';
  normalizeJourney(fj);
  fan.journey = fj;

  const adapter = Product('demo-adapter', 'USB Power Adapter', 'electronics', user.id);
  adapter.isDemo = true;
  const aj = buildJourneyForTemplate('generic');
  aj.productId = adapter.id;
  aj.tasks.forEach(t => { t.stepsDone = t.steps.map(s => s.id); t.state = 'done'; });
  adapter.journey = aj;

  return {
    user, profile, products: [led, fan, adapter], activeProductId: 'demo-led',
    demoMode: true,
  };
}
