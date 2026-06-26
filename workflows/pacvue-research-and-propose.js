export const meta = {
  name: 'pacvue-research-and-propose',
  description: 'Phase R+C+P+P-Critique: fetch docs, scan project code, propose Figma properties, adversarial review (≤2 rounds). Returns Phase A1 proposal for human approval.',
  phases: [
    { title: 'Research', detail: 'Fetch Element Plus + Atlassian docs, scan project code — all in parallel' },
    { title: 'Propose',  detail: 'Agent A drafts recommended Figma property set' },
    { title: 'Critique', detail: 'Agent B adversarial review + Agent A revision (max 2 rounds)' },
  ],
};

// ─── args ────────────────────────────────────────────────────────────────────
// Pass componentName as a string: args = "Textarea"
// Or as object: args = { componentName: "Textarea", projectRoot: "/path/to/project" }
const componentName = typeof args === 'string' ? args : (args?.componentName ?? 'Component');
const PROJECT = args?.projectRoot ?? '/Users/kiwi.lu/Desktop/element/elementPlus-vue3';

log(`▶ ${componentName} — Phase R+C starting in parallel`);

// ─── Phase R + Phase C (parallel) ───────────────────────────────────────────
phase('Research');

const [elementPlusResearch, atlassianResearch, codeAnalysis] = await parallel([

  // ── R1: Element Plus (primary reference — always try live fetch) ──
  () => agent(
    `You are doing Phase R Research for the **${componentName}** component — Element Plus library only.

Fetch this URL with WebFetch: https://element-plus.org/en-US/component/${componentName.toLowerCase()}.html

Extract ALL of the following from the page:
1. Complete props table: prop name | type | default | accepted enum values | one-line semantic
2. Events: name + trigger condition
3. Slots: name + description
4. Every visual state demonstrated in demos (name them precisely, e.g. "disabled", "loading", "error")
5. Size variants if any
6. Any API differences between <el-input> and <el-input type="textarea"> if relevant

If the page fails to load or is JS-rendered blank, fall back to your training knowledge about Element Plus ${componentName} and mark EVERY fact "训练数据，未实时核验⚠️".

Output as detailed markdown. Be exhaustive — missing a prop is worse than including an extra one.`,
    { phase: 'Research', label: 'element-plus' }
  ),

  // ── R2: Atlassian Design System (secondary — best-effort) ──
  () => agent(
    `You are doing Phase R Research for the **${componentName}** component — Atlassian Design System only.

Try WebFetch: https://atlassian.design/components/${componentName.toLowerCase()}

If it loads: extract props/API, visual states, sizes, accessibility notes, usage guidelines.
If it fails (ADS often requires login): use training knowledge and mark ALL facts "训练数据，未实时核验⚠️".
If Atlassian has no equivalent ${componentName} component: respond with exactly "SKIP: no equivalent component in ADS."

Output as concise markdown. This is a secondary reference — brevity is fine.`,
    { phase: 'Research', label: 'atlassian' }
  ),

  // ── C: Project Code Analysis (Bash + Read) ──
  () => agent(
    `You are doing Phase C Code Analysis for the **${componentName}** component.

Project root: ${PROJECT}

Steps — use Bash to search, Read to read files:

1. Find source files:
   find "${PROJECT}/src/components" -iname "*${componentName}*" 2>/dev/null | head -20
   ls "${PROJECT}/src/components/" | grep -i "${componentName.toLowerCase()}"

2. Read ALL found .vue and .scss files completely.

3. Extract and report for each file:
   a. All props from defineProps() or props:{} — name, type, default, any inline comment
   b. CSS classes indicating visual states: .is-xxx, &:hover, &.disabled, .active, .error, .warning, .success, .selected, etc.
   c. CSS variables used: var(--xxx). Also grep "${PROJECT}/src/styles" for their resolved values.
   d. Slot definitions: <slot name="xxx">
   e. Emit definitions: defineEmits([...]) or emits:[...]

4. Check for demo/view file: "${PROJECT}/src/views/${componentName}.vue" or similar. Report real-world usage patterns.

5. If NO dedicated component file found: write "NO_DEDICATED_COMPONENT" and explain how the functionality is provided (e.g., via type prop on PacvueInput).

Output as detailed markdown with exact file paths and code evidence. Mark every fact with its source file.`,
    { phase: 'Research', label: 'code-scan' }
  ),
]);

log(`Research done. elementPlus=${elementPlusResearch?.length} chars | atlassian=${atlassianResearch?.length} chars | code=${codeAnalysis?.length} chars`);

// ─── Phase P: Agent A initial proposal ──────────────────────────────────────
phase('Propose');

const PROPOSAL_SCHEMA = {
  type: 'object',
  required: ['componentName', 'sourcePaths', 'industryConsensusMarkdown', 'codeRealityMarkdown', 'recommendedProperties', 'notInComponentSet', 'openQuestions', 'componentSetCount', 'totalVariants'],
  properties: {
    componentName: { type: 'string' },
    sourcePaths: { type: 'array', items: { type: 'string' }, description: 'Actual file paths found in code analysis' },
    industryConsensusMarkdown: { type: 'string', description: 'Markdown table: dimension × library' },
    codeRealityMarkdown: { type: 'string', description: 'Markdown summary: existing props, CSS classes, missing vs industry' },
    recommendedProperties: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'propType', 'values', 'source'],
        properties: {
          name:     { type: 'string' },
          propType: { type: 'string', enum: ['variant', 'boolean', 'text', 'no_need'] },
          values:   { type: 'array', items: { type: 'string' } },
          source:   { type: 'string', description: 'e.g. "Element Plus verified" / "code: .errorInput class" / "consensus"' },
          note:     { type: 'string' },
        },
      },
    },
    notInComponentSet: {
      type: 'array',
      items: {
        type: 'object',
        required: ['propName', 'reason'],
        properties: {
          propName: { type: 'string' },
          reason:   { type: 'string' },
        },
      },
    },
    openQuestions: { type: 'array', items: { type: 'string' } },
    componentSetCount: { type: 'number', description: '1 unless dimension product > 16 forces a split' },
    totalVariants: { type: 'number', description: 'Product of all variant dimensions per ComponentSet' },
  },
};

let proposal = await agent(
  `You are Agent A (Proposer). Draft a Figma Reference Card property set for the **${componentName}** component.

═══ PHASE R: Industry Research ═══

[Element Plus — Primary Reference]
${elementPlusResearch}

[Atlassian Design System — Secondary Reference]
${atlassianResearch}

═══ PHASE C: Project Code ═══

${codeAnalysis}

═══ TASK ═══

Produce a recommended property set for a Figma ComponentSet.

CRITICAL RULES — violating any of these causes automatic Critic failure:
1. Use ONLY facts from the research/code above. Never invent props, states, or CSS classes.
2. Mark "source: code" ONLY for items explicitly found in the code analysis.
3. Mark all Atlassian data with ⚠️ if it came from training knowledge (not live fetch).
4. State (interaction) and Validation MUST be SEPARATE dimensions:
   - State = Default | Hover | Focus | Disabled  (interaction only)
   - Validation = None | Error | Warning | Success  (validation only)
   - "None" not "Normal" or "Default" for the no-validation case
5. Dimension product > 16 → split into multiple ComponentSets; set componentSetCount > 1.
6. If project has no dedicated component file → note it in codeRealityMarkdown; the card defines canonical design.

Return structured proposal.`,
  { schema: PROPOSAL_SCHEMA, phase: 'Propose', label: 'agent-a-initial' }
);

log(`Agent A draft: ${proposal.totalVariants} variants, ${proposal.componentSetCount} ComponentSet(s), ${proposal.openQuestions?.length} open questions`);

// ─── Phase P-Critique: A↔B loop (max 2 rounds) ──────────────────────────────
phase('Critique');

const CRITIQUE_SCHEMA = {
  type: 'object',
  required: ['passed', 'issues', 'suggestions'],
  properties: {
    passed: { type: 'boolean' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'category', 'detail'],
        properties: {
          severity: { type: 'string', enum: ['high', 'med', 'low'] },
          category: { type: 'string' },
          detail:   { type: 'string' },
        },
      },
    },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
};

// Compact raw-facts summary for Agent B (saves tokens; B only needs it for cross-checking "source: code")
const RAW_FACTS_FOR_B = [
  '## Element Plus (trimmed)',
  elementPlusResearch?.substring(0, 3000) + (elementPlusResearch?.length > 3000 ? '\n...(truncated)' : ''),
  '## Atlassian (trimmed)',
  atlassianResearch?.substring(0, 800)  + (atlassianResearch?.length  >  800 ? '\n...(truncated)' : ''),
  '## Code Analysis (trimmed)',
  codeAnalysis?.substring(0, 3000)      + (codeAnalysis?.length       > 3000 ? '\n...(truncated)' : ''),
].join('\n\n');

let round = 0;
let finalCritique = null;

while (round < 2) {
  round++;
  log(`Critique round ${round}/2...`);

  finalCritique = await agent(
    `You are Agent B (Critic). Review Agent A's Figma Reference Card property proposal.
Only find problems — do NOT rewrite. Output strict JSON.

═══ RAW FACTS (what A was given) ═══
${RAW_FACTS_FOR_B}

═══ AGENT A'S PROPOSAL (round ${round}) ═══
${JSON.stringify(proposal, null, 2)}

═══ CHECKLIST ═══
1. Naming: consistent English style, case, plural form across all names and values?
2. Completeness: any standard props/states from raw facts that A omitted?
3. Redundancy: two properties expressing the same visual dimension?
4. Code consistency: spot-check 1-2 items marked "source: code" — do they actually appear in the code section of raw facts?
5. Figma necessity: does each recommended property produce a visually distinct variant?
6. State vs Validation separation: are interaction states and validation states properly split into two dimensions?
7. Variant explosion: totalVariants ≤ 16 per ComponentSet? If not, split needed.
8. Fabricated sources: did A invent libraries, file paths, CSS class names not in raw facts?

passed=true ONLY if: zero high-severity issues AND no fabricated facts AND all ComponentSets ≤ 16 variants.`,
    { schema: CRITIQUE_SCHEMA, phase: 'Critique', label: `agent-b-r${round}` }
  );

  const highCount = finalCritique.issues.filter(i => i.severity === 'high').length;
  const medCount  = finalCritique.issues.filter(i => i.severity === 'med').length;
  log(`B round ${round}: passed=${finalCritique.passed} | high=${highCount} med=${medCount} low=${finalCritique.issues.length - highCount - medCount}`);

  if (finalCritique.passed) break;

  if (round < 2) {
    // A revises — strict anti-fabrication constraints preserved
    proposal = await agent(
      `You are Agent A (Proposer), revising your **${componentName}** property proposal after Critic review.

═══ CRITIC ISSUES ═══
${JSON.stringify(finalCritique.issues, null, 2)}

═══ SUGGESTIONS ═══
${finalCritique.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}

═══ HARD CONSTRAINTS — violations cause automatic re-fail ═══
1. Do NOT add any library not in original research (no Ant Design, MUI, Arco, etc.)
2. Do NOT invent props, CSS classes, or file paths
3. "source: code" only for items explicitly in the code analysis
4. ONLY restructure / rename / remove based on existing facts
5. If resolving an issue needs new research: write "需追加调研: xxx" — do NOT guess

═══ ORIGINAL RAW FACTS ═══
${RAW_FACTS_FOR_B}

Return revised proposal.`,
      { schema: PROPOSAL_SCHEMA, phase: 'Critique', label: `agent-a-r${round}-revision` }
    );
    log(`Agent A revision ready: ${proposal.totalVariants} variants`);
  }
}

// ─── Orchestrator merge ───────────────────────────────────────────────────────
// If B still didn't pass after 2 rounds: merge residual high issues into openQuestions
const critiqueNotes = finalCritique?.passed
  ? `A→B ${round} round(s), B final passed=true`
  : `A→B 2 rounds, B round 2 still not passed — ${finalCritique.issues.filter(i => i.severity === 'high').length} high dispute(s) merged into open questions`;

if (!finalCritique?.passed && finalCritique?.issues?.length) {
  const residualDisputes = finalCritique.issues
    .filter(i => i.severity === 'high')
    .map(i => `[Dispute — ${i.category}] ${i.detail}`);
  proposal = {
    ...proposal,
    openQuestions: [...(proposal.openQuestions ?? []), ...residualDisputes],
  };
}

log(`✓ Done. ${critiqueNotes}`);

// ─── Return Phase A1 payload ─────────────────────────────────────────────────
// The main conversation thread formats this into the Phase A1 confirmation prompt
// and waits for user approval before proceeding to Phase F.
return {
  _phaseA1Ready: true,
  componentName,
  sourcePaths: proposal.sourcePaths,
  industryConsensusMarkdown: proposal.industryConsensusMarkdown,
  codeRealityMarkdown: proposal.codeRealityMarkdown,
  recommendedProperties: proposal.recommendedProperties,
  notInComponentSet: proposal.notInComponentSet,
  openQuestions: proposal.openQuestions,
  componentSetCount: proposal.componentSetCount,
  totalVariants: proposal.totalVariants,
  critiqueRounds: round,
  critiqueNotes,
};
