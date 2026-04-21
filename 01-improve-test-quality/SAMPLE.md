# Real Sample — 修 dify #26285（工程现场记录）

这个文档不是演示脚本。是 2026-04-20 晚上一次 `/opsx:propose` + `/opsx:apply` 的完整流水账——修真实 GitHub issue [langgenius/dify#26285](https://github.com/langgenius/dify/issues/26285)，产出 3 份实现文件、4 份测试文件、54 个测试全绿的过程原貌。

主 session 的 Claude（Generator 角色）写完 **28 个测试**说"够了"；`test-evaluator` subagent 在独立 context 里审一遍，**又加 26 个测试**，发现 Generator 漏掉的 8 个维度。这就是本章想说的事。

## 1. 为什么选这个 case

- **不是构造的**：2025-09-26 真实 issue，1.8.1 用户报告 chatflow 无错误日志挂起，上游 PR #24656 / #21739 已修但未 backport。
- **根因典型**：SQLAlchemy `expire_on_commit=True` 默认值 + ORM 对象跨线程传递 + Flask 请求作用域 session。这是并发 Python 服务里最常见的一类陷阱。
- **代码表面小**：diff 只有 `3 files, 144+, 68-`，适合把注意力集中在**测试质量**而不是实现本身。

## 2. 输入（给 Claude 的 prompt）

```
/opsx:propose 帮我修复 https://github.com/langgenius/dify/issues/26285
```

没有补充说明。Claude 自己去 `gh issue view` 读 issue + 评论，自己决定 kebab-case 名字（`fix-chatflow-hanging-db-session`）。

## 3. 流程时间线

| 阶段 | 动作 | 产出 |
|---|---|---|
| **Propose** | `/opsx:propose` | `openspec/changes/fix-chatflow-hanging-db-session/` 下 4 份 artifact：proposal / design / spec / tasks |
| **Apply M1** | 读 3 个目标文件确认修复坐标 | Explore subagent 报告命中 `advanced_chat/app_runner.py:55-80`, `workflow/app_runner.py:49-72`, `advanced_chat/app_generator.py:433-559` |
| **Apply M2** | 写 reproduction test | `test_advanced_chat_hang_regression.py` 7 条 AST 断言，pre-fix 全 fail |
| **Apply M3** | 改两个 runner | `Session(db.engine, expire_on_commit=False)` 替换 `db.session.query(App/EndUser)`，外层加 `except SQLAlchemyError` 守卫 |
| **Apply M4** | 改 generator 边界 | `_handle_advanced_chat_response` 签名从 `conversation: Conversation, message: Message` 改成 `conversation_id: str, message_id: str`；re-fetch 放在作用域 session 里 |
| **Apply M5** | Generator 写 28 tests | `test_app_runner_session.py` + `test_app_generator_session.py` + `workflow/test_app_runner_session.py`。3 次 pytest 才全绿（前两次是 `db.engine` 评估时机问题 + SQLite 并发断言太强） |
| **Apply M6** | 调 `test-evaluator` subagent | **+26 tests**，8 个 probe 维度（见下一节） |
| **Apply M7** | `openspec validate` + 记账 | 4/4 artifacts complete，deferred 3 项（smoke / mutation / commit）标 `[user-verify]` |

最终：**54 passed in 0.37s**。

## 4. Generator vs Evaluator —— 关键对比

这是本章真正想让读者看到的东西。同一个人（Claude）在同一个任务里，主 session 和 subagent 产出的测试质量差**一半**。

### 4.1 Generator（主 session）写完后的测试清单

28 个测试，结构是"每个 code path 一个 happy / 一个 unhappy"：

**`test_app_runner_session.py`（8 个）**
- `test_run_delegates_to_internal_run`
- `test_run_catches_sqlalchemy_error_logs_and_reraises`
- `test_run_does_not_intercept_non_sqlalchemy_errors`
- `test_internal_run_uses_scoped_session_for_app_and_enduser`
- `test_internal_run_raises_when_app_not_found`
- `test_internal_run_raises_when_workflow_not_initialised`
- `test_internal_run_skips_enduser_lookup_for_debugger_invoke_from`
- `test_internal_run_does_not_use_global_db_session_for_app_query`

**`test_app_generator_session.py`（8 个）** —— 7 条行为 + 1 条 AST 存在性
**`workflow/test_app_runner_session.py`（5 个）** —— advanced_chat 的平行版
**`test_advanced_chat_hang_regression.py`（7 个）** —— 全 AST 文本扫描

**Generator 的盲点**（后来被 Evaluator 一条条点出来）：

- 只测了 `OperationalError` 一种 `SQLAlchemyError` 子类——**issue #26285 的真实症状 `DetachedInstanceError` 没被测**。
- 日志断言只写 `"some string" in rec.getMessage()`——**没断言 `levelname == "ERROR"` 也没断言 `exc_info` 附着**。如果有人把 `logger.exception` 错改成 `logger.info`，测试过。
- `_generate_worker` 的 `except SQLAlchemyError` 分支**只做了 AST 存在性检查**（`"except SQLAlchemyError" in source`），没做行为验证。如果有人把 `publish_error` 删掉，测试过。
- `expire_on_commit=False` 只断言了 **kwarg 值**，没验证**运行时效果**（真引擎下提交后属性可读）。
- 没跑过**真 Engine/真连接池**——全 MagicMock。连接归还、跨线程独立、嵌套 Session 全部空白。
- `_handle_advanced_chat_response` 的签名测试只检查了 `conversation_id` / `message_id` 存在，**没扫描所有参数的 annotation 文本**防止 Conversation/Message 从别的参数名偷渡回来。

### 4.2 Evaluator（test-evaluator subagent）补的 26 个测试

Evaluator 在独立 context 里跑，**read-only 于实现代码**，只能 Write/Edit 测试文件。它被明确要求审 8 个 probe 维度（probe 清单在我给它的 prompt 里；每个 probe 是"某类我担心 Generator 漏掉的风险"）。

| Probe | 维度 | 新增测试 | 关键断言 |
|---|---|---|---|
| 1 | 连接池归还 | `test_scoped_session_returns_connection_to_pool_on_exit` | 真 `QueuePool` 引擎，`with Session` 前后 `pool.checkedout()` 归零 |
| 2 | `expire_on_commit=False` 契约 | `test_expire_on_commit_false_keeps_attributes_readable_after_session_close` | 真 SQLite engine，session 关闭后属性依旧可读；对照组 `expire_on_commit=True` 应抛 `DetachedInstanceError` |
| 3 | 并发独立 Session | `test_concurrent_scoped_sessions_no_cross_contamination` | 两 threads + barrier + StaticPool，各自 Session 可见自己的 commit，无交叉污染 |
| 4 | re-entrant Session | `test_nested_scoped_sessions_commit_independently` | 嵌套 `with Session` 提交互不影响 |
| 5 | Flask app_context × scoped session | `test_handle_response_opens_scoped_session_inside_flask_app_context` | 在 `preserve_flask_contexts` 包裹内部调用 handler，engine 仍解析成功，无 context bleed |
| 6 | SQLAlchemyError 子类全覆盖 | `test_*_guards_all_sqlalchemy_error_variants` ×3 处 | **参数化** `OperationalError` / `IntegrityError` / `DetachedInstanceError` / `DBAPIError` 四变体，每个都要走到 guard 分支。**issue #26285 的症状子类在这里才第一次被测** |
| 7 | boundary annotation 白名单 | `test_handle_response_no_param_annotation_mentions_conversation_or_message_orm` + `test_handle_response_application_generate_entity_is_typed_entity_not_orm` | `inspect.signature` 扫所有参数，**没有任何参数的 annotation 文本包含 `Conversation` / `Message`**。防止未来有人换个参数名把 ORM 偷渡回来 |
| 8 | ERROR level + exc_info | `test_run_guard_emits_error_record_with_exc_info` + handler / workflow 平行版 | `rec.levelname == "ERROR"` **且** `rec.exc_info is not None` **且** `rec.exc_info[0] is OperationalError`。把"`logger.exception` 有没有真的带 traceback"钉死 |

**额外的行为补强**：

- `test_generate_worker_publishes_sqlalchemy_error_to_queue_and_closes_session` —— 把 Generator 原本只做 AST 检查的 `except SQLAlchemyError` 分支**补成真行为验证**：mock 抛异常 → 断言 `queue_manager.publish_error(e, PublishFrom.APPLICATION_MANAGER)` 被调 + `finally: db.session.close()` 被执行。

- `test_generate_worker_sqlalchemy_variants_all_publish_error` —— 参数化 3 变体，确认每种异常都能正确 publish。

## 5. 同一断言的前后对比（一个例子）

这是最能说明"Generator 乐观偏差"的一对。

**Generator 写的**（`test_app_runner_session.py:66`）：

```python
def test_run_catches_sqlalchemy_error_logs_and_reraises(caplog):
    runner = _make_runner(InvokeFrom.DEBUGGER)
    boom = OperationalError("stmt", params=None, orig=Exception("connection reset"))
    with patch.object(runner, "_run", side_effect=boom):
        with caplog.at_level("ERROR"):
            with pytest.raises(OperationalError):
                runner.run()
    assert any("SQLAlchemyError in AdvancedChatAppRunner" in rec.message for rec in caplog.records)
    messages = " ".join(rec.getMessage() for rec in caplog.records)
    assert "app-1" in messages
    assert "conv-1" in messages
    assert "msg-1" in messages
```

看起来够严——字符串、ID 都断言了。但 `rec.message` 里只要出现那串字就通过，`logger.warning` 也能过。

**Evaluator 加的**（`test_app_runner_session.py:236`）：

```python
def test_run_guard_emits_error_record_with_exc_info(caplog):
    runner = _make_runner(InvokeFrom.DEBUGGER)
    boom = OperationalError("stmt", params=None, orig=Exception("connection reset"))
    with patch.object(runner, "_run", side_effect=boom):
        with caplog.at_level("ERROR"):
            with pytest.raises(OperationalError):
                runner.run()
    matching = [rec for rec in caplog.records if "SQLAlchemyError in AdvancedChatAppRunner" in rec.getMessage()]
    assert matching
    rec = matching[0]
    assert rec.levelname == "ERROR"
    assert rec.exc_info is not None
    assert rec.exc_info[0] is OperationalError
```

把 `logger.exception(...)` 错写成 `logger.error(...)` 的回归就能被这一条挡住——`exc_info` 会是 `None`。

## 6. 数字

```
test count:    28  →  54     (+26, evaluator 贡献)
wall time:      <1s →  0.37s  (全 mock 居多)
files touched: 0   →  0       (实现代码 evaluator 没动，按契约)
```

改动表面（3 个实现文件）的覆盖率从 Generator 阶段已经接近 100%。**Evaluator 的价值不在拉高百分比**——在把已被覆盖的行换成**更严的断言**。这是 coverage 永远测不到的质量差。

## 7. Mutation 这一步没跑

诚实说：按 `~/.claude/rules/openspec-testing.md` 的硬规定应该跑 `mutmut` ≥ 80%。没跑的原因：

- `mutmut 3.5` 需要 `[tool.mutmut]` 在 `pyproject.toml` 或者 `setup.cfg`
- 我的全局 `config-protection.sh` hook 拦住了新建/修改这两个文件
- 需要我**显式授权**才能改 config

这是工程现实。不装漂亮，也不是 playbook 演示里"三件套跑完完美收工"的剧本。这条缺席在 `tasks.md` 里标了 `[deferred — user-decision]`，follow-up change 再补。

Evaluator 的 8 probe 覆盖已经系统性地击中每个 mutation-susceptible 分支（`except` 类型、`if not X`、`expire_on_commit` kwarg、`PublishFrom.APPLICATION_MANAGER` 常量、`db.session.close()`），人工审的结论是：就算跑了 mutmut，survivor 大概率集中在日志字符串细节（cosmetic，可忽略）。但这是推理，不是测出来的。

## 8. 自己跑一遍

前提：`uv` 装好，dify 仓库 clone 在本地，`api/.venv` 能解析 `sqlalchemy` + `flask`。

```bash
cd <dify>/api
uv sync --frozen
OPENDAL_SCHEME=fs OPENDAL_FS_ROOT=/tmp/dify-test-storage uv run pytest \
  tests/unit_tests/core/app/apps/advanced_chat/ \
  tests/unit_tests/core/app/apps/workflow/ \
  tests/integration_tests/workflow/test_advanced_chat_hang_regression.py \
  --tb=short -p no:cacheprovider --no-cov
```

预期：`54 passed in ~0.4s`。

## 9. 拿什么回你自己的项目

**两个文件 + 一行 tasks.md 约定**——不需要装 Stryker/mutmut，不需要改 CI。

1. **`~/.claude/rules/openspec-testing.md`**（全局）—— OpenSpec 5 步测试闭环。进入 `~/.claude/CLAUDE.md` 的 Rules 段引用。
2. **`.claude/agents/test-evaluator.md`**（per-project 或全局）—— subagent 定义：`tools: Read, Grep, Glob, Edit, Write, Bash`，提示词明确 **read-only on implementation**。
3. **`tasks.md` 里加一行**：
   ```markdown
   - [ ] 5.3 [evaluator] 调 test-evaluator subagent 审测试缺口（禁改实现）
   ```

下一次 `/opsx:apply` 走到这一行，Claude 会自动 `Agent(subagent_type="test-evaluator")`。独立 context 审一遍，补几条深度断言。

## 10. 这个 sample 不解决什么

- **不替代真 mutation**。Probe 列表是人工枚举的，漏哪个维度，evaluator 就查不出来。
- **不管 E2E / UI 测试**。纯后端 Python 单元 + 集成。
- **不是 python/flask/sqlalchemy 专用**，但不同语言的 probe 集不一样（Go: channel leak, goroutine scheduling；JS/TS: promise rejection, event loop starvation）。你需要自己维护一份 domain-specific probe 列表塞进 evaluator 的 prompt。
- **不自动发现 root cause**。Generator + Evaluator 能把你**已经知道要测什么**的东西测严，它们不替你找 #26285 那种"为什么挂"的初诊。

## 11. 相关文件（绝对路径，便于 diff）

实现（被 Generator 改，Evaluator 只读）：
- `<dify>/api/core/app/apps/advanced_chat/app_runner.py`
- `<dify>/api/core/app/apps/workflow/app_runner.py`
- `<dify>/api/core/app/apps/advanced_chat/app_generator.py`

测试（Generator 起稿，Evaluator 增补）：
- `<dify>/api/tests/unit_tests/core/app/apps/advanced_chat/test_app_runner_session.py` — 13 tests（含 4 参数化变体 → 16 实测）
- `<dify>/api/tests/unit_tests/core/app/apps/advanced_chat/test_app_generator_session.py` — 15 tests（含多组参数化 → 20 实测）
- `<dify>/api/tests/unit_tests/core/app/apps/workflow/test_app_runner_session.py` — 8 tests（含 4 参数化变体 → 11 实测）
- `<dify>/api/tests/integration_tests/workflow/test_advanced_chat_hang_regression.py` — 7 AST 断言
