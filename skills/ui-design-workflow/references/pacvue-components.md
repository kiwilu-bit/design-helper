# Pacvue Component Specs
Extracted from actual Figma design system nodes. Use these EXACTLY — never invent.

---

## RULE #0: Auto-Layout Is Non-Negotiable
Every container that holds children MUST use `figma.createAutoLayout()`.
NEVER use `figma.createFrame()` for structural containers.
This ensures the layout adapts when the parent resizes.

```
✅ CORRECT:
const row = figma.createAutoLayout('HORIZONTAL');
row.itemSpacing = 8;
parent.appendChild(row);
row.layoutSizingHorizontal = 'FILL'; // FILL after appendChild

❌ WRONG:
const row = figma.createFrame();
row.x = 100; row.y = 200; // absolute positioning
```

---

## DatePicker Input
Node: 15087:22990 | Default state

```
width: 280px (default) — can be wider
height: 36px
bg: white
border: 1px solid #dedfe3
border-radius: 4px
layout: HORIZONTAL auto-layout, px-12, justify-between, items-center
gap: 8px
```

**Left content:**
- Filled: "Nov 2025 ~ Oct 2025" — 14px Regular #66666c
- Placeholder: "Start Date ~ End Date" — 14px Regular #b2b2b8

**Right content:**
- Calendar icon: 20×20px (gray #b2b2b8)

**Build pattern:**
```js
const dp = figma.createAutoLayout('HORIZONTAL');
dp.resize(280, 36); dp.primaryAxisSizingMode='FIXED'; dp.counterAxisSizingMode='FIXED';
dp.paddingLeft=12; dp.paddingRight=12; dp.counterAxisAlignItems='CENTER'; dp.itemSpacing=8;
dp.fills=[white]; dp.cornerRadius=4;
dp.strokes=[{color:#dedfe3}]; dp.strokeWeight=1;
// Append text node (FILL width) + calendar icon frame (20×20 FIXED)
```

---

## Search Input
Node: 15087:23079 | Default state

```
width: 256px (default)
height: 36px
bg: white
border: 1px solid #dedfe3
border-radius: 4px
layout: HORIZONTAL auto-layout, px-12, items-center, justify-between
```

**Left group (gap-8):**
- Search icon: 20×20 (ellipse stroke 1.5px #b2b2b8, no fill)
- Placeholder text: 14px Regular #b2b2b8 "Placeholder"

**Right (hidden in default, shown in filled):**
- Close (×) icon: 20×20

---

## Tag (Outline style — STATUS use cases)
Node: 15087:23123

**Outline (most common — for Fulfillment/Status tags):**
```
height: 22px
padding: px-8 py-2
border-radius: 4px
font: 12px Inter Medium
layout: HORIZONTAL auto-layout, items-center
```

| Status | bg | border | text |
|---|---|---|---|
| Success/Shipped/Active | `rgba(40,199,111, 0.05)` | `rgba(40,199,111, 0.25)` 1px | `#28c76f` |
| Danger/Delayed/Error | `rgba(234,84,85, 0.05)` | `rgba(234,84,85, 0.25)` 1px | `#ea5455` |
| Warning/Pending | `rgba(255,159,67, 0.05)` | `rgba(255,159,67, 0.25)` 1px | `#ff9f43` |
| Default/Neutral | transparent | `#dedfe3` 1px | `#66666c` |
| Disabled | `rgba(178,178,184, 0.05)` | `rgba(178,178,184, 0.25)` 1px | `#b2b2b8` |

**CRITICAL:** Set opacity on the FILL color, NOT on the frame:
```js
// ✅ CORRECT
frame.fills = [{ type:'SOLID', color:successColor, opacity:0.05 }];
frame.strokes = [{ type:'SOLID', color:successColor, opacity:0.25 }];
// ❌ WRONG
frame.opacity = 0.05; // this makes children transparent too!
```

---

## KPI Stat Card
No specific node — inferred from design system patterns.

```
layout: VERTICAL auto-layout
padding: 16px all sides
gap: 6px between items
bg: white
border: 1px #edeef1
border-radius: 8px
shadow: 0 2px 12px rgba(0,0,0,0.06)
width: FILL (in KPI row)
```

**Structure (top to bottom):**
1. Label: 11px Regular #b2b2b8 — FILL width
2. Value: 26px Semi Bold #45464f — FILL width
3. Comparison row (HORIZONTAL auto-layout, gap-6, items-center):
   - Trend text: "▲ +12.5%" — 11px Medium #28c76f (or danger color)
   - "vs last month" — 11px Regular #b2b2b8

**NO green pill background for trend** — just inline colored text + muted text side by side.

---

## Table Component
Node: 15087:14773

**Row heights:**
- Header: 48px — WHITE background (not gray!)
- Data rows: 72px each

**Header cells:**
- Font: 13-14px Regular #66666c or #45464f (NOT 10px! NOT bold!)
- Background: WHITE

**Item column (320px typical):**
- Product image: 52×52px, cornerRadius 8px
- Name: 13-14px Medium #45464f
- SKU/ASIN: 11px Regular **#ff9f43** (orange link color — per design)
- Layout: HORIZONTAL auto-layout, gap-10, items-center

**Status/Tag columns:**
- Use Tag Outline style (see above)

**Row structure:**
```
Data Row (HORIZONTAL auto-layout, 72px, items-center, FILL width):
├── Checkbox cell (40px FIXED)
├── Item cell (320px FIXED): HORIZONTAL: image(52×52) + name-col(VERTICAL)
├── Orders cell (100px FIXED): text x=8, y=26
├── Revenue cell (130px FIXED)
├── Units cell (100px FIXED)
├── Stock cell (100px FIXED) — orange/red if low/zero
├── Fulfillment cell (150px FIXED): Tag instance
├── Status cell (120px FIXED): Tag instance
└── Action cell (52px FIXED): "⋯" text
```

---

## Pagination
Node: 15087:23312

**Structure (HORIZONTAL auto-layout, justify-between, px-16 py-6, h-44):**

**Left side (gap-4, items-center):**
- "Total 100 entries," — 14px Regular `#6e6b7b`
- Dropdown "10/page ▼": 32px height, border `#d8d6de`, radius 5px, px-10 py-7

**Right side (gap-8, items-center):**
- `<` button: 32×32, border #dedfe3, radius 4px, `‹` muted
- Page buttons 1,2,3: 32×32, border #dedfe3, 14px Regular #66666c
- **Active page**: 32×32, **border #ff9f43 ONLY, white bg, 14px Medium #ff9f43** — NO filled background!
- Pages 5,6: same as 1,2,3
- `···` ellipsis: 32×32
- "1000": auto-width, 32px height, border #dedfe3
- `>` button: 32×32, border #dedfe3
- "Go to page" — 14px Regular #66666c
- Input: 58×32, border #dedfe3, "1" (14px Medium #45464f)

**CRITICAL:** Active page = orange BORDER + orange TEXT + WHITE BACKGROUND
```js
// ✅ CORRECT active page button
btn.fills = [{ type:'SOLID', color:white }]; // white background
btn.strokes = [{ type:'SOLID', color:orange }]; // orange border
textNode.fills = [{ type:'SOLID', color:orange }]; // orange text
// ❌ WRONG — filled orange background
btn.fills = [{ type:'SOLID', color:orange }];
```

---

## Filter Button
Tertiary style button:
```
height: 36px
bg: white
border: 1px #dedfe3
border-radius: 4px
padding: px-12
font: 14px Medium #66666c
layout: HORIZONTAL auto-layout, gap-6, items-center
content: filter icon (16px) + "Filter" text
```
