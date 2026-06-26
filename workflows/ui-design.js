// ══════════════════════════════════════════════════════════
// PACVUE LAYOUT RULES — CHECK BEFORE EVERY use_figma CALL
// ══════════════════════════════════════════════════════════
const LAYOUT_RULES = `
NON-NEGOTIABLE LAYOUT RULES:

1. AUTO-LAYOUT IS MANDATORY
   - ALWAYS createAutoLayout() for ANY container holding children
   - NEVER createFrame() with absolute x/y for structural layout
   - Set layoutSizingHorizontal/Vertical='FILL' AFTER appendChild()
   - Violation = CRITICAL error in Critique

2. COMPONENT REFERENCE NODES (read before building):
   - DatePicker Input:  node 15087:22990
   - Search Input:      node 15087:23079
   - Tag/Badge:         node 15087:23123
   - Table:             node 15087:14773
   - Pagination:        node 15087:23312
   - Always use get_design_context on these before building

3. TAG OPACITY: Set on FILL color, not frame
   frame.fills=[{type:'SOLID',color:col,opacity:0.05}] // ✅
   frame.opacity=0.05 // ❌ makes children transparent

4. PAGINATION ACTIVE STATE:
   Active page = orange BORDER + orange TEXT + WHITE BACKGROUND
   Never: filled orange background

5. TABLE SPECS:
   - Row height: 72px (data), 48px (header)
   - Header background: WHITE (not gray)
   - Header font: 13-14px Regular #66666c
   - Product image: 52×52px rounded-8
   - ASIN/SKU: orange #ff9f43 (link color)

6. KPI COMPARISON ROW:
   Just inline colored text + "vs last month" side by side
   No pill/badge background — text only
`;

// ══════════════════════════════════════════════════════════
// PACVUE COLOR SYSTEM — MANDATORY REFERENCE
// Build agents MUST use these before inventing any color.
// Critique agents MUST check against these rules.
// ══════════════════════════════════════════════════════════
const COLOR_SPEC = `
PACVUE COLOR SYSTEM (mandatory — do not invent colors):

1. THEME (buttons only):
   Orange Primary: #ff9f43  |  Blue Primary: #0d6efd

2. FUNCTION (status/alerts — NOT buttons):
   Success: #28c76f  bg: #eaf9f1
   Danger:  #ea5455  bg: #fdeeee
   Warning: #ff9f43  bg: #fff5ec
   Info:    #82858b  bg: #f0f0f0

3. TRANSPARENCY (tags only — always use opacity, never solid):
   Format: primary color + 10% opacity  e.g. rgba(255,159,67,0.1)

4. NEUTRAL — text colors (3 tiers, use correctly):
   Title text:    #45464f  → page titles, section headers, card titles, labels
   Body text:     #66666c  → descriptions, meta info, content
   Muted/assist:  #b2b2b8  → placeholders, secondary info, disabled
   Border:        #dedfe3 / #edeef1
   Page bg:       #f2f3f5
   White:         #ffffff

5. SEMANTIC (component-level rules):
   Button Primary (orange):   bg #ff9f43, text #fff
   Button Primary (blue):     bg #0d6efd, text #fff
   Button Secondary:          bg #fff, border #ff9f43, text #ff9f43
   Button Tertiary:           bg #fff, border #dedfe3, text #66666c
   Toggle active:             bg rgba(255,159,67,0.05), border #ff9f43, text #ff9f43
   Toggle inactive:           bg #fff, border #dedfe3, text #82858b
   Input default border:      #dedfe3
   Input focus border:        #ff9f43
   Tab active (orange):       text #ff9f43 + 2px #ff9f43 underline
   Tab inactive:              text #66666c
   Status Draft:              text #82858b, bg #f0f0f0
   Status Approved/Active:    text #28c76f, bg #eaf9f1
   Status Pending:            text #ff9f43, bg #fff5ec
   Status Rejected/Error:     text #ea5455, bg #fdeeee

CRITIQUE CHECKLIST:
- [ ] Primary buttons: #ff9f43 or #0d6efd ONLY
- [ ] Text tiers: title=#45464f, body=#66666c, muted=#b2b2b8 (no mixing)
- [ ] Status badges: correct color per status (see Semantic above)
- [ ] Tags: rgba opacity background, never solid fill
- [ ] Input focus: #ff9f43 border
- [ ] No accent/chart colors in UI components
- [ ] Dividers/borders: #dedfe3 or #edeef1
`;

export const meta = {
  name: 'ui-design',
  description: 'Phase-isolated UI design workflow: brief → tokens → components → assembly → review',
  phases: [
    { title: 'Brief',       detail: 'Clarify scope, lock requirements, get Figma URL' },
    { title: 'Foundations', detail: 'Extract design tokens, create Figma variables' },
    { title: 'Components',  detail: 'Build one component per agent, in parallel' },
    { title: 'Assembly',    detail: 'Compose layout from built components' },
    { title: 'Review',      detail: 'Visual QA against brief criteria' },
  ],
};

// ── Schemas ───────────────────────────────────────────────
const BRIEF_SCHEMA = {
  type: 'object',
  properties: {
    task:            { type: 'string' },
    figmaFileKey:    { type: 'string' },
    figmaPageId:     { type: 'string' },
    scope:           { type: 'array', items: { type: 'string' } },
    successCriteria: { type: 'string' },
    outOfScope:      { type: 'array', items: { type: 'string' } },
  },
  required: ['task', 'figmaFileKey', 'successCriteria'],
};

const TOKENS_SCHEMA = {
  type: 'object',
  properties: {
    colors:     { type: 'object' },
    spacing:    { type: 'object' },
    radius:     { type: 'object' },
    shadows:    { type: 'object' },
    typography: { type: 'object' },
  },
  required: ['colors', 'spacing'],
};

const COMP_LIST_SCHEMA = {
  type: 'object',
  properties: {
    components: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name:     { type: 'string' },
          variants: { type: 'array', items: { type: 'string' } },
          props:    { type: 'array', items: { type: 'string' } },
          dependsOn:{ type: 'array', items: { type: 'string' } },
        },
        required: ['name'],
      },
    },
  },
  required: ['components'],
};

const COMP_RESULT_SCHEMA = {
  type: 'object',
  properties: {
    name:   { type: 'string' },
    nodeId: { type: 'string' },
    status: { type: 'string', enum: ['done', 'partial', 'failed'] },
    notes:  { type: 'string' },
  },
  required: ['name', 'nodeId', 'status'],
};

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          passed:    { type: 'boolean' },
          note:      { type: 'string' },
        },
        required: ['criterion', 'passed'],
      },
    },
    blockers: { type: 'array', items: { type: 'string' } },
  },
  required: ['passed', 'checks'],
};

// ══════════════════════════════════════════════════════════
// PHASE 0 — BRIEF
// ══════════════════════════════════════════════════════════
phase('Brief');

const brief = await agent(
  `You are running Phase 0 of a UI design workflow.
  Ask the user exactly 3 questions (in Chinese or English, matching their language):
  1. What is the design task? (component / screen / flow)
  2. What does "done right" look like? (acceptance criteria)
  3. What is the Figma file URL and which page should the design go on?

  After they answer, synthesize a brief with: task, figmaFileKey, figmaPageId,
  scope (list of things to build), successCriteria, outOfScope.
  Return the structured brief — do not proceed to building anything.`,
  { schema: BRIEF_SCHEMA, phase: 'Brief' }
);

log(`Brief locked: ${brief.task}`);

// ══════════════════════════════════════════════════════════
// PHASE 1 — DESIGN SYSTEM (tokens + component planning, parallel)
// ══════════════════════════════════════════════════════════
phase('Foundations');

const [tokens, compPlan] = await parallel([

  // 1a: Extract design tokens from the product
  () => agent(
    `You are running Phase 1a: Design Token Extraction.

    Brief: ${JSON.stringify(brief)}

    Steps:
    1. Check if Figma file "${brief.figmaFileKey}" already has variable collections.
       Use use_figma to inspect: await figma.variables.getLocalVariableCollectionsAsync()
    2. If tokens are missing or sparse, use Playwright to scrape computed CSS variables
       from the Pacvue product URL (ask user for login if needed).
    3. Extract: all --pac-* and --el-* CSS variables, font families, spacing scale.
    4. Return the full token set.

    Return ONLY the tokens object. Do not create anything in Figma yet.`,
    { schema: TOKENS_SCHEMA, phase: 'Foundations', label: 'token-extraction' }
  ),

  // 1b: Plan which components are needed
  () => agent(
    `You are running Phase 1b: Component Planning.

    Brief: ${JSON.stringify(brief)}

    Based on the task, list every Figma component that needs to be built.
    For each component specify:
    - name (PascalCase)
    - variants (e.g. ["State=Default", "State=Hover"])
    - props (component properties, e.g. ["title TEXT", "isEmpty BOOLEAN"])
    - dependsOn (other components this one uses)

    Order the list so atoms come before molecules (dependencies first).
    Return the component list. Do not build anything yet.`,
    { schema: COMP_LIST_SCHEMA, phase: 'Foundations', label: 'component-planning' }
  ),

]);

log(`Tokens extracted: ${Object.keys(tokens.colors || {}).length} colors, ${Object.keys(tokens.spacing || {}).length} spacing steps`);
log(`Components planned: ${compPlan.components.length} components`);

// ══════════════════════════════════════════════════════════
// PHASE 2 — COMPONENT LIBRARY (one agent per component)
// ══════════════════════════════════════════════════════════
phase('Components');

// Topological sort: atoms before molecules
const orderedComps = compPlan.components.slice().sort((a, b) => {
  const aDeps = (a.dependsOn || []).length;
  const bDeps = (b.dependsOn || []).length;
  return aDeps - bDeps;
});

// Build each component in a pipeline
// Atoms can be parallel; molecules wait for their dependencies
const builtComponents = await pipeline(
  orderedComps,
  (comp) => agent(
    `You are running Phase 2: Component Build for "${comp.name}".

    Figma file: ${brief.figmaFileKey}, Page: ${brief.figmaPageId || 'current'}
    Design tokens: ${JSON.stringify(tokens)}
    Component spec: ${JSON.stringify(comp)}
    Already-built components (available as instances): pass as context

    ━━━ LAYOUT RULES (CRITICAL — check before every use_figma call) ━━━
    ${LAYOUT_RULES}

    ━━━ PACVUE COLOR RULES (MANDATORY) ━━━
    ${COLOR_SPEC}

    ━━━ FIGMA RULES ━━━
    - Load figma-use skill before calling use_figma
    - Max 5 operations per use_figma call — split into multiple calls
    - ALWAYS createAutoLayout() for containers — NEVER createFrame() with absolute x/y
    - resize() BEFORE setting primaryAxisSizingMode
    - Set layoutSizingHorizontal/Vertical = FILL AFTER appendChild
    - Before building any component, call get_design_context on its reference node
    - Return the component node ID when done

    Steps:
    1. Create the base component structure (auto-layout)
    2. Add component properties (TEXT, BOOLEAN, INSTANCE_SWAP)
    3. Create variants if needed (combineAsVariants)
    4. Bind fills/spacing to Figma variables
    5. Add prototype interactions (hover state if applicable)
    6. Take get_screenshot to validate
    7. Return { name, nodeId, status }`,
    { schema: COMP_RESULT_SCHEMA, phase: 'Components', label: `build-${comp.name}` }
  )
);

// Build registry: name → nodeId
const componentRegistry = {};
for (const result of builtComponents.filter(Boolean)) {
  if (result.status !== 'failed') {
    componentRegistry[result.name] = result.nodeId;
    log(`✓ ${result.name}: ${result.nodeId}`);
  } else {
    log(`✗ ${result.name} failed: ${result.notes}`);
  }
}

// ══════════════════════════════════════════════════════════
// PHASE 3 — LAYOUT ASSEMBLY (composition only)
// ══════════════════════════════════════════════════════════
phase('Assembly');

const layout = await agent(
  `You are running Phase 3: Layout Assembly.

  Brief: ${JSON.stringify(brief)}
  Figma file: ${brief.figmaFileKey}, Page: ${brief.figmaPageId}
  Component registry (name → nodeId): ${JSON.stringify(componentRegistry)}
  Design tokens: ${JSON.stringify(tokens)}

  RULE: Do NOT create new components. Only instantiate existing ones using createInstance().
  If a component is missing from the registry, return an error and stop.

  Steps:
  1. Load figma-use skill
  2. Create the page frame
  3. For each section, import component instances from the registry
  4. Position and configure instances
  5. Take a screenshot of the full layout

  Return { layoutNodeId, screenshotTaken: true }`,
  { phase: 'Assembly' }
);

// ══════════════════════════════════════════════════════════
// PHASE 4 + 5 — INTERACTIONS & REVIEW (parallel)
// ══════════════════════════════════════════════════════════
// PHASE 4 + 5 — INTERACTIONS & BLIND CRITIQUE (parallel)
// ══════════════════════════════════════════════════════════
const [, review] = await parallel([

  // Phase 4: Add interactions
  () => agent(
    `You are running Phase 4: Prototype Interactions.

    Layout node: ${JSON.stringify(layout)}
    Component registry: ${JSON.stringify(componentRegistry)}
    Figma file: ${brief.figmaFileKey}

    Add hover states and click interactions using the reactions API.
    Each component should already have hover variants from Phase 2.
    Connect them using ON_HOVER → CHANGE_TO.

    Return { interactionsAdded: number }`,
    { phase: 'Assembly', label: 'interactions' }
  ),

  // Phase 5: BLIND CRITIQUE — independent second opinion
  // IMPORTANT: This agent does NOT receive componentRegistry, tokens, or layout details.
  // It only sees the original brief + a fresh screenshot. This is intentional.
  // It must form its own view without knowing what decisions were made.
  () => agent(
    `You are a visual QA reviewer conducting a BLIND review.

    You do NOT know how this design was built.
    You do NOT know what implementation decisions were made.
    You have NOT seen the component code or build process.

    You only have:
    1. The original brief (what was requested)
    2. A fresh screenshot you will take yourself (what was delivered)

    ━━━ ORIGINAL BRIEF ━━━
    Task: "${brief.task}"
    Success criteria: "${brief.successCriteria}"
    Figma file: ${brief.figmaFileKey}

    ━━━ YOUR TASK ━━━
    1. Take a screenshot of the current Figma page using get_screenshot
    2. Compare the screenshot against the brief — does the result match what was requested?
    3. Apply these checks with an adversarial mindset: your job is to find problems, not validate decisions

    NEVER ask "was X intentional?" — if it doesn't match the brief, flag it.

    ━━━ LAYOUT CHECKS (CRITICAL) ━━━
    ${LAYOUT_RULES}
    - Flag CRITICAL: structural containers with absolute x/y (not auto-layout)
    - Flag CRITICAL: frames that would break on resize (no FILL sizing)
    - Flag MAJOR: tag opacity on frame (not fill color)
    - Flag MAJOR: pagination active page with filled background

    ━━━ COLOR CHECKS (MAJOR) ━━━
    ${COLOR_SPEC}
    - Flag MAJOR: button not using #ff9f43 or #0d6efd
    - Flag MAJOR: text color tier mismatch (#45464f / #66666c / #b2b2b8)
    - Flag MAJOR: status badge color doesn't match semantic state
    - Flag MAJOR: blue primary action on an orange-themed page
    - Flag MINOR: border not from #dedfe3 / #edeef1 family
    - Flag MINOR: tag background is solid instead of rgba

    Note: scroll/overflow is a dev concern — do not flag as a design blocker.

    Return a structured report with pass/fail per criterion and a blockers list.`,
    { schema: REVIEW_SCHEMA, phase: 'Review', label: 'blind-critic' }
  ),

]);

// ── Final summary ─────────────────────────────────────────
const passed = review?.passed ?? false;
const blockers = review?.blockers ?? [];

log(`Review: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
if (blockers.length > 0) {
  log(`Blockers: ${blockers.join(', ')}`);
}

// ══════════════════════════════════════════════════════════
// PHASE 6 — DESIGN SPEC OUTPUT (Mode A → Mode B bridge)
// Only runs when review passes. Writes /tmp/design-spec.json
// so Mode B can read component names and token mappings.
// ══════════════════════════════════════════════════════════
const DESIGN_SPEC_SCHEMA = {
  type: 'object',
  properties: {
    task:          { type: 'string' },
    components:    { type: 'object' },
    colorTokens:   { type: 'object' },
    spacing:       { type: 'object' },
    figmaFileKey:  { type: 'string' },
    figmaPageId:   { type: 'string' },
  },
  required: ['task', 'components', 'colorTokens'],
};

let designSpec = null;
if (passed) {
  phase('Design Spec');
  designSpec = await agent(
    `You are running Phase 6: Design Spec Output.

    A Mode A Figma design has just been completed and reviewed.
    Extract a structured spec that a Mode B Vue Demo developer can use.

    Available data:
    - Brief: ${JSON.stringify(brief)}
    - Component registry (name → nodeId): ${JSON.stringify(componentRegistry)}
    - Tokens extracted: ${JSON.stringify(tokens)}

    Build the spec:
    1. "task": one-line description of what was designed
    2. "components": map of PascalCase component name → figma nodeId (from registry)
    3. "colorTokens": map of semantic role → CSS variable name
       e.g. { "primary": "--pac-theme-color", "title": "--color-title--", "body": "--color-text--",
               "muted": "--color-info--", "border": "--pac-filter-line-color" }
    4. "spacing": map of layout role → CSS variable name
       e.g. { "card-padding": "--pac-s4--", "section-gap": "--pac-s6--", "item-gap": "--pac-s2--" }
    5. "figmaFileKey" and "figmaPageId" from brief

    Return the spec object. It will be saved to /tmp/design-spec.json for Mode B.`,
    { schema: DESIGN_SPEC_SCHEMA, phase: 'Design Spec', label: 'spec-output' }
  );

  if (designSpec) {
    log(`Design spec ready — ${Object.keys(designSpec.components || {}).length} components, save to /tmp/design-spec.json`);
  }
}

return {
  brief,
  tokens,
  componentRegistry,
  layout,
  review,
  designSpec,
  status: passed ? 'complete' : 'needs-revision',
};
