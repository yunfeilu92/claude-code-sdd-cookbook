# Claude Code SDD Cookbook

> 不是又一套完整方法论。是开发者用 Claude Code（可选 + OpenSpec / SDD）时**真实遇到的痛点**，配上**5 分钟可跑通的解法**。

## 为什么是 Cookbook 而不是 Framework

完整方法论（AIDLC / BMAD / Spec Kit / 各家 SDD 框架）的问题是**对单个开发者负担太大**——要学概念、改流程、装一堆工具、说服整个团队。结果是：方案漂亮，落地零。

Cookbook 模式的承诺：

- **每章一个 folder**：一个具体痛点 + 一个可独立采用的解法
- **5 分钟跑通**：`npm install` 后立刻看到真实数字
- **真工具真数据**：所有 demo 用真实工具产真实输出，不画饼
- **零摩擦默认**：不强制 hook、不卡阀、不改你的开发流程；只做"写完之后的反馈"

## 适用人群

- 已经用 Claude Code 做开发，但**测试 / 质量 / 一致性 / context 管理**有具体痛点
- 在大团队里要给同事推 AI 工程实践，需要**可演示而非可宣讲**的弹药
- 给客户 / 内部做技术分享，需要**Claude Code + SDD**的真实落地素材

## 基础线（可选阅读）

读完一遍即可，不读也不影响章节使用：[baseline.md](./baseline.md) — Anthropic 官方四步工作流（PLAN-0）+ 5 个常见失败模式。

## 章节

| # | 痛点 | 解法 | 状态 |
|---|---|---|---|
| **01** | [写完代码后自动测试不到位，行覆盖率虚高 QA 还是抓 bug](./01-improve-test-quality/) | OpenSpec tasks 模板 + test-evaluator subagent + Stryker mutation | ✅ |
| 02 | Context 膨胀，多 session 后效果下降 | TBD | 🚧 |
| 03 | Spec 漂移，代码和 OpenSpec 不一致 | TBD | 🚧 |
| 04 | Code review 被 AI PR 量淹没 | TBD | 🚧 |
| 05 | AI 生成的 API 调用不存在 | TBD | 🚧 |

## 贡献新章节

提案模板：

1. **痛点**：开发者在 Claude Code 工作流中真实卡住的地方（一句话）
2. **解法**：≤3 件可独立采用的工具/约定（不要堆方法论）
3. **Demo**：5 分钟内可跑通，输出可量化的对比数字
4. **零摩擦**：不阻拦工程师写代码，只做事后反馈

## 哲学

> "约束反而是加速器" —— OpenAI Codex 团队
>
> 但**前置约束是减速器**。所有 cookbook 章节都遵循：**反馈 > 阻拦，可见 > 强制**。

## License

MIT
