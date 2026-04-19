# Baseline — Anthropic 官方四步 + 5 个常见失败模式

> 这是 cookbook 各章节的隐含前提。读完一遍即可。
> 来源：[Claude Code Best Practices](https://code.claude.com/docs/en/best-practices) + 社区实践提炼。

## PLAN-0：Anthropic 官方四步工作流

任何章节都不替换它，只在它之上叠加：

1. **Explore**（Plan Mode）— 读文件、提问，不改代码
2. **Plan**（Plan Mode）— Claude 写详细实现方案
3. **Implement**（Normal Mode）— 边写边验证
4. **Commit** — 描述性的 commit message

## 最高杠杆点

> *"Give Claude a way to verify its work."*

没有验证手段 = Claude 可能产出**看起来正确但实际不工作**的代码。这是所有失败模式的共同根源。

## 5 个常见失败模式

落地 Claude Code 时绝大多数问题都能归类到这 5 条。每个章节本质上都在解其中一个或多个：

### 1. Kitchen Sink Sessions（混杂会话）
同一 session 处理多个不相关任务 → context 被前一个任务污染 → 后续任务质量下降。
**解药**：任务切换用 `/clear`。

### 2. Repetitive Corrections（反复纠正）
同一个错误在同一 session 里纠正 2 次以上 → 大概率纠不回来。
**解药**：`/clear` 重开 + 重写 prompt（更明确）。

### 3. Bloated Specs / CLAUDE.md（规范膨胀）
`CLAUDE.md` 写成百科全书 → 关键约束被淹没 → AI 实际遵守率下降。
**解药**：≤40 行，只写 Claude 猜不到的；定期删减。

### 4. Trust-then-Verify Gap（信任不验证）
代码看起来对，没真跑测试 / 没看截图 → 上线才发现挂了。
**解药**：所有可量化产物（代码 / UI / 数据）必须有自动验证手段。

### 5. Infinite Exploration（无限探索）
Plan Mode 一直读、不进入 Implement → token 消耗大、产出零。
**解药**：缩小探索范围 / 用 subagent 隔离调查。

## 章节与失败模式的对应

| 章节 | 主要解决 |
|---|---|
| [01 测试效果提升](./01-improve-test-quality/) | #4 Trust-then-Verify Gap |
| 02 Context 膨胀（TBD） | #1, #3 |
| 03 Spec 漂移（TBD） | #3 |
| 04 Code Review 淹没（TBD） | #4 |
| 05 幻觉 API（TBD） | #4 |

## 引用与延展阅读

- Anthropic Engineering — Demystifying evals for AI agents
- OpenAI — Harness Engineering: Codex
- Mitchell Hashimoto — 人的反馈回归系统理念
