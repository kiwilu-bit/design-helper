---
name: ui-design-workflow
description: >
  Three-mode UI workflow. Mode A = Figma high-fidelity (design system compliant).
  Mode B = Vue runnable demo (mock data, fast). Mode C = Figma quick wireframe (5 min, no polish).
  Always run Pre-flight Check first, then pick a mode.
---

# UI Design Workflow

---

## PRE-FLIGHT CHECK (run before EVERY session)

Before picking a mode, answer these 2 questions. If either answer is "no", resolve it first.

### Mode A pre-flight
- [ ] **Can I access the Figma file?** → Call `get_metadata` on the fileKey. If it errors, ask user to confirm URL/permissions before proceeding.
- [ ] **Is there a state file from a previous session?** → Check `/tmp/ui-design-state.json`. If it exists and `completedPhases` is non-empty, resume from the last completed phase instead of restarting.

### Mode B pre-flight
- [ ] **Is the dev server running?** → `lsof -i :5173 | grep LISTEN`. If not, start it: `npx vite --port 5173 > /tmp/vite.log 2>&1 &`
- [ ] **Does a similar component already exist?** → `ls src/views/ | grep -i <keyword>`. Reuse or extend before creating a new file.

---

## STEP 0: PICK A MODE

| | **Mode A — 精细化 Figma** | **Mode B — 快速 Demo** | **Mode C — 快速线框** |
|---|---|---|---|
| 交付物 | Figma 节点，可交付 | 浏览器可运行 Vue 页面 | Figma 草图，仅结构 |
| 工具 | `use_figma` Plugin API | Vue 3 SFC + 路由 | `use_figma`（简化） |
| 颜色/间距 | 必须用 Pacvue token | 尽量用 token，不强制 | 不要求，灰色占位 |
| Auto-layout | 强制，违反=CRITICAL | 不要求，flex/grid 即可 | 推荐但不强制 |
| 验收 | Blind Critique Loop（≤3轮）| HMR 无报错 + 3 种状态 | 截图对齐信息架构即可 |
| 速度 | 慢（精细） | 中（30 分钟内跑通） | 快（5 分钟出草图） |

**决策树：**
- 用户说「Figma / 设计稿 / 符合规范 / 交付」→ **Mode A**
- 用户说「demo / 跑起来 / 原型 / 演示」→ **Mode B**
- 用户说「草图 / 线框 / 快速看结构 / 方案讨论」→ **Mode C**
- 不确定 → 问：「需要 Figma 设计稿、可运行 Demo，还是快速结构草图？」

---

## Mode A — 精细化 Figma

### NON-NEGOTIABLE RULES

**Rule A: Auto-Layout 强制**
```js
// ✅ Always
const row = figma.createAutoLayout('HORIZONTAL')
parent.appendChild(row)
row.layoutSizingHorizontal = 'FILL' // FILL *after* appendChild

// ❌ Never for structural containers
const row = figma.createFrame()
row.x = 100
```

**Rule B: 读组件文档再动手**
建任何 Pacvue 组件前，先 `get_design_context` 读参考节点：
- DatePicker: `15087:22990` | Search: `15087:23079` | Tag: `15087:23123`
- Table: `15087:14773` | Pagination: `15087:23312`

**Rule C: 一个页面一种主题色**
Orange 页 = 所有 primary action 用 `#ff9f43`。绝不在 orange 页混入 `#0d6efd`。

**Rule D: Tag 透明度加在 fill 上，不加在 frame 上**
```js
// ✅
frame.fills = [{ type: 'SOLID', color: successColor, opacity: 0.05 }]
// ❌ 会让子文字也透明
frame.opacity = 0.05
```

**Rule E: Pagination active = orange border + white bg**
```js
// ✅
btn.fills      = [{ type: 'SOLID', color: white }]
btn.strokes    = [{ type: 'SOLID', color: orange }]
textNode.fills = [{ type: 'SOLID', color: orange }]
// ❌
btn.fills = [{ type: 'SOLID', color: orange }]
```

---

### Mode A Phases

#### Phase 0 — BRIEF
问用户 3 个问题，写入 `/tmp/ui-design-state.json`，锁定后不再改。

#### Phase 1 — DESIGN SYSTEM
提取 Figma variables；若无，用 Playwright 抓 `--pac-*` / `--el-*` CSS 变量。

#### Phase 2 — COMPONENT LIBRARY（不可跳过）
每个组件独立一次 `use_figma`，顺序：Atoms → Molecules → Organisms。
写完即存 ID → `state.components`。**Phase 3 不可在 Phase 2 未完成时启动。**

#### Phase 3 — LAYOUT ASSEMBLY
只用 `createInstance()` 实例化已有组件，不新建。

#### Phase 4 — INTERACTIONS
加 hover / click prototype reactions。

#### Phase 5 — BLIND CRITIQUE（真正独立的第二视角）

> **核心原则：** Critic 和 Builder 不共享上下文。Critic 只看原始 brief + 截图，完全不知道 Builder 做了哪些实现决策。

Critic agent 的 prompt 结构：
```
你是一个视觉 QA 评审员。
你不知道这个设计是怎么做出来的，也不知道 Builder 做了哪些决定。

你只有：
1. 原始需求（brief）：{brief.successCriteria}
2. 当前结果截图（通过 get_screenshot 获取）

你的任务：找出结果与需求之间的差距。
- 不要问"这是故意的吗"——只要不符合需求就标出来
- 用对抗性视角：你的工作是找问题，不是认可决策
- 按 CRITICAL / MAJOR / MINOR 分级输出

Layout checks:
{LAYOUT_RULES}

Color checks:
{COLOR_SPEC}
```

Critic 和 Builder 通过独立的 `agent()` 调用，**不传 Builder 的中间产物**（不传 componentRegistry、不传 layout 对象）。最多 3 轮，第 3 轮仍不通过则停止并输出 blockers 列表。

#### Phase 6 — DESIGN SPEC 输出（Mode A → B 桥接）

Review 通过后，自动输出 `design-spec.json`，供 Mode B 读取：

```json
{
  "task": "...",
  "components": {
    "KPICard":   "nodeId:xxx",
    "TableRow":  "nodeId:xxx"
  },
  "colorTokens": {
    "primary":   "--pac-theme-color",
    "title":     "--color-title--",
    "body":      "--color-text--",
    "muted":     "--color-info--",
    "border":    "--pac-filter-line-color"
  },
  "spacing": {
    "card-padding":  "--pac-s4--",
    "section-gap":   "--pac-s6--",
    "item-gap":      "--pac-s2--"
  },
  "figmaFileKey": "...",
  "figmaPageId":  "...",
  "generatedAt":  "YYYY-MM-DDTHH:mm:ssZ"
}
```

保存路径：`/tmp/design-spec.json`
Mode B 在 pre-flight 时读取此文件，以真实设计规格为基准构建 Demo。

#### 版本管理规范

每次进入 Phase 3（Layout Assembly）前，先在 Figma 当前页创建版本快照：
1. 新建 frame，命名格式 `V{n}-{YYYYMMDD}`（例：`V2-20260626`）
2. 将当前工作区内容复制进去，锁定该 frame（`frame.locked = true`）
3. 在原位置继续修改，**绝不覆盖快照 frame**

```
页面结构示例：
├── V1-20260620  ← locked，只读
├── V2-20260624  ← locked，只读
└── Working      ← 当前工作区
```

---

## Mode B — 快速 Demo

### 执行步骤

**Step 1: 读 design-spec.json（如果存在）**
```bash
cat /tmp/design-spec.json 2>/dev/null
```
若存在，以其中的组件名、颜色 token 为基准构建 Demo，不要重新发明。

**Step 2: 规划（5 分钟上限）**
- 状态机（如：upload → loading → results → empty）
- Mock 数据结构（贴近真实 API schema，不要随便捏造字段名）
- **子组件清单**（先列出原子组件，再写页面）

**Step 3: 先写子组件，再写页面**

规划阶段识别出的原子组件，先独立实现，再组合：
```
❌ 一个 600 行 SFC 写到底
✅ KeywordChip.vue  (~80行)
   HistoryCard.vue  (~60行)
   InspirePage.vue  (~200行，只引用以上组件)
```
单文件超过 300 行 = 拆分信号。

**Step 4: 强制包含 3 种状态**

每个 Demo 必须包含以下三种状态，**缺少任何一种 = 未完成**：

| 状态 | 描述 | 实现建议 |
|---|---|---|
| 🔄 Loading | 数据加载 / AI 分析中 | Spinner、骨架屏、步骤进度 |
| ✅ Data | 正常有数据的成功视图 | 核心功能展示 |
| 📭 Empty | 无数据 / 首次使用 / 清空后 | `<el-empty>` 或自定义空状态 |

**Step 5: Token 存在性校验**

写完 SFC 后执行，确认没有引用不存在的 CSS 变量：
```bash
# 1. 提取 SFC 里用到的所有 CSS 变量（替换 XxxDemo 为实际文件名）
grep -oE "var\(--[^)]+\)" src/views/XxxDemo.vue | sort -u > /tmp/used-tokens.txt

# 2. 提取 local-theme.scss 里已定义的变量
grep -oE "\-\-[a-zA-Z][a-zA-Z0-9_-]+" src/styles/local-theme.scss | sort -u > /tmp/defined-tokens.txt

# 3. 找出"用了但没定义"的变量
comm -23 /tmp/used-tokens.txt /tmp/defined-tokens.txt
# 输出为空 = 全部有效 ✅
# 有输出 = 替换为正确 token 名或改成硬编码值
```

**Step 6: 加路由并验证**
```js
// src/router/router.js
{ hide: true, path: '/xxx-demo', component: () => import('@/views/XxxDemo.vue') }
```
```bash
tail -3 /tmp/vite.log  # 确认 HMR 无报错
```

### Mode B 完成标准
- [ ] HMR 无报错
- [ ] Loading / Data / Empty 三种状态均可触发
- [ ] 无单文件超过 300 行
- [ ] Token 校验命令输出为空

---

## Mode C — Figma 快速线框

**目标：** 5 分钟内出信息架构草图，用于方案讨论，不关注视觉细节。

### 规则
- 只用灰色占位：`#f2f3f5` 背景、`#dedfe3` 线框、`#b2b2b8` 文字
- **不绑定** Figma variables
- **不需要** Critique Loop
- 推荐 auto-layout，不强制
- `await frame.screenshot()` = 交付物

### 执行步骤

1. **口头确认结构**：一句话描述信息架构（「顶部 header + 左侧图片 + 右侧关键词列表」），用户确认再画
2. **一次 `use_figma` 完成全部结构**：所有 frame 灰色填充，文字用占位内容
3. **截图返回**：不再精调

### Mode C 完成标准
- [ ] 截图已返回，用户可看到整体结构
- [ ] 层级和布局与口头描述一致

---

## Trigger Phrases

| 用户说 | 启动 |
|---|---|
| 设计 / 设计稿 / Figma / 规范 / 交付 | Mode A |
| demo / 跑起来 / 原型 / 演示 / 看看效果 | Mode B |
| 草图 / 线框 / 快速看结构 / 方案讨论 | Mode C |
| 帮我做一个... | 先问清楚再决定 |
