---
name: pacvue-color-system
description: Pacvue 完整色彩规范 — 7 个色彩类别、语义用法、Build/Critique 规则
metadata: 
  node_type: memory
  type: project
  originSessionId: 276213df-909f-4cb6-bf09-53f34f7bd118
---

Pacvue 有 7 类颜色，各有严格的使用场景。Build 时先查这里，Critique 时按此核查。

**Why:** 用户明确说明 — 不按规范用色是 major 问题，Build 不能自己发明颜色。

**How to apply:**
- 所有 use_figma 调用在写颜色前先查 [[pacvue-color-system]] 对应类别
- Critique prompt 里加入 Semantic Colors 的 checklist

## 7 类颜色速查

### 1. Theme（主题色 → 按钮）
- Orange: `#ff9f43` — Primary Button、active 状态
- Blue: `#0d6efd` — CTA、链接

### 2. Function（功能色 → 状态提示）
- Success: `#28c76f` (bg: `#eaf9f1`)
- Danger: `#ea5455` (bg: `#fdeeee`)
- Warning: `#ff9f43` (bg: `#fff5ec`)
- Info: `#82858b` (bg: `#f0f0f0`)

### 3. Gray（中性灰，少量用）
- `#82858b` / `#686a6f`

### 4. Transparency（透明度 → Tag 专用）
- 格式：主色 + 10% opacity，如 `rgba(255,159,67,0.1)`

### 5. Accent（强调色 → 图表专用，UI 组件不用）

### 6. Neutral（文字三档，最常用）
- 标题: `#45464f`（--color-title--）
- 正文: `#66666c`（--color-text--）
- 辅助: `#b2b2b8`（--color-info--）
- 边框: `#dedfe3` / `#edeef1`
- 页面底色: `#f2f3f5`

### 7. Semantic（组件规范）
- Toggle active: `rgba(255,159,67,0.05)` bg + orange border + orange text
- Toggle inactive: white bg + `#dedfe3` border + `#82858b` text
- Input focus border: `#ff9f43`
- Tab active: orange text + 2px orange underline
- Status Draft: `#82858b` text + `#f0f0f0` bg
- Status Approved: `#28c76f` text + `#eaf9f1` bg
- Status Pending: `#ff9f43` text + `#fff5ec` bg

完整规范见 `.claude/skills/ui-design-workflow/references/pacvue-color-system.md`
