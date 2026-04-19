import { describe, it, expect } from 'vitest';
import { recognizeWindowIntent } from '../../src/intent/window.js';

describe('recognizeWindowIntent (apply 阶段 happy-path only)', () => {
  it('[SPEC-001] 打开左前窗 → open_window + lf', () => {
    expect(recognizeWindowIntent('打开左前窗')).toEqual({
      intent: 'open_window',
      slot: { window: 'lf' },
    });
  });

  it('[SPEC-001] 关闭右前窗 → close_window + rf', () => {
    expect(recognizeWindowIntent('关闭右前窗')).toEqual({
      intent: 'close_window',
      slot: { window: 'rf' },
    });
  });

  it('[SPEC-002] 主驾窗 → lf', () => {
    expect(recognizeWindowIntent('打开主驾窗')).toEqual({
      intent: 'open_window',
      slot: { window: 'lf' },
    });
  });
});
