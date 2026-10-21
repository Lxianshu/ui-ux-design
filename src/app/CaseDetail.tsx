import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCheck,
  CodeXml,
  Copy,
  Film,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import type { CaseDefinition, Platform } from '../cases/types';
import { buildPrompt, platforms } from '../cases/index';
import { getCaseTags } from '../cases/library';
import { DemoPlayer } from '../components/DemoPlayer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Props {
  item: CaseDefinition;
  platform: Platform;
  saved: boolean;
  onBack: () => void;
  onTag: (id: string) => void;
  onSave: () => void;
  onPlatform: (platform: Platform) => void;
}

/** 预览与提示词共享参数，媒体由显式类型决定，收藏由应用统一管理。 */
export function CaseDetail({ item, platform, saved, onBack, onTag, onSave, onPlatform }: Props) {
  const [durationMs, setDurationMs] = useState(item.parameters.durationMs);
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [running, setRunning] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [tab, setTab] = useState('prompt');
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const prompt = buildPrompt(item, { platform, durationMs, simulateFailure });
  useEffect(() => setCopyState('idle'), [prompt]);
  /** 剪贴板不可用时打开并选中完整正文，保留手动复制路径。 */
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState('success');
    } catch {
      setTab('prompt');
      setCopyState('error');
      requestAnimationFrame(() => {
        promptRef.current?.focus();
        promptRef.current?.select();
      });
    }
  };
  return (
    <div className="detail-page">
      <div className="detail-breadcrumb">
        <button onClick={onBack}>
          <ArrowLeft size={15} />
          返回探索
        </button>
        <span> / </span>
        <span>{item.englishTitle}</span>
      </div>
      <div className="case-heading">
        <div>
          <span className="detail-eyebrow">
            {item.category.toUpperCase()} /{' '}
            {item.preview.kind === 'code' ? 'INTERACTION STUDY' : 'MOTION STUDY'}
          </span>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
        </div>
        <Button variant="outline" className="save-detail" aria-pressed={saved} onClick={onSave}>
          <Bookmark fill={saved ? 'currentColor' : 'none'} />
          {saved ? '已收藏' : '收藏案例'}
        </Button>
      </div>
      <div className="detail-tags" aria-label="案例标签">
        {getCaseTags(item).map((tag) => (
          <button
            key={tag.id}
            className={`case-tag tag-${tag.group}`}
            onClick={() => onTag(tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>
      <div className="detail-workbench">
        <section className="effect-panel" aria-label="效果演示">
          <div className="effect-panel-header">
            <span>
              {item.preview.kind === 'code' ? <CodeXml size={16} /> : <Film size={16} />}效果预览
            </span>
            <Select value={platform} onValueChange={(value) => onPlatform(value as Platform)}>
              <SelectTrigger aria-label="演示平台" className="preview-platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platforms
                  .filter((p) => item.platforms.includes(p.id))
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          {item.preview.kind === 'code' ? (
            <DemoPlayer
              key={`${item.id}-${platform}`}
              item={item}
              platform={platform}
              durationMs={durationMs}
              simulateFailure={simulateFailure}
              onRunning={setRunning}
            />
          ) : (
            <div className="video-preview">
              <video
                controls
                preload="metadata"
                poster={item.preview.poster}
                aria-label={item.preview.description}
                onError={() => setVideoError(true)}
              >
                <source src={item.preview.src} />
                {item.preview.captions && (
                  <track
                    default
                    kind="captions"
                    src={item.preview.captions}
                    srcLang="zh"
                    label="中文"
                  />
                )}
                你的浏览器暂不支持视频播放。
              </video>
              <p>{item.preview.description}</p>
              {videoError && (
                <p role="status">
                  视频暂时无法播放，
                  <a href={item.preview.src} target="_blank" rel="noreferrer">
                    打开原视频
                  </a>
                  查看。
                </p>
              )}
            </div>
          )}
          {item.preview.kind === 'code' && (
            <Accordion type="single" collapsible className="demo-config">
              <AccordionItem value="settings" className="border-0">
                <AccordionTrigger className="hover:no-underline">
                  <span>
                    <SlidersHorizontal size={15} />
                    演示设置
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="config-controls">
                    <div>
                      <div className="config-label">
                        <Label htmlFor="duration">模拟等待</Label>
                        <span>{(durationMs / 1000).toFixed(1)} s</span>
                      </div>
                      <Slider
                        id="duration"
                        aria-label="模拟等待"
                        min={1200}
                        max={6000}
                        step={200}
                        value={[durationMs]}
                        disabled={running}
                        onValueChange={(values) => setDurationMs(values[0])}
                      />
                    </div>
                    <div className="config-failure">
                      <Label htmlFor="failure">模拟失败</Label>
                      <Switch
                        id="failure"
                        checked={simulateFailure}
                        disabled={running}
                        onCheckedChange={setSimulateFailure}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="preview-disclaimer">
            <span className="preview-mode-dot" />
            {item.preview.kind === 'code' ? '可交互代码演示 · 本地模拟' : '视频演示'}
            <span>{platforms.find((p) => p.id === platform)?.note}</span>
          </div>
        </section>
        <aside className="prompt-workspace" aria-label="案例提示词">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="prompt-workspace-header">
              <TabsList>
                <TabsTrigger value="prompt">完整提示词</TabsTrigger>
                <TabsTrigger value="notes">设计说明</TabsTrigger>
              </TabsList>
              <Sparkles size={16} />
            </div>
            <TabsContent value="prompt" className="m-0">
              <div className="prompt-one-line">
                <span>一句话描述这个效果</span>
                <p>{item.oneLiner}</p>
              </div>
              <Label htmlFor="full-prompt" className="sr-only">
                完整 AI 提示词
              </Label>
              <Textarea
                id="full-prompt"
                ref={promptRef}
                value={prompt}
                readOnly
                spellCheck={false}
                className="full-prompt"
              />
              <div className="prompt-copy">
                <Button className="copy-prompt-button" onClick={copy}>
                  {copyState === 'success' ? <Check /> : <Copy />}
                  {copyState === 'success' ? '已复制完整提示词' : '复制完整提示词'}
                  <ArrowUpRight className="ml-auto" />
                </Button>
                <span role="status">
                  {copyState === 'success'
                    ? '已复制，可直接粘贴到你的 AI 工具'
                    : copyState === 'error'
                      ? '复制受限，已选中文本，请手动复制'
                      : '平台与演示参数已写入正文'}
                </span>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="m-0">
              <div className="case-notes">
                {[
                  ['设计原则', item.principle],
                  ['适用场景', item.scenario],
                  ['落地建议', item.implementationNotes],
                  ['无障碍', item.accessibilityNotes],
                  [
                    '平台说明',
                    'Web / H5 是浏览器组件；桌面、小程序、App 为浏览器模拟，对应提示词提供各平台约束，原生工程需单独实现。',
                  ],
                ].map(([title, text]) => (
                  <section key={title}>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </section>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
      <div className="case-study-notes">
        <section>
          <span className="detail-eyebrow">THE FLOW</span>
          <h2>从触发，到完成</h2>
          <ol>
            {item.states.map((state, i) => (
              <li key={state}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {state}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <span className="detail-eyebrow">THE DETAILS</span>
          <h2>值得复用的细节</h2>
          {item.acceptanceCriteria.map((text) => (
            <p key={text}>
              <CheckCheck size={16} />
              {text}
            </p>
          ))}
        </section>
      </div>
    </div>
  );
}
