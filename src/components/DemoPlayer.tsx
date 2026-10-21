import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CaseDefinition, DemoId, Platform, SimulationStatus } from '../cases/types';
import { navigationProgress, photoProgress, responseChunks, streamCount } from '../cases/index';
import { useSimulation } from '../hooks/useSimulation';
import { Icon } from './Icon';
import { Landscape } from './Landscape';
import { Button } from './ui/button';
import {
  BatteryFull,
  Car,
  Check,
  CheckCheck,
  Circle,
  CircleAlert,
  Clock3,
  Ellipsis,
  Layers2,
  Signal,
  Sparkles,
  UserRound,
  Wifi,
} from 'lucide-react';

interface DemoProps {
  status: SimulationStatus;
  progress: number;
  failed: boolean;
  retrying: boolean;
  onStart: (retry?: boolean) => void;
  onCancel: () => void;
}

function ContentRows({ skeleton = false }: { skeleton?: boolean }) {
  return (
    <div
      className={skeleton ? 'content-rows skeleton-rows' : 'content-rows'}
      aria-hidden={skeleton || undefined}
    >
      {['让空间保持呼吸', '把日常装进设计', '收集微小的美好'].map((text, i) => (
        <div className="content-row" style={{ '--row': i } as CSSProperties} key={text}>
          <div className="row-image">{!skeleton && <Landscape variant={i} />}</div>
          <div className="row-copy">
            <b>{skeleton ? '' : text}</b>
            <span>{skeleton ? '' : 'DESIGN NOTES · 设计日常'}</span>
            <i />
          </div>
        </div>
      ))}
    </div>
  );
}

function LaunchDemo({ status, progress }: DemoProps) {
  const ready = status === 'success';
  const reveal = status === 'running' ? Math.max(0, (progress - 0.7) / 0.3) : ready ? 1 : 0;
  return (
    <div className="launch-demo">
      <div
        className={`home-reveal ${ready ? 'revealed' : ''}`}
        style={{ opacity: reveal, transform: `translateY(${24 * (1 - reveal)}px)` }}
      >
        <span className="eyebrow">A NEW PERSPECTIVE</span>
        <h3>今天，也有新灵感。</h3>
        <div className="home-tiles">
          <i />
          <i />
          <i />
        </div>
        <p>留一点空间，给即将发生的美好。</p>
      </div>
      <div
        className="launch-cover"
        style={{ opacity: 1 - reveal, pointerEvents: ready ? 'none' : undefined }}
      >
        <div
          className="brand-mark"
          style={{ transform: `scale(${1 + 11 * reveal})`, opacity: 1 - reveal }}
        >
          <Layers2 size={32} aria-hidden="true" />
        </div>
        <small>
          {status === 'running'
            ? '正在准备你的灵感'
            : status === 'error'
              ? '准备失败，请重试'
              : '每一次开始，都值得期待'}
        </small>
      </div>
    </div>
  );
}

function ProgressDemo({ status, progress }: DemoProps) {
  return (
    <div className="progress-demo">
      <div
        className={`top-progress ${status}`}
        style={{ transform: `scaleX(${navigationProgress(progress, status)})` }}
      />
      <span className="eyebrow">YOUR DAILY INSPIRATION</span>
      <h3>慢慢来，灵感会到。</h3>
      <p>
        {status === 'success'
          ? '内容已更新，继续你的阅读。'
          : status === 'error'
            ? '刷新失败，原内容仍可查看。'
            : '页面留在这里，新的内容正在路上。'}
      </p>
      <div className="article-cover">
        <Landscape />
      </div>
      <div className="article-lines">
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function SkeletonDemo({ status }: DemoProps) {
  return (
    <div className={`skeleton-demo ${status === 'error' ? 'failed' : ''}`}>
      <span className="eyebrow">THE DAILY COLLECTION</span>
      <h3>发现设计日常</h3>
      <ContentRows skeleton={status === 'running' || status === 'error'} />
      {status === 'error' && <p className="inline-error">内容加载失败，请重试。</p>}
    </div>
  );
}

function ImageDemo({ status }: DemoProps) {
  return (
    <div className="image-demo">
      <div className={`focus-landscape ${status === 'success' ? 'sharp' : ''}`}>
        <Landscape />
      </div>
      <div className="image-description">
        <span className="eyebrow">SOMEWHERE SLOW</span>
        <h3>去山野，找一点留白。</h3>
        <p>
          {status === 'success'
            ? '画面已清晰，布局始终如一。'
            : status === 'error'
              ? '清晰图加载失败，已保留占位。'
              : '先看见色彩，再看见细节。'}
        </p>
      </div>
    </div>
  );
}

function UploadDemo({ status, progress, failed, retrying, onStart }: DemoProps) {
  const [published, setPublished] = useState(false);
  const complete = status === 'success';
  return (
    <div className="upload-demo">
      <span className="eyebrow">A MOMENT WORTH SHARING</span>
      <h3>分享今天的小美好</h3>
      <p>已选择 3 张示例照片</p>
      <div className="upload-photos">
        {[0, 1, 2].map((i) => {
          const value = retrying ? (i === 1 ? progress : 1) : photoProgress(progress, i, failed);
          const error = failed && i === 1 && value >= 0.55;
          return (
            <div className="upload-cell" key={i}>
              <div className="upload-photo">
                <div className="dim-photo">
                  <Landscape variant={i} />
                </div>
                <div
                  className="bright-photo"
                  style={{ clipPath: `inset(${(1 - value) * 100}% 0 0 0)` }}
                >
                  <Landscape variant={i} />
                </div>
                <span className={`photo-status ${error ? 'error' : ''}`}>
                  {error ? (
                    <CircleAlert size={14} aria-hidden="true" />
                  ) : value >= 1 ? (
                    <Check size={14} aria-hidden="true" />
                  ) : (
                    `${Math.floor(value * 100)}%`
                  )}
                </span>
              </div>
              <small>
                照片 {i + 1} · {error ? '失败' : value >= 1 ? '已上传' : '待完成'}
              </small>
              {error && status === 'error' && (
                <button className="text-button" onClick={() => onStart(true)}>
                  重试这张
                </button>
              )}
            </div>
          );
        })}
      </div>
      <button
        className="demo-primary"
        disabled={!complete || published}
        onClick={() => setPublished(true)}
      >
        {published && <Check size={14} aria-hidden="true" />}
        {published ? '已发布（模拟）' : '发布动态'}
      </button>
      <p className="demo-hint" role="status">
        {published
          ? '发布成功，你的三张照片已准备就绪。'
          : complete
            ? '全部上传成功，可以发布。'
            : '全部上传成功后，发布按钮才会亮起。'}
      </p>
    </div>
  );
}

function MessageDemo({ status, onStart }: DemoProps) {
  const [text, setText] = useState('收到，马上出发！');
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<{ text: string; status: SimulationStatus }[]>([]);
  // 只更新原消息，失败重试不会新增气泡；每次状态变化同步最后一条。
  useEffect(() => {
    if (status !== 'idle')
      setMessages((items) =>
        items.map((item, i) => (i === items.length - 1 ? { ...item, status } : item)),
      );
  }, [status]);
  const send = () => {
    if (!text.trim() || status === 'running') return;
    setMessages((items) => [...items, { text: text.trim(), status: 'running' }]);
    setText('');
    onStart();
    inputRef.current?.focus({ preventScroll: true });
  };
  return (
    <div className="message-demo">
      <div className="conversation-title">
        <span className="person-avatar">
          <UserRound size={18} aria-hidden="true" />
        </span>
        <div>
          <b>林间设计室</b>
          <small>示例会话 · 无真实消息发送</small>
        </div>
      </div>
      <div className="messages">
        <div className="received">周末一起去收集新的灵感吧。</div>
        {messages.map((message, i) => (
          <div className="sent-wrap" key={i}>
            <div className="sent">{message.text}</div>
            <small>
              {message.status === 'success' ? (
                <CheckCheck size={12} aria-hidden="true" />
              ) : message.status === 'error' ? (
                <CircleAlert size={12} aria-hidden="true" />
              ) : (
                <Clock3 size={12} aria-hidden="true" />
              )}
              {message.status === 'success'
                ? '已送达'
                : message.status === 'error'
                  ? '发送失败'
                  : '发送中'}
            </small>
            {message.status === 'error' && (
              <button className="text-button" onClick={() => onStart(true)}>
                重试消息
              </button>
            )}
          </div>
        ))}
      </div>
      <form
        className="message-composer"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <label className="sr-only" htmlFor="message-input">
          消息内容
        </label>
        <input
          ref={inputRef}
          id="message-input"
          maxLength={120}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入一条消息…"
          readOnly={status === 'running' || status === 'error'}
        />
        <button
          className="demo-primary"
          disabled={!text.trim() || status === 'running' || status === 'error'}
        >
          发送消息
        </button>
      </form>
      <span className="demo-hint">双勾代表已送达，不代表已读。</span>
    </div>
  );
}

function RideDemo({ status, progress, onCancel }: DemoProps) {
  const matching = status === 'running' && progress < 0.45;
  const matched = (status === 'running' && !matching) || status === 'success';
  const travel = Math.min(1, Math.max(0, (progress - 0.45) / 0.55));
  // 车辆与路线共用 SVG 坐标系，窗口变化时仍严格沿路线接近用户。
  const distance = travel * 355;
  const x =
    distance <= 80
      ? 330 - distance
      : distance <= 185
        ? 250
        : distance <= 315
          ? 250 - (distance - 185)
          : 120;
  const y =
    distance <= 80
      ? 45
      : distance <= 185
        ? 45 + distance - 80
        : distance <= 315
          ? 150
          : 150 + distance - 315;
  return (
    <div className="ride-demo">
      <div className="ride-map">
        <div className="map-block b1" />
        <div className="map-block b2" />
        <div className="map-block b3" />
        <div className="map-block b4" />
        <svg
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          className="ride-route"
          aria-hidden="true"
        >
          <path
            d="M330 45H250V150H120V190"
            fill="none"
            stroke="#78aa8c"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="7 7"
          />
          {matched && (
            <g transform={`translate(${x},${y})`} className="route-car">
              <Car x={-14} y={-14} width={28} height={28} fill="#fffff3" stroke="#6d885a" />
            </g>
          )}
        </svg>
        <span className="location-label">你在这里</span>
        <span className={`user-pin ${matching ? 'searching' : ''}`}>
          <i />
          <i />
          <b />
        </span>
        <span className="map-watermark">LOCAL MAP / 模拟地图</span>
      </div>
      <div className="ride-info">
        <span className="eyebrow">YOUR NEXT JOURNEY</span>
        <h3>
          {matching
            ? '正在寻找附近司机'
            : matched
              ? status === 'success'
                ? '车辆已到达'
                : '林师傅已接单'
              : '出发，去有灵感的地方'}
        </h3>
        <p>
          {matched
            ? '演示车辆 · 路线为本地模拟'
            : status === 'cancelled'
              ? '叫车已取消，你可以随时重新开始。'
              : status === 'error'
                ? '暂时没有司机接单，请重试。'
                : '当前位置 → 城市艺术中心'}
        </p>
        {status === 'running' && (
          <button className="demo-secondary" onClick={onCancel}>
            取消叫车
          </button>
        )}
      </div>
    </div>
  );
}

function PaginationDemo({ status, onStart }: DemoProps) {
  const [pages, setPages] = useState(1);
  const scroll = useRef<HTMLDivElement>(null);
  const requested = useRef(false);
  useEffect(() => {
    if (status === 'success') setPages((value) => Math.min(3, value + 1));
    if (status !== 'running') requested.current = false;
  }, [status]);
  const loadNext = () => {
    if (pages >= 3 || status === 'running' || requested.current) return;
    requested.current = true;
    onStart(status === 'error');
  };
  return (
    <div className="pagination-demo">
      <span className="eyebrow">A NEVER-RUSHED FEED</span>
      <h3>灵感，接着发生。</h3>
      <p className="demo-hint">在下方列表滚动，距底部 120px 时预加载。</p>
      <div
        className="feed-scroll"
        ref={scroll}
        tabIndex={0}
        aria-label="可滚动的灵感列表"
        onScroll={() => {
          const element = scroll.current;
          if (
            element &&
            element.scrollHeight - element.scrollTop - element.clientHeight <= 120 &&
            status !== 'error'
          )
            loadNext();
        }}
      >
        {Array.from({ length: pages * 4 }, (_, i) => (
          <div className="feed-item" style={{ '--row': i % 4 } as CSSProperties} key={i}>
            <div className="feed-thumb">
              <Landscape variant={i} />
            </div>
            <div>
              <small>COLLECTION {String(i + 1).padStart(2, '0')}</small>
              <b>
                {
                  [
                    '给日常一点新的视角',
                    '让设计回到生活',
                    '走进一片安静的山野',
                    '捕捉正在发生的美好',
                  ][i % 4]
                }
              </b>
              <span>设计笔记 · 约 3 分钟阅读</span>
            </div>
          </div>
        ))}
        <div className="feed-bottom">
          {pages >= 3 ? (
            <span className="icon-label">
              <Check size={14} aria-hidden="true" />
              你已看完全部灵感
            </span>
          ) : status === 'running' ? (
            <span>正在准备下一页…</span>
          ) : (
            <button className="demo-secondary" onClick={loadNext}>
              {status === 'error' ? '加载失败，重试下一页' : '加载下一页'}
            </button>
          )}
        </div>
      </div>
      <small className="demo-hint">第 {pages} / 3 页 · 已有内容始终保留</small>
    </div>
  );
}

function StreamDemo({ status, progress, failed, onStart, onCancel }: DemoProps) {
  const count = streamCount(progress, failed);
  return (
    <div className="stream-demo">
      <div className="assistant-heading">
        <span>
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <b>微妙助手</b>
          <small>本地语义流模拟</small>
        </div>
      </div>
      {status === 'idle' ? (
        <div className="assistant-empty">
          <h3>
            好的体验，
            <br />
            从一点反馈开始。
          </h3>
          <p>发送问题，观察思考与生成两个阶段。</p>
          <button className="demo-secondary" onClick={() => onStart()}>
            发送问题
          </button>
        </div>
      ) : (
        <>
          <div className="question-bubble">如何让等待更友好？</div>
          <div className="assistant-response">
            {count === 0 && status === 'running' ? (
              <span className="thinking">
                <i />
                <i />
                <i />
                <small>正在思考</small>
              </span>
            ) : (
              responseChunks.slice(0, count).map((chunk, i) => (
                <span key={chunk} className="response-chunk">
                  {chunk}
                  {i === 0 && <br />}
                </span>
              ))
            )}
          </div>
          <div className="stream-status">
            {status === 'running' ? (
              <button className="demo-secondary" onClick={onCancel}>
                停止生成
              </button>
            ) : (
              <>
                <small>
                  {status === 'success' && <Check size={12} aria-hidden="true" />}
                  {status === 'success'
                    ? '回复完成'
                    : status === 'error'
                      ? '连接中断，已保留生成内容'
                      : '已停止，已保留生成内容'}
                </small>
                <button className="text-button" onClick={() => onStart(true)}>
                  重新生成
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// 显式注册表保证目录中的每个 demoId 都有真实演示组件。
const demoRegistry: Record<DemoId, React.ComponentType<DemoProps>> = {
  launch: LaunchDemo,
  progress: ProgressDemo,
  skeleton: SkeletonDemo,
  image: ImageDemo,
  upload: UploadDemo,
  message: MessageDemo,
  ride: RideDemo,
  pagination: PaginationDemo,
  stream: StreamDemo,
};
const actionLabels: Record<DemoId, string> = {
  launch: '进入首页',
  progress: '刷新内容',
  skeleton: '加载内容',
  image: '加载清晰图',
  upload: '开始上传',
  message: '在预览中发送消息',
  ride: '开始叫车',
  pagination: '在预览中滚动列表',
  stream: '发送问题',
};

interface PlayerProps {
  item: CaseDefinition;
  platform: Platform;
  durationMs: number;
  simulateFailure: boolean;
  onRunning: (running: boolean) => void;
}

/** 演示控制器管理一次任务；重置通过 key 卸载子组件及内部状态。 */
export function DemoPlayer({
  item,
  platform,
  durationMs,
  simulateFailure,
  onRunning,
}: PlayerProps) {
  const demoId = item.preview.kind === 'code' ? item.preview.demoId : undefined;
  const [status, setStatus] = useState<SimulationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [runFailure, setRunFailure] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [version, setVersion] = useState(0);
  const finish = useCallback(
    (failed: boolean) => setStatus(failed || runFailure ? 'error' : 'success'),
    [runFailure],
  );
  const failAt = runFailure
    ? demoId === 'ride'
      ? 0.45
      : demoId === 'stream'
        ? 0.6
        : demoId === 'upload'
          ? undefined
          : 0.75
    : undefined;
  useSimulation({ status, durationMs, failAt, onProgress: setProgress, onFinish: finish });
  useEffect(() => {
    onRunning(status === 'running');
    return () => onRunning(false);
  }, [status, onRunning]);
  const start = (retry = false) => {
    if (status === 'running') return;
    if (!retry && status === 'success' && demoId === 'upload') setVersion((value) => value + 1);
    setProgress(0);
    setRetrying(retry);
    setRunFailure(retry ? false : simulateFailure);
    setStatus('running');
  };
  const reset = () => {
    setStatus('idle');
    setProgress(0);
    setRetrying(false);
    setRunFailure(false);
    setVersion((value) => value + 1);
  };
  if (!demoId) return null;
  const Demo = demoRegistry[demoId];
  const mobile = ['miniapp', 'h5', 'app'].includes(platform);
  const internallyControlled = ['message', 'pagination', 'stream'].includes(demoId);
  const statusText =
    status === 'running'
      ? '任务进行中'
      : status === 'success'
        ? '任务已完成'
        : status === 'error'
          ? '模拟失败，请重试'
          : status === 'cancelled'
            ? '已取消，可重新开始'
            : '准备就绪，开始体验';
  return (
    <div className="demo-player" data-demo={demoId}>
      <div className="preview-workspace">
        <div
          className={`device ${mobile ? 'mobile-device' : 'desktop-device'} platform-${platform}`}
        >
          <div className="device-toolbar">
            {mobile ? (
              <>
                <b>9:41</b>
                <span className="device-status-icons" aria-hidden="true">
                  {platform === 'miniapp' ? (
                    <>
                      <Ellipsis size={17} />
                      <span className="capsule-divider" />
                      <Circle size={12} />
                    </>
                  ) : (
                    <>
                      <Signal size={13} />
                      <Wifi size={13} />
                      <BatteryFull size={17} />
                    </>
                  )}
                </span>
              </>
            ) : (
              <>
                <span className="window-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span>
                  {platform === 'desktop' ? '微妙 · 桌面应用' : 'weimiao.design / playground'}
                </span>
                <Icon name="spark" size={13} />
              </>
            )}
          </div>
          <div className="demo-surface">
            <Demo
              key={version}
              status={status}
              progress={progress}
              failed={runFailure}
              retrying={retrying}
              onStart={start}
              onCancel={() => setStatus('cancelled')}
            />
          </div>
          {mobile && <div className="home-indicator" />}
        </div>
        <span className="workspace-caption">INTERACTIVE PREVIEW · 本地模拟演示</span>
      </div>
      <div className="player-controls">
        <span className={`run-status ${status}`} role="status" aria-live="polite">
          <i />
          {statusText}
        </span>
        <div>
          {!internallyControlled && (
            <Button
              size="sm"
              disabled={status === 'running'}
              onClick={() => start(status === 'error')}
            >
              <Icon name="play" size={14} />
              {status === 'error'
                ? '重试演示'
                : status === 'success'
                  ? '再次体验'
                  : actionLabels[demoId]}
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            aria-label="重置演示"
            title="重置演示"
          >
            <Icon name="reset" size={17} />
          </Button>
        </div>
      </div>
    </div>
  );
}
