---
name: pacvue-autolayout-rule
description: Auto-layout is mandatory for ALL structural containers in Pacvue Figma builds. Never use absolute positioning for layout.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 276213df-909f-4cb6-bf09-53f34f7bd118
---

ALWAYS use `figma.createAutoLayout()` for any frame that contains children.
NEVER use `figma.createFrame()` for structural layout containers.

**Why:** Absolute positioning breaks when the parent is resized (e.g. 1440→1600px). Auto-layout ensures children reflow. This has caused repeated failures in builds.

**How to apply:**
- Page wrapper → HORIZONTAL auto-layout
- Sidebar → VERTICAL auto-layout
- Main content → VERTICAL auto-layout
- Every row (toolbar, header, data row) → HORIZONTAL auto-layout
- Every column/card → VERTICAL auto-layout
- Set FILL sizing AFTER appendChild, never before

**Pattern:**
```js
const row = figma.createAutoLayout('HORIZONTAL');
parent.appendChild(row);
row.layoutSizingHorizontal = 'FILL'; // AFTER append!
```

**Critique check:** Any frame using absolute x/y positioning inside a parent that should be responsive = CRITICAL error.
