import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  Car,
  Layers2,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  UserRound,
  Film,
} from 'lucide-react';
import type { CaseDefinition } from '../cases/types';
import { Landscape } from './Landscape';

/** 以实际案例的组成元素制作轻量封面，交互本体在详情页按需挂载。 */
export function CaseArtwork({ item }: { item: CaseDefinition }) {
  if (item.preview.kind === 'video') {
    return (
      <div className="cover-scene video-cover" aria-hidden="true">
        {item.preview.poster ? (
          <img src={item.preview.poster} alt="" loading="lazy" />
        ) : (
          <Film size={38} />
        )}
      </div>
    );
  }
  const id = item.preview.kind === 'code' ? item.preview.demoId : 'image';
  return (
    <div className={`cover-scene scene-${id}`} aria-hidden="true">
      {id === 'launch' && (
        <>
          <div className="cover-wordmark">
            <Layers2 size={15} /> FORMA
          </div>
          <div className="launch-orbit" />
          <div className="cover-launch-logo">
            <Layers2 size={43} />
          </div>
          <div className="launch-cover-copy">
            <span>A new beginning.</span>
            <strong>
              Every detail.
              <br />A better feeling.
            </strong>
            <p>好的开始，值得被设计。</p>
          </div>
          <ArrowUpRight className="cover-corner" size={22} />
        </>
      )}
      {id === 'progress' && (
        <>
          <div className="cover-section-label">QUIETLY IN THE BACKGROUND</div>
          <div className="cover-browser">
            <div className="cover-browser-bar">
              <span />
              <span />
              <span />
              <small>studio / journal</small>
            </div>
            <div className="cover-loading-line" />
            <div className="cover-article">
              <small>DESIGN JOURNAL / 001</small>
              <h4>
                Less waiting.
                <br />
                More living.
              </h4>
              <div className="cover-color-tiles">
                <i />
                <i />
                <i />
              </div>
              <p>让每一步，都有迹可循。</p>
            </div>
          </div>
          <div className="cover-footnote">
            <span>THE 3PX DETAIL</span>
            <ArrowRight size={17} />
          </div>
        </>
      )}
      {id === 'skeleton' && (
        <>
          <div className="cover-editorial-head">
            The Daily<span>DESIGN & EVERYDAY</span>
          </div>
          <div className="cover-skeleton-title">
            Good things
            <br />
            <em>take shape.</em>
          </div>
          {[0, 1, 2].map((i) => (
            <div className={`cover-skeleton-row skeleton-${i}`} key={i}>
              <i />
              <span>
                <b />
                <small />
              </span>
              <ArrowUpRight size={14} />
            </div>
          ))}
          <p className="cover-paper-caption">先有轮廓，灵感随后到达。</p>
        </>
      )}
      {id === 'image' && (
        <>
          <Landscape />
          <div className="cover-image-soft" />
          <div className="cover-image-heading">
            <span>SOMEWHERE SLOW</span>
            <h4>
              去山野，
              <br />
              找一点留白。
            </h4>
          </div>
          <div className="cover-focus-label">
            <span>BLUR</span>
            <ArrowRight size={15} />
            <span>SHARP</span>
          </div>
        </>
      )}
      {id === 'upload' && (
        <>
          <div className="cover-section-label">MOMENTS, READY TO SHARE</div>
          <h4 className="cover-upload-heading">留住这一刻。</h4>
          <div className="cover-photo-stack">
            {[0, 1, 2].map((i) => (
              <div className={`cover-photo photo-${i}`} key={i}>
                <Landscape variant={i} />
                <span>{i === 0 ? <Check size={14} /> : `${i === 1 ? 68 : 32}%`}</span>
              </div>
            ))}
          </div>
          <div className="cover-upload-footer">
            <span>3 photos / one good day</span>
            <span className="cover-publish">
              分享
              <ArrowUpRight size={12} />
            </span>
          </div>
        </>
      )}
      {id === 'message' && (
        <>
          <div className="cover-chat-app">
            <header>
              <span className="cover-user">
                <UserRound size={15} />
              </span>
              <div>
                <strong>林间设计室</strong>
                <small>ONLINE NOW</small>
              </div>
              <MoreHorizontal size={16} />
            </header>
            <div className="cover-chat-body">
              <small>TODAY, 09:41</small>
              <p>周末，一起去收集灵感吧。</p>
              <p className="cover-chat-sent">
                收到，马上出发
                <CheckCheck size={12} />
              </p>
              <div className="cover-chat-note">
                <Sparkles size={12} /> 即时回应，不让灵感等待。
              </div>
            </div>
            <footer>
              <span>输入一条消息…</span>
              <Send size={16} />
            </footer>
          </div>
          <span className="cover-chat-caption">SEND FIRST. SYNC SECOND.</span>
        </>
      )}
      {id === 'ride' && (
        <>
          <div className="cover-map-grid" />
          <div className="cover-map-block map-a" />
          <div className="cover-map-block map-b" />
          <div className="cover-map-block map-c" />
          <svg className="cover-map-path" viewBox="0 0 300 280">
            <path d="M245 55H200V160H100V210" />
            <Car x="186" y="109" width="28" height="28" />
            <circle cx="100" cy="210" r="8" />
          </svg>
          <div className="cover-map-title">
            <span>ON YOUR WAY</span>
            <h4>等待，也有方向。</h4>
          </div>
          <div className="cover-driver-card">
            <span className="cover-user">
              <Car size={17} />
            </span>
            <span>
              <strong>司机正在靠近</strong>
              <small>每一个阶段，都有回应</small>
            </span>
            <ArrowRight size={18} />
          </div>
        </>
      )}
      {id === 'pagination' && (
        <>
          <div className="cover-feed-header">
            <span>Fieldnotes.</span>
            <Plus size={19} />
          </div>
          <h4 className="cover-feed-title">
            Keep the
            <br />
            <em>inspiration</em>
            <br />
            flowing.
          </h4>
          <div className="cover-feed-items">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Landscape variant={i} />
                <span>
                  <b>{['收集微小的美好', '把日常装进设计', '给生活一点新视角'][i]}</b>
                  <small>DESIGN NOTES · 0{i + 1}</small>
                </span>
                <ArrowUpRight size={13} />
              </div>
            ))}
          </div>
          <div className="cover-feed-more">
            <span />
            <span />
            <span />
          </div>
        </>
      )}
      {id === 'stream' && (
        <>
          <div className="cover-ai-orbit" />
          <div className="cover-ai-heading">
            <Sparkles size={19} />
            <span>THOUGHTFUL AI</span>
          </div>
          <div className="cover-ai-card">
            <span className="cover-ai-question">如何让等待更友好？</span>
            <div>
              <Sparkles size={18} />
              <p>
                先让界面立即回应。
                <br />
                好的体验，
                <br />
                <strong>从一点反馈开始。</strong>
                <i />
              </p>
            </div>
            <footer>思考有过程，回应有温度。</footer>
          </div>
          <span className="cover-ai-bottom">A CONVERSATION IN MOTION</span>
        </>
      )}
    </div>
  );
}
