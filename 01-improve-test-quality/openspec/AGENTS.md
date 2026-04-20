# OpenSpec Agent Conventions — oem-intent-demo

## Tasks 模板约定（核心 SDD 治理）

每个 `changes/{name}/tasks.md` 必须包含以下任务，**顺序固定**：

1. `[implement]` — 写实现代码（src/）
2. `[test-write]` — 为每个新增公开函数写测试，含 happy / edge / error 三类用例
3. `[test-run]` — 跑全部测试；失败则修代码或修测试直到通过
4. `[evaluator]` — 调用 `test-evaluator` subagent 补充缺失用例
5. `[mutation]` — 跑 `npm run test:mutation`，杀死率 < 80% 继续补测试

## 行为约定

- 实现代码不写注释（well-named 即文档）
- 测试文件命名：`tests/{path}.test.ts`，与 `src/{path}.ts` 一一对应
- 每个测试 `it(...)` 描述里以 `[SPEC-XXX]` 前缀标注对应的 spec id
