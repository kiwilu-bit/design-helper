---
name: pacvue-user-persona
description: Pacvue 产品的目标用户画像和 UI 设计偏好，用于 Step 2 优先级推理
metadata: 
  node_type: memory
  type: project
  originSessionId: 276213df-909f-4cb6-bf09-53f34f7bd118
---

Pacvue 产品的核心用户是**广告投放运营人员**（Ad Operations / Campaign Managers）。

**用户关注点优先级（高→低）：**
1. **核心指标 / KPI**：花费（Spend）、ROAS、ACoS、销售额（Revenue）、展示量（Impressions）、点击量（Clicks）、CTR、CVR
2. **状态信息**：Campaign/Ad Group 的投放状态（Active / Paused / Ended）、审核状态
3. **标识信息**：名称、ID、所属 Profile/Account
4. **操作动作**：批量操作、快速编辑出价、预算调整
5. **辅助信息**：创建时间、更新时间、标签、备注

**Why:** 用户每天盯着数据做决策，时间成本高，核心诉求是"一眼看到最重要的数字"，不需要在界面上找信息。

**UI 偏好推理：**
- 数据列优先展示在表格左侧可见区域
- 状态用 tag/badge 快速识别，不用文字堆砌
- 名称/ID 作为标识锚点，但优先级低于指标
- 操作按钮收在行尾或批量操作栏，不占主视觉区
- 数字要大/对比度高，辅助文字要弱

**How to apply:** 在 Step 2 优先级排序时，按此顺序推理字段优先级，先呈给用户 review，再进入下一步。
