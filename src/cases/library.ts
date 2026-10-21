import { cases, platforms } from './index.ts';
import type { CaseDefinition, Category, Platform } from './types.ts';

export type TagGroup = 'type' | 'platform' | 'effect' | 'style';
export interface LibraryTag {
  id: string;
  label: string;
  group: TagGroup;
}
export interface LibraryRoute {
  tags: string[];
  search: string;
  view: 'explore' | 'saved';
  sort: 'recommended' | 'name';
  caseSlug: string | null;
}
export const defaultRoute: LibraryRoute = {
  tags: [],
  search: '',
  view: 'explore',
  sort: 'recommended',
  caseSlug: null,
};
export const tagGroups: { id: TagGroup; label: string }[] = [
  { id: 'type', label: '内容' },
  { id: 'platform', label: '平台' },
  { id: 'effect', label: '交互效果' },
  { id: 'style', label: '视觉风格' },
];

/** 同一案例同时拥有内容、平台、效果与风格标签，不再建立平台目录树。 */
export function getCaseTags(item: CaseDefinition): LibraryTag[] {
  const result: LibraryTag[] = [
    { id: `type:${item.category}`, label: item.category.toUpperCase(), group: 'type' },
  ];
  const platformTags = [
    ...(item.platforms.some((p) => ['web', 'desktop'].includes(p))
      ? [{ id: 'pc', label: 'PC' }]
      : []),
    ...(item.platforms.some((p) => ['app', 'h5', 'miniapp'].includes(p))
      ? [{ id: 'mobile', label: '移动端' }]
      : []),
    ...platforms.filter((p) => item.platforms.includes(p.id)),
  ];
  platformTags.forEach((p) =>
    result.push({ id: `platform:${p.id}`, label: p.label, group: 'platform' }),
  );
  [...new Set([...item.effects, ...item.tags])].forEach((label) =>
    result.push({ id: `effect:${label}`, label, group: 'effect' }),
  );
  item.styleTags.forEach((label) => result.push({ id: `style:${label}`, label, group: 'style' }));
  return result;
}
export const tagCatalog = [
  ...new Map(cases.flatMap(getCaseTags).map((tag) => [tag.id, tag])).values(),
];
export const quickTagIds = [
  'platform:pc',
  'platform:web',
  'platform:app',
  'effect:Loading',
  'effect:发送',
  'effect:上传',
  'effect:AI 对话',
  'style:极简',
  'style:自然',
];

/** 同组标签按 OR、不同组按 AND，关键词还会匹配案例的完整标签。 */
export function filterCases(
  items: CaseDefinition[],
  route: LibraryRoute,
  saved: string[] = [],
): CaseDefinition[] {
  const groups = tagGroups
    .map((group) =>
      route.tags.filter((id) => tagCatalog.find((tag) => tag.id === id)?.group === group.id),
    )
    .filter((ids) => ids.length);
  const search = route.search.trim().toLowerCase();
  const result = items.filter((item) => {
    if (route.view === 'saved' && !saved.includes(item.slug)) return false;
    const tags = getCaseTags(item);
    if (!groups.every((ids) => ids.some((id) => tags.some((tag) => tag.id === id)))) return false;
    return (
      !search ||
      `${item.title} ${item.englishTitle} ${item.summary} ${item.scenario} ${tags.map((tag) => tag.label).join(' ')}`
        .toLowerCase()
        .includes(search)
    );
  });
  return route.sort === 'name'
    ? result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'))
    : result;
}

/** 兼容旧链接；新链接使用重复的 tag 参数，刷新和后退可完整恢复组合条件。 */
export function readLibraryRoute(search: string): LibraryRoute {
  const query = new URLSearchParams(search);
  const tags = query
    .getAll('tag')
    .map((value) => (value.includes(':') ? value : `effect:${value}`));
  const category = query.get('category') as Category;
  if (['ui', 'ux'].includes(category)) tags.push(`type:${category}`);
  const platform = query.get('platform');
  if (platforms.some((p) => p.id === platform)) tags.push(`platform:${platform}`);
  else if (['pc', 'mobile'].includes(query.get('device') ?? ''))
    tags.push(`platform:${query.get('device')}`);
  return {
    tags: [...new Set(tags.filter((id) => tagCatalog.some((tag) => tag.id === id)))],
    search: query.get('q') ?? '',
    view: query.get('view') === 'saved' ? 'saved' : 'explore',
    sort: query.get('sort') === 'name' ? 'name' : 'recommended',
    caseSlug: query.get('case'),
  };
}
export function routeUrl(route: LibraryRoute): string {
  const query = new URLSearchParams();
  route.tags.forEach((tag) => query.append('tag', tag));
  if (route.search) query.set('q', route.search);
  if (route.view === 'saved') query.set('view', 'saved');
  if (route.sort !== 'recommended') query.set('sort', route.sort);
  if (route.caseSlug) query.set('case', route.caseSlug);
  return query.size ? `?${query}` : './';
}

/** 只保留当前目录中可识别的收藏，忽略损坏或过期的浏览器数据。 */
export function parseSaved(value: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(value ?? '[]');
    return Array.isArray(parsed)
      ? [
          ...new Set(
            parsed.filter(
              (slug): slug is string =>
                typeof slug === 'string' && cases.some((item) => item.slug === slug),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
export function previewPlatform(route: LibraryRoute): Platform {
  return (
    platforms.find((p) => route.tags.includes(`platform:${p.id}`))?.id ??
    (route.tags.includes('platform:mobile') ? 'app' : 'web')
  );
}
