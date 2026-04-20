const pptxgen = require('pptxgenjs');
const html2pptx = require('/Users/yunfeilu/.claude/plugins/cache/anthropic-agent-skills/document-skills/69c0b1a06741/skills/pptx/scripts/html2pptx.js');
const path = require('path');

const SLIDES_DIR = path.join(__dirname, 'slides');
const OUTPUT = path.join(__dirname, 'zeekr-sdd-workshop.pptx');

// 客户品牌占位 — 拿到真 logo 后替换为 slide.addImage({ path: ZEEKR_LOGO, ... })
function addClientBrand(slide, isCover) {
  if (isCover) {
    slide.addText("GEELY × ZEEKR", {
      x: 6.6, y: 0.4, w: 3.2, h: 0.5,
      fontSize: 22, color: "0EEDAF", bold: true, fontFace: "Arial",
      align: "right", valign: "middle"
    });
    slide.addText("智能助手团队", {
      x: 6.6, y: 0.9, w: 3.2, h: 0.3,
      fontSize: 11, color: "9CA3AF", fontFace: "Arial",
      align: "right", valign: "middle"
    });
  } else {
    slide.addText("GEELY × ZEEKR", {
      x: 7.6, y: 0.18, w: 2.1, h: 0.3,
      fontSize: 11, color: "0EEDAF", bold: true, fontFace: "Arial",
      align: "right", valign: "middle"
    });
  }
}

function addBranding(slide, pptx, isCover = false) {
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0, y: 5.52, w: 10, h: 0.03,
    fill: { color: "0EEDAF" }
  });
  slide.addText("Workshop · Yunfei Lu (AWS) × Zeekr · 2026-04", {
    x: 0.5, y: 5.32, w: 6, h: 0.2,
    fontSize: 6, color: "6B7280", fontFace: "Arial"
  });
  addClientBrand(slide, isCover);
}

const SLIDES = [
  {
    file: 'slide01-cover.html', isCover: true,
    notes: `欢迎来到 Workshop。今天大约 60-90 分钟，讲三件事：(1) 你们当前测试自动化的真实痛点；(2) 我们的解法三件套 + 5 分钟可跑 demo；(3) 框架视角与下一步两条落地路径。目标不是讲完整理论，是让你们带回去能立刻用的东西。`
  },
  {
    file: 'slide02-section1.html',
    notes: `先看痛点。这部分关键是让大家承认"我们的状态确实有问题"——这样后面才有动力听解法。如果客户说"我们没痛点"，就直接跳到 Section 3 讲框架。`
  },
  {
    file: 'slide03-pain.html',
    notes: `这是 demo 实测数字（非 mock）。重点：行覆盖率 96% 是漂亮的假象，mutation 64% 才是真实的测试有效率。右边的根因引自黄卓斌 AIDLC 讲稿 Q2——不是 AI 不会写测试，是"Agent 自评总是过于乐观"（Anthropic demystifying-evals 原话）。提问：你们现在 PR review 看不看 mutation score？`
  },
  {
    file: 'slide04-baseline.html',
    notes: `不论用什么方案，PLAN-0 是底座。重点强调右栏第 4 条 Trust-then-Verify Gap 标了 ★——今天讨论的所有内容都围绕这一条。其他 4 个失败模式作为 reading list 提一下即可。`
  },
  {
    file: 'slide05-section2.html',
    notes: `进入解法。开场强调一句："不是再造一套方法论，是 3 个文件级改动"——降低客户的预期投入感。`
  },
  {
    file: 'slide06-3kit.html',
    notes: `三件套是配合关系不是叠加。① 让 AI 写测试 / ② 让测试覆盖完整 / ③ 让测试不是水的。底部橙色总结条是关键："不阻拦工程师写代码 — 全是写完之后的反馈"。这是和别家方案最大的差异。`
  },
  {
    file: 'slide07-flow.html',
    notes: `这页让客户放心：开发者敲的命令和裸 OpenSpec 完全一样（左栏 3 条）。右栏的展开是 Claude Code 自动跑，工程师不用学新东西。常见疑问："Task 5 失败循环回 Task 4 会不会陷入死循环？"——答：tasks.md 里设循环上限（一般 2-3 轮），到上限报告 PR 让人看。`
  },
  {
    file: 'slide08-demo.html',
    notes: `★ 杀手页，停 3 分钟。重点对比左右两列"看似可合并 vs 真实可合并"。如果客户问"是真实数据还是 mock"，老实回答：这是构造的小例子用真工具跑出的真数字（illustration）。下一步可以拉你们真实 OpenSpec change 跑一遍出客户专属基准。配合 ~/sdd-demo/ 现场跑命令更震撼。`
  },
  {
    file: 'slide09-section3.html',
    notes: `进入框架视角。这部分相对短，定位是 reading list："如果想深挖，这两页给你方向"。客户没兴趣可以快速跳过。`
  },
  {
    file: 'slide10-v2.html',
    notes: `v2 框架是从 7 个产品反推的，不是我们拍脑袋。不要花时间讲完 9 件套，重点 Tier 1 第 ③ Observability——三件套就在这个位置。Tier 2 的 Cost / Rollback 是 cookbook 后续章节的路线图。Tier 3 的 Identity / Isolation 是车企合规场景必需，提一下让客户知道我们考虑过。`
  },
  {
    file: 'slide11-ecc.html',
    notes: `161K stars 在 3 个月内长出来 = 社会证明。重点说"它定位为 agent harness performance optimization system，自带 harness 这个词"。8 个技术手段是 cookbook 后续章节的素材库。给客户两条路：① 直接 fork ECC（省 200 小时）；② 跟我们 cookbook 渐进。`
  },
  {
    file: 'slide11b-architecture.html',
    notes: `这页配合上一页用——上页讲 ECC 是什么，这页直观看 ECC 长什么样。8 层都点一下，重点亮的 3 层（Hooks ★ / Capability ★ / 治理 ★）是企业落地最值钱的部分。客户看完这页大概率会理解："自建成本太高，fork 是合理选择"。`
  },
  {
    file: 'slide12-closing.html', isCover: true,
    notes: `不要纠结这次会议能定多少。最低承诺是 Week 1 三步——改 AGENTS.md / 装 subagent / 装 stryker，~30 行配置。问 3 个 follow-up 问题：(1) 你们现在哪个 OpenSpec change 适合做"客户专属基准"？(2) 谁是 tech lead 负责这次试点？(3) 下次会议时间？`
  },
];

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Yunfei Lu';
  pptx.title = 'Claude Code SDD Workshop — Zeekr';

  for (const s of SLIDES) {
    const { slide } = await html2pptx(path.join(SLIDES_DIR, s.file), pptx);
    addBranding(slide, pptx, s.isCover || false);
    if (s.notes) slide.addNotes(s.notes);
    console.log('Built:', s.file);
  }

  await pptx.writeFile({ fileName: OUTPUT });
  console.log('\nPresentation created:', OUTPUT);
  console.log('Slides:', SLIDES.length);
  console.log('Speaker notes:', SLIDES.filter(s => s.notes).length);
}

build().catch(err => { console.error(err); process.exit(1); });
