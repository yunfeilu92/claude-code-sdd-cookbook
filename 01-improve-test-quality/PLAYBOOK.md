# Chapter 01 — 演示话术（5–8 分钟）

给客户、同事、面试官、技术分享听众用的现场演示脚本。每步含：命令、预期输出、说什么。

## 演示前 Checklist

- [ ] `cd 01-improve-test-quality && npm install` 已完成
- [ ] `npm run demo:before && npm test` 跑通（确认环境 OK）
- [ ] 终端字号调大（投影别糊）
- [ ] 浏览器准备好开 `reports/mutation/mutation.html`

---

## Step 1（30 秒）— 设场景

**说**：

> 我们模拟一个真实的小米/极氪场景。PM 在 Slack 发一句话："智能助手要支持开关车窗，4 个窗位"。开发者用 Claude Code + OpenSpec 接需求，先 propose。

**展示**：

```bash
cat openspec/changes/window-control-v1/specs/window.md
```

**重点**：spec 里写了 SPEC-001/002/003 三类要求，包括边界异常情况。

---

## Step 2（1 分钟）— 展示客户现状的"美好假象"

**说**：

> AI apply 完了，写出实现 + happy path 测试。先看现状。

**命令**：

```bash
npm run demo:before     # 切到 apply-only 状态（3 测试）
cat src/intent/window.js
cat tests/intent/window.test.js
npm test
```

**预期看到**：

```
✓ tests/intent/window.test.js (3 tests) 2ms
File       | % Stmts | % Branch | % Funcs | % Lines
window.js  |   96.15 |    64.28 |     100 |   96.15
```

**说**：

> 3 个测试全过，**行覆盖率 96.15%**。如果就此提 PR，review 看到 96% 大概率 LGTM 合并。**这就是你们现在的状态——看起来很美**。

---

## Step 3（1 分钟）— ⭐ Stryker 揭穿假象

**命令**：

```bash
npm run test:mutation
```

**预期看到**：

```
File       | % Mutation | # killed | # survived |
window.js  |    64.06   |    41    |     20     |
```

**说**（这是 demo 的核心冲击点，慢慢讲）：

> 行覆盖率 96%，但 mutation score 只有 **64%**。
>
> Stryker 把代码里 64 个地方故意改坏，**只有 41 个被测试发现，剩下 20 个改坏了测试都不报错**。
>
> 这 20 个就是 QA 阶段会抓的 bug 来源。

**展示一个具体 survivor**：

```bash
cat reports/mutation/mutation.html  # 浏览器打开
```

> 比如这个：把"左后"窗的关键词数组改成空，测试居然全过——因为根本没人测过左后窗。

---

## Step 4（1 分钟）— 介绍三件套之 ①

**命令**：

```bash
cat openspec/AGENTS.md
```

**说**：

> 这是 markdown，**没有任何代码改动、没有任何阻拦工程师的 hook**。
>
> 但下次 Claude Code 看到 tasks.md 第 4、5 项必须做，apply 完会自动调 evaluator + 跑 mutation。
>
> 这就是第一件套：**改一段约定，不改基础设施**。

---

## Step 5（2 分钟）— 介绍三件套之 ②

**命令**：

```bash
cat .claude/agents/test-evaluator.md
```

**说三句话**：

1. **职责单一**：只补测试，禁止改实现
2. **独立 context**：和写实现的 Generator 是不同会话，**不被 Generator 的乐观感染**
3. **方法论硬规则**：列分支 → 列异常路径 → 列边界值 → 对照测试找缺口 → 补

---

## Step 6（1 分钟）— ⭐ 再跑 Stryker 验证

**命令**：

```bash
npm run demo:after      # 切到 evaluator-done 状态
npm test                # 21 tests, 100% line/branch
npm run test:mutation
```

**预期看到**：

```
File       | % Mutation | # killed | # survived |
window.js  |    92.19   |    59    |      5     |
```

**说**：

> Mutation score 从 **64% → 92%**，过 80% 阈值。
>
> 剩下的 5 个 survivor 全是**实现里的死代码**——Stryker 顺带告诉你代码可以简化。这是 bonus。
>
> 这就是测试质量的真正度量：不是行覆盖率，是 **mutation score**。

---

## Step 7（1 分钟）— 收尾话术

**说**：

> 整个流程**没有任何 PreToolUse 拦截、没有阻拦工程师写代码**。AI apply 完代码后自动进入「写测试 → 评审测试 → 验测试」的闭环，工程师该咋写咋写，机器在背后跑。
>
> 一周内能上：
>
> 1. `openspec/AGENTS.md` 加 4 行约定
> 2. `.claude/agents/test-evaluator.md` 一个文件
> 3. `npm i -D @stryker-mutator/core` + 一个 config
>
> 你们 OpenSpec apply 出来的 PR 自带高质量测试，QA 不用再追。

---

## FAQ（演示后客户最常问）

**Q：这是从我们代码里抓的真实数据吗？**
A：不是，是构造的小例子（illustration）+ 真工具产真数字。如果你们想要客户专属基准，下一步用你们一个 OpenSpec change 跑一遍。

**Q：Stryker 跑 5000 行代码的项目要多久？**
A：分钟级到小时级，看测试数。生产用法是放夜间 CI 或周清理 job，不放 PR pipeline。

**Q：mutation score 80% 是普适阈值吗？**
A：UI 强逻辑代码可以更低（60%），核心业务逻辑应更高（90%）。先看 baseline 再定阈值。

**Q：test-evaluator 在大文件上还有效吗？**
A：50 行内最稳。500 行以上要拆模块或拆 evaluator subagent（比如按文件 / 按函数群分多个 evaluator）。这是 cookbook 后续章节话题。

---

## 二级演示（如果时间够）

打开 [`reports/mutation/mutation.html`](./reports/mutation/mutation.html) 给客户看每个 survivor 的具体位置和原代码 → 让他们直观感受到"哪些 bug 测试没覆盖"。
