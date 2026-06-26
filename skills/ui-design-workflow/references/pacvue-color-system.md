# Pacvue Color System

Source: Extracted from product CSS variables + design system components.
Verified against: `--pac-*`, `--el-color-*`, `--color-*` tokens.

---

## 1. Theme Colors — 主题色（按钮相关）

两套主题，通过 Brand 变量切换。所有 **Primary Button** 必须用主题色。

| Token | Hex | 用途 |
|---|---|---|
| `--pac-theme-color` / `--el-color-primary` | `#ff9f43` | Orange 主题 — 默认主按钮、active 状态、强调 |
| `--pac-project-blue` / `--pac-href-color` | `#0d6efd` | Blue 主题 — CTA 蓝、链接色 |

**Critique 检查点**: Primary Button 必须是 `#ff9f43` 或 `#0d6efd` 之一，不能用其他颜色。

---

## 2. Function Colors — 功能色（状态提示）

用于 alert、toast、badge、状态反馈，**不用于按钮**。

| Token | Hex | 用途 |
|---|---|---|
| `--el-color-success` | `#28c76f` | 成功 / 确认 / Approved |
| `--el-color-danger` / `--el-color-error` | `#ea5455` | 失败 / 错误 / 删除警告 |
| `--el-color-warning` | `#ff9f43` | 警告（同 orange theme） |
| `--el-color-info` | `#82858b` | 中性提示 |

**Light variants** (用于 tag 背景、alert 背景):
- Success light: `#eaf9f1` (light-9) / `#d4f4e2` (light-8)
- Danger light: `#fdeeee` (light-9) / `#fbdddd` (light-8)
- Warning light: `#fff5ec` (light-9)

**Critique 检查点**:
- Status badge "Approved" → `#28c76f` text + light bg
- Status badge "Draft" → `#82858b` text + gray bg `#f0f0f0`
- Status badge "Pending" → `#ff9f43` text + `#fff5ec` bg
- Error/reject state → `#ea5455`

---

## 3. Gray — 中性灰（少量使用）

| Token | Hex | 用途 |
|---|---|---|
| `--el-color-info-light-3` | `#a8aaae` | — |
| `--el-color-info` | `#82858b` | 禁用文字、次要 icon |
| `--el-color-info-dark-2` | `#686a6f` | — |

---

## 4. Transparency Scales — 透明度（Tag 专用）

用于 Tag 组件的背景色。格式：主色 + opacity。

| 用法 | 值 |
|---|---|
| Orange tag bg | `rgba(255,159,67, 0.1)` → `--pac-filter-change-bgcolor` |
| Blue tag bg | `rgba(13,110,253, 0.1)` |
| Success tag bg | `rgba(40,199,111, 0.1)` |
| Danger tag bg | `rgba(234,84,85, 0.1)` |

**Critique 检查点**: Tag 组件背景必须用透明度色，不能用纯色填充。

---

## 5. Accent Colors — 强调色（图表专用）

用于图表折线、柱状图，**不用于 UI 组件**。不在此文档详细展开。

**Critique 检查点**: 如果在非图表区域看到偏亮的非主题色（紫、青、黄绿等），应该标记为 major 错误。

---

## 6. Neutral Colors — 中性色（文字用色）

这是用得最多的颜色族。每个 token 有明确的语义场景。

| Token | Hex | 场景 |
|---|---|---|
| `--color-title--` | `#45464f` | **标题文字**：页面 title、section header、card title、label |
| `--color-text--` | `#66666c` | **正文文字**：描述性文字、meta 信息、正文内容 |
| `--color-info--` | `#b2b2b8` | **辅助/提示**：placeholder、secondary info、disabled text |
| `--icon-dark--` | `#66666c` | 默认 icon 颜色 |
| `--icon-light--` | `#b2b2b8` | 浅色 icon、次要 icon |
| `--icon-disabled--` | `#dedfe3` | 禁用态 icon |
| `--el-border-color` | `#dcdfe6` | 默认边框 |
| `--el-border-color-light` | `#e4e7ed` | 浅边框 |
| `--pac-filter-line-color` / `--el-border-color-extra-light` | `#dedfe3` | 分割线、input 边框 |
| `--el-bg-color-page` | `#f2f3f5` | 页面底色 |
| `--el-fill-color-lighter` | `#fafafa` | 表格行、卡片背景 |

**Critique 检查点（重要）**:
- 若 title/section header 用了 `#b2b2b8` → 太弱，应用 `#45464f`
- 若正文用了 `#45464f` → 太重，应用 `#66666c`
- 若 placeholder 用了 `#45464f` → 错误，应用 `#b2b2b8`
- 若 meta/secondary info 用了 `#66666c` → 可能偏重，考虑 `#b2b2b8`

---

## 7. Semantic Colors — 语义化（组件规范）

组件内部颜色规范：

### 按钮
| Appearance | Background | Text | Border |
|---|---|---|---|
| Primary (Orange) | `#ff9f43` | `#fff` | — |
| Primary (Blue) | `#0d6efd` | `#fff` | — |
| Secondary | `#fff` | `#ff9f43` | `#ff9f43` |
| Tertiary | `#fff` | `#66666c` | `#dedfe3` |
| Borderless | `#fff` | `#66666c` | — |
| Disabled | `#f5f7fa` | `#b2b2b8` | `#e4e7ed` |

### 输入框
| State | Border | Text |
|---|---|---|
| Default | `#dedfe3` | `#45464f` |
| Focus | `#ff9f43` | `#45464f` |
| Placeholder | `#dedfe3` | `#b2b2b8` |
| Disabled | `#e4e7ed` | `#b2b2b8` |
| Error | `#ea5455` | `#45464f` |

### Tab 导航
| State | Text | Underline |
|---|---|---|
| Active (Orange theme) | `#ff9f43` | `#ff9f43` (2px) |
| Active (Blue theme) | `#0d6efd` | `#0d6efd` (2px) |
| Inactive | `#66666c` | — |

### Status Badge
| Status | Text | Background |
|---|---|---|
| Approved / Active | `#28c76f` | `#eaf9f1` |
| Draft / Default | `#82858b` | `#f0f0f0` |
| Pending Approval | `#ff9f43` | `#fff5ec` |
| Rejected / Error | `#ea5455` | `#fdeeee` |
| Paused | `#82858b` | `#f5f7fa` |

### Toggle / Segmented Control
| State | Background | Border | Text |
|---|---|---|---|
| Active | `rgba(255,159,67,0.05)` | `#ff9f43` (1px) | `#ff9f43` |
| Inactive | `#fff` | `#dedfe3` (1px) | `#82858b` |

---

## Build Rules（执行时优先使用）

1. **先查本文档**，再写颜色值。没有对应场景才考虑新色。
2. **文字三档**：标题用 `#45464f`，正文用 `#66666c`，辅助用 `#b2b2b8`。
3. **按钮只用主题色**：Primary = `#ff9f43` 或 `#0d6efd`。
4. **状态只用功能色**：success/warning/danger/info。
5. **Tag 背景必须透明度**：纯色填充是错误。
6. **非图表区域不用 Accent**。

## Critique Rules（核查时逐项检查）

- [ ] 所有 Primary Button 颜色是否为 `#ff9f43` 或 `#0d6efd`
- [ ] 标题/正文/辅助文字三档是否正确（`#45464f` / `#66666c` / `#b2b2b8`）
- [ ] Status badge 颜色是否匹配状态语义
- [ ] Tag 背景是否用透明度（不是纯色）
- [ ] 输入框 focus 状态是否用 `#ff9f43`
- [ ] 非图表区域是否误用了 Accent 颜色
- [ ] 分割线/边框是否用了 `#dedfe3` 或 `#edeef1`

---

## CRITICAL: Theme Color Consistency Rule

**One page = One theme color. Never mix orange and blue as primary actions on the same page.**

- Orange theme pages: ALL primary buttons, active states, selections → `#ff9f43`
- Blue theme pages: ALL primary buttons, active states, selections → `#0d6efd`

Common violations to flag as CRITICAL:
- Orange theme page has a blue (#0d6efd) primary button → WRONG
- Pagination active number in blue on orange theme page → WRONG
- Active tab underline mismatch with theme → WRONG
