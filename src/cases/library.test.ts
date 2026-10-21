import test from 'node:test';
import assert from 'node:assert/strict';
import { cases } from './index.ts';
import {
  defaultRoute,
  filterCases,
  getCaseTags,
  parseSaved,
  readLibraryRoute,
  routeUrl,
} from './library.ts';

test('平台、效果、内容标签可组合；同组任选，跨组同时匹配', () => {
  const route = { ...defaultRoute, tags: ['type:ux', 'platform:app', 'effect:发送'] };
  assert.deepEqual(
    filterCases(cases, route).map((c) => c.id),
    ['message', 'stream'],
  );
  assert.equal(
    filterCases(cases, { ...defaultRoute, tags: ['type:ui', 'effect:Loading'] }).length,
    4,
  );
  assert.equal(filterCases(cases, { ...defaultRoute, tags: ['type:ui', 'type:ux'] }).length, 9);
  assert.ok(getCaseTags(cases[0]).some((tag) => tag.id === 'platform:pc'));
});
test('组合标签分享链接、旧链接和无效参数均能正确处理', () => {
  const route = {
    ...defaultRoute,
    tags: ['platform:web', 'effect:Loading'],
    search: '骨架',
    view: 'saved' as const,
    caseSlug: 'skeleton-reveal',
  };
  assert.deepEqual(readLibraryRoute(routeUrl(route)), route);
  assert.deepEqual(readLibraryRoute('?category=ux&platform=app&case=photo-upload').tags, [
    'type:ux',
    'platform:app',
  ]);
  assert.deepEqual(readLibraryRoute('?tag=unknown&tag=platform:unknown').tags, []);
});
test('收藏数据持久化容错，收藏页面与关键词可同时筛选', () => {
  assert.deepEqual(parseSaved('invalid'), []);
  assert.deepEqual(parseSaved('["ai-streaming","unknown","ai-streaming",9]'), ['ai-streaming']);
  assert.deepEqual(
    filterCases(cases, { ...defaultRoute, view: 'saved', search: 'AI' }, ['ai-streaming']).map(
      (c) => c.id,
    ),
    ['stream'],
  );
});
