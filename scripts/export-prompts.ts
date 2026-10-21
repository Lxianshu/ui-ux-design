import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { buildPrompt, cases, platforms } from '../src/cases/index.ts';

/** 从案例同一内容源导出五端默认提示词，避免手工副本与演示失配。 */
async function exportPrompts() {
  const lines = [
    '微妙 · 加载体验提示词合集',
    '==========================',
    '',
    '核心原则：提前占位、持续反馈、即时响应、分阶段呈现。',
    'UI：Logo 启动过渡、顶部进度条、骨架扫光、图片模糊到清晰。',
    'UX：照片上传、乐观消息、叫车等待、分页预加载、AI 流式回复。',
    '标签：UI / UX、平台、交互效果与视觉风格可组合。',
    '每个案例包含一句话提示词、设计原则和五种独立可复制的完整提示词。',
    '这是根据用户提供的九个场景整理的新提示词，不是原作者群内提示词。',
    '浏览器演示使用本地模拟；小程序和 App 需按对应提示词另行实现原生组件。',
    '',
  ];
  for (const [index, item] of cases.entries()) {
    lines.push(
      `${String(index + 1).padStart(2, '0')}. [${item.category.toUpperCase()}] ${item.title}`,
      '-'.repeat(48),
      `归纳：${item.summary}`,
      `原则：${item.principle}`,
      `一句话提示词：${item.oneLiner}`,
      '',
    );
    for (const platform of platforms) {
      lines.push(
        `【${platform.group} / ${platform.label} · 完整提示词开始】`,
        '',
        buildPrompt(item, {
          platform: platform.id,
          durationMs: item.parameters.durationMs,
          simulateFailure: false,
        }),
        '',
        `【完整提示词结束】`,
        '',
      );
    }
    lines.push('='.repeat(64), '');
  }
  const directory = new URL('../docs/', import.meta.url);
  const destination = new URL('loading-prompts.txt', directory);
  await mkdir(directory, { recursive: true });
  await writeFile(destination, lines.join('\n'), 'utf8');
  console.log(
    `已导出 ${cases.length} 个案例、${cases.length * platforms.length} 份完整提示词：${fileURLToPath(destination)}`,
  );
}

await exportPrompts();
