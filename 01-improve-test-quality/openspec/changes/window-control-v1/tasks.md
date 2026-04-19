# Tasks — window-control-v1

按 openspec/AGENTS.md 约定的 5 步：

1. [implement] 实现 `src/intent/window.js` 的 `recognizeWindowIntent`
2. [test-write] 写 `tests/intent/window.test.js`，含 happy/edge/error
3. [test-run] `npm test`，全过为止
4. [evaluator] 调用 test-evaluator subagent 补缺失用例
5. [mutation] `npm run test:mutation`，杀死率 ≥ 80%
