const WINDOW_MAP = [
  { keys: ['左前', '主驾'], slot: 'lf' },
  { keys: ['右前', '副驾'], slot: 'rf' },
  { keys: ['左后'], slot: 'lr' },
  { keys: ['右后'], slot: 'rr' },
];

export function recognizeWindowIntent(utterance) {
  if (!utterance) return null;

  const hasOpen = utterance.includes('打开') || utterance.includes('开');
  const hasClose = utterance.includes('关闭') || utterance.includes('关');

  let intent = null;
  if (hasOpen && !hasClose) intent = 'open_window';
  else if (hasClose && !hasOpen) intent = 'close_window';
  else if (hasOpen && hasClose) return null;

  if (!intent) return null;
  if (!utterance.includes('窗')) return null;

  let slot = null;
  for (const w of WINDOW_MAP) {
    if (w.keys.some(k => utterance.includes(k))) {
      slot = w.slot;
      break;
    }
  }
  if (!slot) return null;

  return { intent, slot: { window: slot } };
}
