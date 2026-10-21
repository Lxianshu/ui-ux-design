import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPrompt,
  cases,
  navigationProgress,
  photoProgress,
  platforms,
  streamCount,
} from './index.ts';

test('九个场景分类唯一且均有完整的五端提示词', () => {
  assert.equal(cases.length, 9);
  assert.equal(new Set(cases.map((item) => item.slug)).size, 9);
  assert.equal(cases.filter((item) => item.category === 'ui').length, 4);
  assert.equal(cases.filter((item) => item.category === 'ux').length, 5);
  for (const item of cases) {
    for (const platform of platforms) {
      const prompt = buildPrompt(item, {
        platform: platform.id,
        durationMs: 3800,
        simulateFailure: true,
      });
      assert.ok(prompt.includes('3800ms'));
      assert.ok(prompt.includes('开启模拟失败'));
      assert.ok(prompt.includes(item.acceptanceCriteria[0]));
      assert.ok(prompt.includes(item.implementationNotes));
      assert.ok(prompt.includes(item.visualStyle));
      assert.ok(!prompt.includes('{{'));
      assert.ok(item.platforms.includes(platform.id));
    }
  }
});

test('不确定进度必须等到成功才到 100%', () => {
  assert.equal(navigationProgress(0, 'running'), 0);
  assert.ok(navigationProgress(100, 'running') <= 0.9);
  assert.ok(navigationProgress(1, 'error') <= 0.9);
  assert.equal(navigationProgress(0.8, 'success'), 1);
});

test('单张失败不影响其余上传，成功状态不能提前出现', () => {
  assert.equal(photoProgress(1, 0, true), 1);
  assert.equal(photoProgress(1, 1, true), 0.55);
  assert.equal(photoProgress(1, 2, true), 1);
  assert.ok(photoProgress(0.3, 0, false) > photoProgress(0.3, 1, false));
  assert.ok(photoProgress(0.3, 1, false) > photoProgress(0.3, 2, false));
});

test('流式回复保留首段等待，中断时只保留已模拟的前三块', () => {
  assert.equal(streamCount(0.19, false), 0);
  assert.equal(streamCount(0.2, false), 1);
  assert.equal(streamCount(1, false), 6);
  assert.equal(streamCount(1, true), 3);
});
