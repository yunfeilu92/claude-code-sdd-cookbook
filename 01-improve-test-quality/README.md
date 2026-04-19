# Chapter 01 — 测试效果提升

## 你的痛点（如果你点进来读这章）

> "我们用 Claude Code + OpenSpec 写代码没问题，但 **OpenSpec apply 完代码后，自动测试这块不理想**。看起来 happy path 都过了、行覆盖率 90%+，但 QA 阶段还是抓出一堆 bug。"

如果这句话说的就是你，继续往下。如果不是，回 [上级 README](../README.md) 找你的章节。

## 这章的解法（三件套）

| # | 工具 | 文件 | 它解决什么 |
|---|---|---|---|
| ① | **OpenSpec tasks 模板** | [openspec/AGENTS.md](./openspec/AGENTS.md) | 强制 AI apply 阶段把"写测试 + 跑测试 + 评审 + mutation"列入 tasks |
| ② | **test-evaluator subagent** | [.claude/agents/test-evaluator.md](./.claude/agents/test-evaluator.md) | 独立 context 评审测试，专补 edge / error 路径，不被 Generator 乐观感染 |
| ③ | **Stryker mutation testing** | [stryker.config.json](./stryker.config.json) | 揭穿"水测试"：行覆盖率高但分支没真验证 |

**它们不阻拦工程师写代码**——全是写完之后的反馈。零摩擦。

## 5 分钟自己跑一遍

```bash
cd 01-improve-test-quality
npm install

# Step 1: 模拟 apply 阶段（只有 happy path 测试）
npm run demo:before
npm test                    # 看到 96.15% 行覆盖率
npm run test:mutation       # 看到 64% mutation score → 揭穿

# Step 2: 模拟 evaluator subagent 补完
npm run demo:after
npm test                    # 100% 行覆盖率
npm run test:mutation       # 92% mutation score → 过 80% 阈值
```

## 你会看到的真实数字

| 阶段 | 测试数 | 行覆盖率 | 分支覆盖率 | **Mutation Score** | Survivors |
|---|---|---|---|---|---|
| `demo:before`（apply only） | 3 | 96.15% | 64.28% | **64.06%** | 20 个 ❌ |
| `demo:after`（evaluator done） | 21 | 100% | 100% | **92.19%** | 5 个（实现里的死代码）✅ |

剩下的 5 个 survivor 全是**实现冗余分支**——Stryker 顺手暴露代码可以简化。这是 bonus。

## 怎么用到你自己的项目

**周一改 ①**：把 [openspec/AGENTS.md](./openspec/AGENTS.md) 的 5 步 tasks 约定 copy 到你项目的 `openspec/AGENTS.md`。立刻见效，下次 OpenSpec apply 自动写测试。

**周二改 ②**：把 [.claude/agents/test-evaluator.md](./.claude/agents/test-evaluator.md) 整个 copy 到你项目的 `.claude/agents/`。改两行业务术语即可。

**周三改 ③**：

```bash
npm i -D @stryker-mutator/core @stryker-mutator/vitest-runner
cp ../01-improve-test-quality/stryker.config.json .
npx stryker run
```

**周四看数字**：你项目 baseline mutation score 大概率比 64% 还低。开始让 evaluator 跑。

## 演示给客户 / 同事看

完整 7 步演示话术：[PLAYBOOK.md](./PLAYBOOK.md)

## 它不解决什么

- E2E 测试 / UI 测试质量 — 那是另一个章节
- 契约测试 / 跨服务集成 — 那是另一个章节
- AI 写的代码本身的质量 — 这章只管"测试是不是真在测"

## 进一步原理

- 为什么 Generator-Evaluator 必须分开：参考 Anthropic Best of N 评审模式
- 为什么 mutation 比 coverage 准：mutation 测的是"测试能不能发现 bug"，coverage 只测"代码被执行了"
- 完整理论框架：Harness Engineering 五件套之 Feedback Loops + Testing Harness
