import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  CodeXml,
  Copy,
  Layers2,
  Play,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { CaseDefinition, Platform } from '../cases/types';
import { cases, buildPrompt } from '../cases/index';
import {
  defaultRoute,
  filterCases,
  getCaseTags,
  parseSaved,
  previewPlatform,
  quickTagIds,
  readLibraryRoute,
  routeUrl,
  tagCatalog,
  tagGroups,
} from '../cases/library';
import type { LibraryRoute } from '../cases/library';
import { CaseArtwork } from '../components/CaseArtwork';
import { CaseDetail } from './CaseDetail';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const savedKey = 'weimiao.saved-cases.v1';
/** 本地收藏读取失败不影响正常浏览。 */
function initialSaved() {
  try {
    return parseSaved(localStorage.getItem(savedKey));
  } catch {
    return [];
  }
}

/** 页面围绕案例、组合标签与收藏组织；分享链接保存浏览上下文。 */
export default function App() {
  const [route, setRoute] = useState<LibraryRoute>(() => readLibraryRoute(location.search));
  const [saved, setSaved] = useState<string[]>(initialSaved);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [fallback, setFallback] = useState<{ title: string; prompt: string } | null>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const pop = () => setRoute(readLibraryRoute(location.search));
    window.addEventListener('popstate', pop);
    return () => window.removeEventListener('popstate', pop);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(savedKey, JSON.stringify(saved));
    } catch {
      setNotice('当前浏览器无法保存收藏，本次浏览仍可使用。');
    }
  }, [saved]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        searchRef.current &&
        !event.ctrlKey &&
        !event.metaKey &&
        !(
          event.target instanceof HTMLElement &&
          event.target.closest('input,textarea,[contenteditable]')
        )
      ) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);
  /** 只有跨详情导航时回到顶部，切换标签时保留浏览位置。 */
  const navigate = (patch: Partial<LibraryRoute>, replace = false) => {
    const next = { ...route, ...patch };
    history[replace ? 'replaceState' : 'pushState'](null, '', routeUrl(next));
    setRoute(next);
    if (route.caseSlug !== next.caseSlug) {
      window.scrollTo({ top: 0 });
      requestAnimationFrame(() => focusRef.current?.focus({ preventScroll: true }));
    }
  };
  const resetLibrary = () => {
    navigate(defaultRoute);
    window.scrollTo({ top: 0 });
  };
  const toggleTag = (id: string) =>
    navigate({
      tags: route.tags.includes(id) ? route.tags.filter((tag) => tag !== id) : [...route.tags, id],
      caseSlug: null,
    });
  const toggleSave = (slug: string) =>
    setSaved((values) =>
      values.includes(slug) ? values.filter((value) => value !== slug) : [...values, slug],
    );
  const filtered = useMemo(() => filterCases(cases, route, saved), [route, saved]);
  const item = cases.find((c) => c.slug === route.caseSlug);
  const platform = previewPlatform(route);
  const detailPlatform = item?.platforms.includes(platform)
    ? platform
    : (item?.platforms[0] ?? platform);
  const copyCase = async (c: CaseDefinition) => {
    const prompt = buildPrompt(c, {
      platform: c.platforms.includes(platform) ? platform : c.platforms[0],
      durationMs: c.parameters.durationMs,
      simulateFailure: false,
    });
    try {
      await navigator.clipboard.writeText(prompt);
      setNotice(`已复制「${c.title}」完整提示词`);
    } catch {
      setFallback({ title: c.title, prompt });
    }
  };
  const jumpToGallery = () =>
    galleryRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  const selectPlatform = (value: Platform) =>
    navigate({
      tags: [...route.tags.filter((id) => !id.startsWith('platform:')), `platform:${value}`],
    });
  return (
    <div className="inspiration-app">
      <a href="#content" className="skip-link">
        跳到正文
      </a>
      <header className="site-header">
        <a
          className="site-brand"
          href="./"
          onClick={(event) => {
            event.preventDefault();
            resetLibrary();
          }}
        >
          <span>
            <Layers2 size={23} />
          </span>
          <strong>
            微妙<span> / Motion Library</span>
          </strong>
        </a>
        <nav aria-label="主导航">
          <button
            className={route.view === 'explore' && !route.caseSlug ? 'active' : ''}
            onClick={() => navigate({ view: 'explore', caseSlug: null })}
          >
            探索
          </button>
          <button
            className={route.view === 'saved' && !route.caseSlug ? 'active' : ''}
            onClick={() => navigate({ view: 'saved', caseSlug: null })}
          >
            <Bookmark size={15} />
            我的收藏{saved.length > 0 && <span className="saved-count">{saved.length}</span>}
          </button>
          <button
            className="nav-guide"
            onClick={() => {
              navigate({ caseSlug: null });
              requestAnimationFrame(() =>
                document
                  .getElementById('guide')
                  ?.scrollIntoView({
                    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? 'instant'
                      : 'smooth',
                  }),
              );
            }}
          >
            <BookOpen size={15} />
            使用指南
          </button>
        </nav>
        <a
          className="header-link"
          href="https://github.com/Cart-liu/ui-ux-design"
          target="_blank"
          rel="noreferrer"
        >
          项目源码
          <ArrowUpRight size={14} />
        </a>
      </header>
      <main id="content">
        <div className="sr-only" ref={focusRef} tabIndex={-1}>
          {item?.title ?? 'UI / UX 风格与交互提示词库'}
        </div>
        {route.caseSlug ? (
          item ? (
            <CaseDetail
              key={item.id}
              item={item}
              platform={detailPlatform}
              saved={saved.includes(item.slug)}
              onSave={() => toggleSave(item.slug)}
              onBack={() => navigate({ caseSlug: null })}
              onTag={(id) => navigate({ tags: [id], caseSlug: null, view: 'explore' })}
              onPlatform={selectPlatform}
            />
          ) : (
            <div className="gallery-empty">
              <Search size={30} />
              <h1>这个案例暂不存在</h1>
              <Button onClick={() => navigate({ caseSlug: null })}>返回探索</Button>
            </div>
          )
        ) : (
          <>
            <section className={`discovery-hero ${route.view === 'saved' ? 'saved-hero' : ''}`}>
              <div className="hero-label">
                <Sparkles size={13} />
                {route.view === 'saved'
                  ? 'YOUR PERSONAL COLLECTION'
                  : 'CURATED UI / UX INSPIRATION'}
              </div>
              <h1>
                {route.view === 'saved' ? (
                  <>
                    你的灵感，
                    <br />
                    值得被留下。
                  </>
                ) : (
                  <>
                    看见好设计，
                    <br />
                    带走<span>好提示词。</span>
                  </>
                )}
              </h1>
              <p>
                {route.view === 'saved'
                  ? '把值得复用的风格与交互，留给下一个项目。收藏保存在此浏览器。'
                  : '一个沉淀 UI / UX 风格与交互的灵感库。先看效果，再把完整提示词带进你的项目。'}
              </p>
              <div className="hero-search">
                <Search size={19} />
                <Input
                  ref={searchRef}
                  aria-label="搜索案例"
                  placeholder="搜索风格、平台或交互效果…"
                  value={route.search}
                  onChange={(event) => navigate({ search: event.target.value }, true)}
                />
                {route.search ? (
                  <button aria-label="清空搜索" onClick={() => navigate({ search: '' }, true)}>
                    <X size={16} />
                  </button>
                ) : (
                  <kbd>/</kbd>
                )}
              </div>
              <button className="explore-anchor" onClick={jumpToGallery}>
                探索你的下一份灵感
                <ArrowDown size={14} />
              </button>
            </section>
            <section className="gallery-section" aria-label="案例目录" ref={galleryRef}>
              <div className="gallery-toolbar">
                <div className="gallery-tabs">
                  <Tabs
                    value={route.view}
                    onValueChange={(view) => navigate({ view: view as LibraryRoute['view'] })}
                  >
                    <TabsList aria-label="案例视图">
                      <TabsTrigger value="explore">探索全部</TabsTrigger>
                      <TabsTrigger value="saved">
                        <Bookmark size={13} />
                        我的收藏
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <span className="case-count">{filtered.length} 个案例</span>
                </div>
                <div className="gallery-tools">
                  <Button
                    variant="outline"
                    className={filtersOpen ? 'filter-button selected' : 'filter-button'}
                    aria-expanded={filtersOpen}
                    aria-controls="tag-filters"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                  >
                    <SlidersHorizontal size={14} />
                    标签筛选{route.tags.length > 0 && <span>{route.tags.length}</span>}
                    <ChevronDown size={13} />
                  </Button>
                  <Select
                    value={route.sort}
                    onValueChange={(sort) => navigate({ sort: sort as LibraryRoute['sort'] })}
                  >
                    <SelectTrigger aria-label="案例排序" className="sort-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">默认推荐</SelectItem>
                      <SelectItem value="name">按名称排序</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="quick-tags" aria-label="快捷标签">
                <button
                  className={route.tags.length === 0 ? 'active' : ''}
                  onClick={() => navigate({ tags: [] })}
                >
                  全部
                </button>
                {['type:ui', 'type:ux', ...quickTagIds].map((id) => {
                  const tag = tagCatalog.find((tag) => tag.id === id)!;
                  return (
                    <button
                      key={id}
                      aria-pressed={route.tags.includes(id)}
                      className={route.tags.includes(id) ? 'active' : ''}
                      onClick={() => toggleTag(id)}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
              {filtersOpen && (
                <div className="tag-filter-panel" id="tag-filters">
                  <div className="filter-panel-intro">
                    <span>标签可以组合：同组任选，跨组匹配。</span>
                    <button onClick={() => navigate({ tags: [], search: '' })}>清除筛选</button>
                  </div>
                  {tagGroups.map((group) => (
                    <div className="filter-tag-group" key={group.id}>
                      <span>{group.label}</span>
                      <div>
                        {tagCatalog
                          .filter((tag) => tag.group === group.id)
                          .map((tag) => (
                            <button
                              key={tag.id}
                              aria-pressed={route.tags.includes(tag.id)}
                              className={route.tags.includes(tag.id) ? 'active' : ''}
                              onClick={() => toggleTag(tag.id)}
                            >
                              {tag.label}
                              {route.tags.includes(tag.id) && <Check size={12} />}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {(route.tags.length > 0 || route.search) && (
                <div className="applied-filters">
                  <span>当前筛选</span>
                  {route.tags.map((id) => (
                    <button
                      key={id}
                      aria-label={`移除标签：${tagCatalog.find((tag) => tag.id === id)?.label}`}
                      onClick={() => toggleTag(id)}
                    >
                      {tagCatalog.find((tag) => tag.id === id)?.label}
                      <X size={11} />
                    </button>
                  ))}
                  {route.search && <span className="query-filter">“{route.search}”</span>}
                  <button
                    className="clear-filters"
                    onClick={() => navigate({ tags: [], search: '' })}
                  >
                    清除全部
                  </button>
                </div>
              )}
              <div className="inspiration-grid">
                {filtered.map((c) => {
                  const tags = getCaseTags(c);
                  const cardTags = [
                    tags[0],
                    ...tags.filter(
                      (t) =>
                        t.id === `platform:${platform}` ||
                        t.id === (platform === 'app' ? 'platform:web' : 'platform:app'),
                    ),
                    ...tags.filter((t) => c.effects.includes(t.label)).slice(0, 2),
                    ...tags.filter((t) => t.group === 'style').slice(0, 1),
                  ];
                  const isSaved = saved.includes(c.slug);
                  return (
                    <article className="gallery-card" key={c.id}>
                      <div className="visual-cover">
                        <a
                          href={routeUrl({ ...route, caseSlug: c.slug })}
                          aria-label={`查看效果：${c.title}`}
                          onClick={(event) => {
                            if (
                              !event.ctrlKey &&
                              !event.metaKey &&
                              !event.shiftKey &&
                              !event.altKey
                            ) {
                              event.preventDefault();
                              navigate({ caseSlug: c.slug });
                            }
                          }}
                        >
                          <CaseArtwork item={c} />
                          <span className="cover-media-label">
                            {c.preview.kind === 'code' ? <CodeXml size={12} /> : <Play size={12} />}{' '}
                            {c.preview.kind === 'code' ? '代码演示' : '视频演示'}
                          </span>
                          <span className="cover-open">
                            <Play size={15} fill="currentColor" />
                            查看效果
                          </span>
                        </a>
                        <button
                          className={`save-case ${isSaved ? 'is-saved' : ''}`}
                          aria-label={`${isSaved ? '取消收藏' : '收藏案例'}：${c.title}`}
                          aria-pressed={isSaved}
                          onClick={() => toggleSave(c.slug)}
                        >
                          <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="gallery-card-info">
                        <div className="gallery-card-title">
                          <a
                            href={routeUrl({ ...route, caseSlug: c.slug })}
                            onClick={(event) => {
                              if (
                                !event.ctrlKey &&
                                !event.metaKey &&
                                !event.shiftKey &&
                                !event.altKey
                              ) {
                                event.preventDefault();
                                navigate({ caseSlug: c.slug });
                              }
                            }}
                          >
                            <h2>{c.title}</h2>
                          </a>
                          <button
                            className="quick-copy"
                            aria-label={`复制提示词：${c.title}`}
                            onClick={() => copyCase(c)}
                            title="复制完整提示词"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                        <p>{c.summary}</p>
                        <div className="card-tags">
                          {cardTags.map((tag) => (
                            <button
                              className={`case-tag tag-${tag.group}`}
                              key={tag.id}
                              onClick={() => toggleTag(tag.id)}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {filtered.length === 0 && (
                <div className="gallery-empty">
                  {route.view === 'saved' ? <Bookmark size={32} /> : <Search size={32} />}
                  <h2>
                    {route.view === 'saved' && saved.length === 0
                      ? '把你的第一份灵感留下来'
                      : '还没有匹配的案例'}
                  </h2>
                  <p>
                    {route.view === 'saved' && saved.length === 0
                      ? '点击案例右上角的收藏图标，在这里慢慢积累你的灵感。'
                      : '试试减少标签或换一个关键词，更多灵感就在下一次探索。'}
                  </p>
                  <Button onClick={() => navigate({ ...defaultRoute, view: 'explore' })}>
                    探索全部案例
                    <ArrowUpRight />
                  </Button>
                </div>
              )}
              {filtered.length > 0 && (
                <div className="gallery-end">
                  <span />
                  <p>好设计，来自日常的每一次积累。</p>
                  <span />
                </div>
              )}
            </section>
            <section className="library-guide" id="guide">
              <div>
                <span className="detail-eyebrow">FROM INSPIRATION TO CREATION</span>
                <h2>
                  看到喜欢的，
                  <br />
                  带进你的下一个项目。
                </h2>
              </div>
              <Accordion type="single" collapsible defaultValue="how">
                <AccordionItem value="how">
                  <AccordionTrigger>如何使用这里的案例？</AccordionTrigger>
                  <AccordionContent>
                    用平台、效果或风格标签找到案例，打开后操作真实演示，再复制与当前平台和参数匹配的完整提示词。每个案例都保留了异常恢复与无障碍要求。
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tags">
                  <AccordionTrigger>一个案例可以属于多个标签吗？</AccordionTrigger>
                  <AccordionContent>
                    可以。UI / UX、PC / Web / App、Loading /
                    发送以及视觉风格都是案例标签。同组标签按任选匹配，不同组组合筛选，无需在目录之间反复切换。
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="media">
                  <AccordionTrigger>案例可以用什么方式展示？</AccordionTrigger>
                  <AccordionContent>
                    支持可交互代码演示和带播放控件的视频。当前首批九个案例均为本地代码演示；浏览器中的小程序、桌面和
                    App 为场景模拟，原生工程需要按对应提示词实现。
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer">
        <a
          className="footer-brand"
          href="./"
          onClick={(event) => {
            event.preventDefault();
            resetLibrary();
          }}
        >
          <Layers2 size={17} />
          微妙 / Motion Library
        </a>
        <span>把值得复用的设计，慢慢留下来。</span>
        <span>UI · UX · PROMPTS</span>
      </footer>
      {notice && (
        <div className="notice-toast" role="status">
          <Check size={16} />
          {notice}
          <button aria-label="关闭提示" onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}
      <Sheet open={!!fallback} onOpenChange={(open) => !open && setFallback(null)}>
        <SheetContent
          className="copy-fallback"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            fallbackRef.current?.focus();
            fallbackRef.current?.select();
          }}
        >
          <SheetHeader>
            <SheetTitle>复制完整提示词</SheetTitle>
            <SheetDescription>
              浏览器限制了自动复制。正文已选中，可手动复制「{fallback?.title}」的完整提示词。
            </SheetDescription>
          </SheetHeader>
          <Textarea
            ref={fallbackRef}
            value={fallback?.prompt ?? ''}
            readOnly
            aria-label="手动复制完整提示词"
          />
          <Button
            onClick={() => {
              fallbackRef.current?.focus();
              fallbackRef.current?.select();
            }}
          >
            选中全部正文
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
