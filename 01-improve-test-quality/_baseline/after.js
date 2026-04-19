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

describe('test-evaluator 补充：四个窗位 × 开/关 全矩阵', () => {
  const cases = [
    ['打开左前窗', 'open_window', 'lf'],
    ['打开右前窗', 'open_window', 'rf'],
    ['打开左后窗', 'open_window', 'lr'],
    ['打开右后窗', 'open_window', 'rr'],
    ['关闭左前窗', 'close_window', 'lf'],
    ['关闭右前窗', 'close_window', 'rf'],
    ['关闭左后窗', 'close_window', 'lr'],
    ['关闭右后窗', 'close_window', 'rr'],
    ['打开副驾窗', 'open_window', 'rf'],
    ['关闭主驾窗', 'close_window', 'lf'],
  ];
  for (const [utt, intent, window] of cases) {
    it(`[SPEC-002] ${utt}`, () => {
      expect(recognizeWindowIntent(utt)).toEqual({ intent, slot: { window } });
    });
  }
});

describe('test-evaluator 补充：边界与异常 (SPEC-003)', () => {
  it('[SPEC-003] 空字符串 → null', () => {
    expect(recognizeWindowIntent('')).toBeNull();
  });

  it('[SPEC-003] undefined → null', () => {
    expect(recognizeWindowIntent(undefined)).toBeNull();
  });

  it('[SPEC-003] null → null', () => {
    expect(recognizeWindowIntent(null)).toBeNull();
  });

  it('[SPEC-003] 只说"打开"没说窗位 → null', () => {
    expect(recognizeWindowIntent('打开窗')).toBeNull();
  });

  it('[SPEC-003] 同时含开和关 → null（歧义）', () => {
    expect(recognizeWindowIntent('打开还是关闭左前窗')).toBeNull();
  });

  it('[SPEC-003] 不含"窗"关键词 → null', () => {
    expect(recognizeWindowIntent('打开左前')).toBeNull();
  });

  it('[SPEC-003] 不含开/关动词 → null', () => {
    expect(recognizeWindowIntent('左前窗')).toBeNull();
  });

  it('[SPEC-003] 完全无关句子 → null', () => {
    expect(recognizeWindowIntent('今天天气真好')).toBeNull();
  });
});
