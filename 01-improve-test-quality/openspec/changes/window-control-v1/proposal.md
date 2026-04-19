# 提案：window-control-v1

## Why
车主在车内说"打开左前窗" 等指令，需要识别为结构化 intent + slot，下游车控模块按此动作。

## What
新增 `recognizeWindowIntent(utterance)` 函数：
- 输入：中文 utterance
- 输出：`{ intent: 'open_window'|'close_window', slot: { window: 'lf'|'rf'|'lr'|'rr' } }` 或 `null`（无法识别）
