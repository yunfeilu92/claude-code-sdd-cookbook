# Window Intent Specs

## SPEC-001 识别开/关动作
- WHEN utterance 含"打开"/"开" THEN intent = open_window
- WHEN utterance 含"关闭"/"关" THEN intent = close_window

## SPEC-002 识别 4 个窗位
- 左前 = lf（关键词：左前 / 主驾）
- 右前 = rf（关键词：右前 / 副驾）
- 左后 = lr（关键词：左后）
- 右后 = rr（关键词：右后）

## SPEC-003 边界与异常
- 空字符串 → null
- 只说"打开"没说窗位 → null
- 同时含开和关 → null（歧义）
- 不含车窗关键词 → null
