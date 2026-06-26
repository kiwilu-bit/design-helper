---
name: ui-design-workflow
description: >
  Four-mode UI workflow with universal context handoff via design-spec.json.
  Modes A/B/C/D can chain in any order — each reads the spec at start and writes to it on completion.
  Always run Pre-flight Check first, then pick a mode.
---

# UI Design Workflow

---

## 模式串联 — 任意顺序，上下文自动传递

四种模式**可以任意顺序串联**，不限定方向。常见链路举例：

| 链路 | 场景 |
|---|---|
| B → D → A | 快速验证 → 规范化 → Figma 交付 |
| C → A | 线框确认结构 → 高保真实现 |
| A → B | Figma 设计 → 快速跑通原型 |
| D → A | shadcn 规范前端 → 提炼 Figma 设计稿 |
| A → D | Figma 设计稿 → shadcn 还原 |

**衔接机制：** 统一用 `/tmp/design-spec.json` 传递上下文。每个模式**开始时读取**、**完成时写入**。

```json
{
  "task": "功能描述",
  "lastMode": "B",
  "updatedAt": "...",
  "states": ["upload", "analyzing", "results"],
  "colorTokens": {
    "primary": "#FF9F43",
    "foreground": "#45464F",
    "border": "#DEDFE3"
  },
  "spacingTokens": { "card": "16px", "section": "24px" },
  "components": {
    "UploadZone": "src/views/XxxDemo.vue",
    "KwChip": "src/components/ui/badge.vue"
  },
  "screenshots": ["/tmp/design-screenshots/upload.png"],
  "figma": { "fileKey": "...", "pageId": "...", "nodeIds": {} },
  "modeD": { "projectPath": "...", "devUrl": "http://localhost:5174" }
}
```

**读取规则：**
```bash
cat /tmp/design-spec.json 2>/dev/null
```
有内容 → 以其中的 `task`、`colorTokens`、`spacingTokens`、`components` 为基准继续工作，不要重新发明。
没有文件 → 从零开始，完成后创建。

**写入规则：** 每次完成后**追加/覆盖**对应字段，不删除其他模式写入的字段。

---

## PRE-FLIGHT CHECK (run before EVERY session)

**通用（所有模式）：**
- [ ] **读取 design-spec.json** → `cat /tmp/design-spec.json 2>/dev/null`。有内容则告知用户"发现上次 [Mode X] 的上下文"，询问是否基于此继续。

### Mode A 额外检查
- [ ] **Can I access the Figma file?** → Call `get_metadata` on the fileKey.
- [ ] **Is there a state file?** → Check `/tmp/ui-design-state.json`. If `completedPhases` is non-empty, resume.

### Mode B 额外检查
- [ ] **Is the dev server running?** → `lsof -i :5173 | grep LISTEN`. If not: `npx vite --port 5173 > /tmp/vite.log 2>&1 &`
- [ ] **Does a similar component already exist?** → `ls src/views/ | grep -i <keyword>`.

### Mode D 额外检查
- [ ] **Is there a Mode B reference?** → design-spec.json 的 `components` 字段是否有 Vue 文件路径，有则作为 UX 参考。
- [ ] **独立项目是否已存在?** → 检查目标目录，避免重复初始化。

---

## STEP 0: PICK A MODE

| | **Mode A — 精细化 Figma** | **Mode B — 快速 Demo** | **Mode C — 快速线框** | **Mode D — shadcn 可交付** |
|---|---|---|---|---|
| 交付物 | Figma 节点，可交付 | 浏览器可运行 Vue 页面 | Figma 草图，仅结构 | 独立 shadcn-vue 项目，双主题切换 |
| 工具 | `use_figma` Plugin API | Vue 3 SFC + 路由（嵌入 Pacvue 工程） | `use_figma`（简化） | 独立 Vite + Vue 3 + Tailwind + shadcn-vue |
| 颜色/间距 | 必须用 Pacvue token | 尽量用 token，不强制 | 不要求，灰色占位 | CSS 变量系统，支持 Default / Pacvue 双主题 |
| 组件 | Figma component | Element Plus / Pacvue | 无 | shadcn-vue（Button/Card/Badge/Skeleton/Sheet） |
| 图标 | — | 自写 SVG 或 IconPark | — | IconPark `outline` size=18 stroke-width=3 |
| 验收 | Blind Critique Loop（≤3轮）| HMR 无报错 + 3 种状态 | 截图对齐信息架构即可 | HMR 无报错 + 双主题切换正常 + Design Score ≥ 70 |
| 速度 | 慢（精细） | 中（30 分钟内跑通） | 快（5 分钟出草图） | 中（1 小时内，含主题系统搭建） |

**决策树：**
- 用户说「Figma / 设计稿 / 符合规范 / 交付」→ **Mode A**
- 用户说「demo / 跑起来 / 原型 / 演示」→ **Mode B**
- 用户说「草图 / 线框 / 快速看结构 / 方案讨论」→ **Mode C**
- 用户说「shadcn / 独立项目 / 双主题 / 可切换主题 / 规范可交付的前端」→ **Mode D**
- 不确定 → 问：「需要 Figma 设计稿、可运行 Demo、快速草图，还是带主题系统的 shadcn 独立项目？」

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

#### Phase 5 — DESIGN SCORE + BLIND CRITIQUE

> **核心原则：** Critic 完全盲评 — 只收到原始 brief + 截图，不知道 Builder 的任何实现决策。
> **质量门槛：** ≥ 80/100 才可交付。< 80 → 按 fixList 修复后重评。最多 3 轮。

##### 评分体系（融合 StyleSeed + Pacvue 专属规则）

评分从满分开始，按违规扣分，总计 100 分：

| 维度 | 满分 | 通用扣分项 |
|---|---|---|
| **Coherence 连贯性** | 20 | 混用圆角 −6，多色强调 −5，emoji 当图标 −6，混用图标家族 −3，控件高度不统一 −3 |
| **Color 色彩纪律** | 16 | 纯黑 `#000` 文字 −4（上限 −8），硬编码 hex 替代 token −2 each，普通状态用了状态色 −4，装饰用色 −3，无文字只靠颜色表达状态 −4 |
| **Typography 层次** | 16 | 数字与单位非 2:1 比例 −4，无明显主次层级 −5，字号任意无比例 −4，行高不合理 −3 |
| **Layout & Spacing 布局** | 12 | 内容直接放在页面背景而不用卡片 −6，非 8px 网格间距 −3，相同 section 类型连续重复 −4 |
| **States 状态完整性** | 12 | 缺少 empty / loading / error 任何一种 −5 each（上限 −10），empty state 无下一步动作 −4 |
| **UX Writing 文案** | 12 | 按钮文字模糊（"确认" 而非 "发送 ¥2,400"）−4，错误提示责怪用户 −4，同义词混用 / 废话 −2 |
| **Motion & Polish 精细度** | 12 | 随意 fade 无统一节奏 −3，动效阻塞操作 −4，无 prefers-reduced-motion −3，单层纯黑阴影 −2 |

**Pacvue 专属扣分（叠加到对应维度）：**
- Coherence：同一页面混用橙色 + 蓝色主色 −8
- Color：使用 `#ff9f43` 硬编码而非 `var(--pac-theme-color)` −3 each
- Layout：`createFrame()` + 绝对定位替代 auto-layout −8（关键错误）
- Color：Tag opacity 加在 frame 上而非 fill color −5
- Color：Pagination active 用橙色填充背景而非仅 border −5

##### 评分区间

| 分数 | 等级 | 结论 |
|---|---|---|
| 90–100 | A | 可交付，精致 |
| 80–89 | B | 可交付，有小问题 |
| 70–79 | C | 不可交付，修完再评 |
| 60–69 | D | 较多问题 |
| < 60 | F | 返工 |

##### 输出格式

```
## Design Score: 76 / 100  (C)

Coherence            15/20   sharp cards + pill buttons; orange+blue 混用 (Pacvue −8)
Color discipline     11/16   hardcoded #ff9f43 ×3 (l.42,67,89); tag opacity on frame (l.55)
Hierarchy & type     15/16   hero 数字/单位 1:1（应 2:1）
Layout & spacing     10/12   两个相同 KPI section 连续排列
States                9/12   缺少 empty state
UX writing           10/12   "确认" 按钮 (l.120)
Motion & polish      10/12   单层 box-shadow: 0 4px 6px #000

### Fix first（按得分增益排序）
1. 统一圆角 + 去掉蓝色主色（改 #ff9f43）          → +10 Coherence/Color
2. hardcoded hex 替换为 var(--pac-theme-color)    → +6  Color
3. 补充 empty state + 空状态 CTA                  → +5  States
4. "确认" → "发送申请"                            → +4  Writing

Re-score after fixes: ~88/100  (B)
```

Critic 和 Builder **不共享上下文**，独立 `agent()` 调用。第 3 轮仍 < 80 → 停止，输出 blockers。

#### Phase 6 — DESIGN SPEC 写入（供任意下游模式读取）

Review 通过后，写入/更新 `/tmp/design-spec.json`。追加字段，不删除已有字段：

```json
{
  "task": "...",
  "lastMode": "A",
  "updatedAt": "YYYY-MM-DDTHH:mm:ssZ",
  "states": ["inferred from brief"],
  "colorTokens": {
    "primary":   "#FF9F43",
    "foreground":"#45464F",
    "body":      "#66666C",
    "muted":     "#B2B2B8",
    "border":    "#DEDFE3"
  },
  "spacingTokens": {
    "card-padding": "16px",
    "section-gap":  "24px"
  },
  "components": {
    "KPICard":  "nodeId:xxx",
    "TableRow": "nodeId:xxx"
  },
  "screenshots": ["/tmp/design-screenshots/result.png"],
  "figma": {
    "fileKey": "...",
    "pageId":  "...",
    "nodeIds": {}
  }
}
```

下游 Mode B / D 读取此文件，以真实 token 和组件名为基准构建，无需重新推断。

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

**Step 7: 写入 design-spec.json（供下游模式读取）**
```bash
# 追加/创建，保留已有字段
node -e "
const fs = require('fs');
const path = '/tmp/design-spec.json';
const prev = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
const next = {
  ...prev,
  lastMode: 'B',
  updatedAt: new Date().toISOString(),
  task: prev.task || '<fill in>',
  states: ['<list states>'],
  components: { ...prev.components, '<ComponentName>': 'src/views/XxxDemo.vue' },
  colorTokens: prev.colorTokens || {},
};
fs.writeFileSync(path, JSON.stringify(next, null, 2));
console.log('spec updated');
"
```

### Mode B 完成标准
- [ ] HMR 无报错
- [ ] Loading / Data / Empty 三种状态均可触发
- [ ] 无单文件超过 300 行
- [ ] Token 校验命令输出为空
- [ ] design-spec.json 已更新（`lastMode: "B"`）
- [ ] 快速 Design Score 自查 ≥ 70（Mode B 门槛低于 Mode A）：
  - 无 emoji 作为功能图标
  - 圆角/颜色主色统一（不混用）
  - 按钮文字描述具体动作（非"确认"/"提交"）
  - 至少一个 empty state 有下一步引导

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
- [ ] 写入 design-spec.json：`lastMode: "C"`，`screenshots` 字段记录截图路径，`states` 字段记录识别出的页面区块

---

---

## Mode D — shadcn-vue 独立项目（双主题切换）

**目标：** 搭建一个独立的、带 Pacvue 设计系统的 shadcn-vue 前端项目，支持 Default / Pacvue 双主题实时切换，适合高质量原型或可交付的前端 demo。

### Pre-flight
- [ ] 确认是新建项目（不嵌入 Pacvue Element Plus 工程，避免 Tailwind `important` 冲突）
- [ ] 确认目标路径：`/Users/.../Desktop/element/<project-name>/`

---

### Step 1 — 初始化项目

```bash
pnpm create vite <project-name> --template vue
cd <project-name>
pnpm install

# Tailwind CSS v3（注意：用 v3，不用 v4，shadcn-vue 暂不支持 v4）
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

# shadcn-vue 依赖（不用 CLI，手动引入）
pnpm add reka-ui class-variance-authority clsx tailwind-merge

# IconPark 图标库
pnpm add @icon-park/vue-next
```

### Step 2 — 配置 Tailwind

`tailwind.config.js`：
```js
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts}'],
  theme: {
    extend: {
      colors: {
        border:      'hsl(var(--border))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary:     { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary:   { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted:       { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent:      { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        card:        { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: {
        lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        '1': 'var(--spacing-1)', '2': 'var(--spacing-2)', '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)', '5': 'var(--spacing-5)', '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)', '10': 'var(--spacing-10)', '12': 'var(--spacing-12)',
      },
    },
  },
}
```

`vite.config.js`：添加 `@` alias：
```js
import { fileURLToPath, URL } from 'node:url'
resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } }
```

### Step 3 — CSS Token 系统

`src/style.css`：
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* 间距 token（两个主题共用） */
  :root {
    --spacing-1: 4px;  --spacing-2: 8px;   --spacing-3: 12px;
    --spacing-4: 16px; --spacing-5: 20px;  --spacing-6: 24px;
    --spacing-8: 32px; --spacing-10: 40px; --spacing-12: 48px;
  }

  /* Default 主题（shadcn Zinc） */
  :root {
    --background: 0 0% 100%; --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%; --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%; --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%; --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%; --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%; --input: 240 5.9% 90%; --ring: 240 5.9% 10%;
    --card: 0 0% 100%; --card-foreground: 240 10% 3.9%;
    --radius: 0.5rem;
  }

  /* custom-pacvue 主题（来源：ENT Design System New node 2666:31076） */
  .theme-custom-pacvue {
    --background: 0 0% 100%; --foreground: 237 7% 29%;      /* #45464F */
    --card: 0 0% 100%; --card-foreground: 237 7% 29%;
    --primary: 31 100% 63%; --primary-foreground: 0 0% 100%; /* #FF9F43 */
    --secondary: 210 5% 96%; --secondary-foreground: 237 7% 29%;
    --muted: 0 0% 97%; --muted-foreground: 240 3% 41%;       /* #66666C */
    --accent: 31 100% 95%; --accent-foreground: 31 100% 57%; /* #FFF1E3 */
    --destructive: 0 77% 62%; --destructive-foreground: 0 0% 100%; /* #EA5455 */
    --border: 228 9% 88%; --input: 228 9% 88%;               /* #DEDFE3 */
    --ring: 31 100% 63%; --radius: 6px;

    /* Pacvue 扩展 token */
    --pac-success:    148 66% 47%;   /* #28C76F */
    --pac-link:       214 98% 52%;   /* #0D6EFD */
    --pac-text-title: 237 7% 29%;    /* #45464F */
    --pac-text-body:  240 3% 41%;    /* #66666C */
    --pac-text-muted: 240 2% 71%;    /* #B2B2B8 */
    --pac-divider:    228 14% 94%;   /* #EDEEF1 */
    --pac-fill-selected-orange: 31 100% 95%;  /* #FFF1E3 */
    --pac-fill-hover-orange:    31 100% 98%;  /* #FFFAF6 */
    --pac-blue-primary: 214 97% 36%; /* #0253B6 */

    /* Pacvue 间距规范 → 覆盖 --spacing-* */
    --pac-s1--: 4px; --pac-s2--: 8px;  --pac-s3--: 12px;
    --pac-s4--: 16px; --pac-s5--: 20px; --pac-s6--: 24px;
    --pac-s8--: 32px; --pac-s10--: 40px;
    --spacing-1: var(--pac-s1--); --spacing-2: var(--pac-s2--);
    --spacing-3: var(--pac-s3--); --spacing-4: var(--pac-s4--);
    --spacing-5: var(--pac-s5--); --spacing-6: var(--pac-s6--);
    --spacing-8: var(--pac-s8--); --spacing-10: var(--pac-s10--);
  }

  * { border-color: hsl(var(--border)); box-sizing: border-box; }
  body { margin: 0; background-color: hsl(var(--background)); color: hsl(var(--foreground)); }
}
```

### Step 4 — 基础 UI 组件

在 `src/components/ui/` 下创建（使用 `class-variance-authority` + Tailwind）：
- `button.vue` — variant: default / outline / secondary / ghost / destructive / link；size: default / sm / lg / icon
- `card.vue` — `rounded-lg border bg-card shadow-sm`
- `badge.vue` — variant: default / secondary / destructive / outline
- `skeleton.vue` — `animate-pulse rounded-md bg-muted`
- `separator.vue` — horizontal / vertical
- `sheet.vue` — 右侧滑出抽屉，使用 Vue `Teleport` + CSS Transition

`src/lib/utils.js`：
```js
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs) { return twMerge(clsx(inputs)) }
```

### Step 5 — 主题切换器

在根组件绑定主题 class：
```vue
<div class="min-h-screen bg-background text-foreground" :class="activeTheme">
  <!-- 切换条 -->
  <div class="flex items-center gap-1 rounded-lg border bg-muted p-1">
    <button v-for="t in themes" :key="t.id"
      :class="activeTheme === t.id ? 'bg-background shadow-sm' : 'text-muted-foreground'"
      @click="activeTheme = t.id">
      {{ t.label }}
    </button>
  </div>
</div>
```

```js
const themes = [
  { id: '',                    label: 'Default' },
  { id: 'theme-custom-pacvue', label: 'Pacvue'  },
]
const activeTheme = ref('')
```

### Step 6 — 图标规范

使用 `@icon-park/vue-next`，统一参数：
```vue
<UploadOne theme="outline" size="18" :stroke-width="3" :fill="fillMuted" />
```

填充色变量（随主题切换）：
```js
const fillFg      = 'hsl(var(--foreground))'
const fillMuted   = 'hsl(var(--muted-foreground))'
const fillPrimary = 'hsl(var(--primary))'
const fillSuccess = 'hsl(var(--pac-success, 148 66% 47%))'
```

### Design Rules（Mode D 专属）

- **最小字号 11px**（`text-[11px]`），不得更小
- **间距必须走 token**：`gap-*`、`px-*`、`py-*` 全部使用 Tailwind spacing class，不写裸 px 值
- **不写 `style=""` 内联颜色**：所有颜色通过 `hsl(var(--token))` 或 Tailwind 颜色 class
- **shadcn 组件优先**：有现成组件的场景不写裸 HTML 元素
- **Pacvue 主题下**颜色、间距全部走 `--pac-*` token，切换主题时自动跟随

### Mode D 完成标准

- [ ] `pnpm dev` 启动无报错
- [ ] Default / Pacvue 主题均可切换，视觉差异明显
- [ ] 所有颜色使用 CSS token（无硬编码 hex）
- [ ] 所有间距使用 Tailwind spacing class（无裸 px 值）
- [ ] 图标统一：`@icon-park/vue-next` outline size=18 stroke-width=3
- [ ] 最小字号 ≥ 11px
- [ ] 3 种状态（loading / data / empty）均可触发
- [ ] design-spec.json 已更新：`lastMode: "D"`，`modeD.projectPath`、`modeD.devUrl`、`colorTokens`、`spacingTokens` 字段已填写

**Mode D 写入 spec 示例：**
```bash
node -e "
const fs = require('fs');
const path = '/tmp/design-spec.json';
const prev = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path)) : {};
const next = {
  ...prev,
  lastMode: 'D',
  updatedAt: new Date().toISOString(),
  colorTokens: {
    primary: '#FF9F43', foreground: '#45464F',
    body: '#66666C', border: '#DEDFE3', error: '#EA5455'
  },
  spacingTokens: { s1:'4px', s2:'8px', s3:'12px', s4:'16px', s6:'24px', s8:'32px' },
  modeD: {
    projectPath: '<absolute path>',
    devUrl: 'http://localhost:5174',
    themes: ['', 'theme-custom-pacvue']
  }
};
fs.writeFileSync(path, JSON.stringify(next, null, 2));
console.log('spec updated');
"
```

---

## Trigger Phrases

| 用户说 | 启动 |
|---|---|
| 设计 / 设计稿 / Figma / 规范 / 交付 | Mode A |
| demo / 跑起来 / 原型 / 演示 / 看看效果 | Mode B |
| 草图 / 线框 / 快速看结构 / 方案讨论 | Mode C |
| shadcn / 独立项目 / 双主题 / 可切换主题 | Mode D |
| 帮我做一个... | 先问清楚再决定 |
