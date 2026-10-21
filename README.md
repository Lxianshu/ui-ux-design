# 微妙 · UI / UX 风格与交互提示词库

一个参考 [MotionSites](https://motionsites.org/zh) 浏览节奏的本地灵感画廊：**先看效果，再收藏案例、复制完整提示词**。使用 React + TypeScript + Vite，交互控件复用 shadcn/ui，图标使用 Lucide SVG；封面由本地 HTML / CSS / SVG 构成，不依赖参考站素材。

## 运行

需要 Node.js 22.18+（当前使用 22.19）。

```powershell
cd D:\code\ui-ux-design
npm install
npm run dev
```

打开终端的 Local 地址，默认 `http://127.0.0.1:5173/`；端口被占用时 Vite 会打印新的端口。

```powershell
npm test
npm run typecheck
npm run build
npm run preview
npm run export:prompts
```

## 案例与标签

案例是内容的基本单位，平台不再作为目录。一个案例可以同时拥有：

- 内容：UI / UX。
- 平台：PC、移动端、Web、桌面、小程序、H5、App。
- 交互效果：Loading、发送、上传、骨架屏、AI 对话等。
- 视觉风格：极简、自然、柔和、编辑式、留白等。

多选标签时**同组按 OR，跨组按 AND**；例如 `UX + App + 发送` 会找到乐观消息与 AI 流式回复。关键词也匹配标签。条件、排序、收藏视图和案例地址保存到 URL，兼容旧的 `category / platform / case` 链接。

收藏通过 `localStorage` 保存在当前浏览器，不需要账号，也不承诺跨设备同步。可在卡片或详情中收藏，再进入“我的收藏”浏览。卡片复制使用当前选中平台的默认参数；详情复制使用预览平台、时长和失败开关的实际配置。复制受限时展示可选中的完整正文。

## 当前内容

首批保留九个案例和五种平台适配，共 45 份默认提示词，所有案例均有可交互代码演示：

| 内容 | 案例                | 核心效果                     |
| ---- | ------------------- | ---------------------------- |
| UI   | Logo 开场，顺势入场 | Logo 放大淡出与首页衔接      |
| UI   | 轻量顶部进度条      | 保留原内容，完成信号驱动收尾 |
| UI   | 骨架扫光，内容接力  | 等尺寸占位、分块呈现         |
| UI   | 从朦胧到清晰        | 固定画幅、渐进清晰           |
| UX   | 照片逐张上传        | 独立进度、单张失败重试       |
| UX   | 消息先到，状态跟上  | 乐观上屏、送达确认           |
| UX   | 等待，也有方向      | 匹配、接驾、到达与取消       |
| UX   | 下一屏，提前准备    | 预取、滚动保留与分页收尾     |
| UX   | AI 回复，边想边说   | 思考气泡、流式追加、停止恢复 |

提示词包括风格、颜色、布局、交互、平台约束、异常路径、无障碍与验收标准。内容根据用户提供的摘要重新设计，不是原作者群内提示词。`docs/loading-prompts.txt` 由同一内容源导出。

## 效果展示与扩展

`CaseDefinition.preview` 显式支持两种类型：

```ts
// 代码演示，注册的组件按需挂载在详情中。
{ kind: 'code', demoId: 'upload' }

// 视频，媒体放入 public/previews/ 或使用你有权限的 HTTPS 媒体地址。
{
  kind: 'video',
  src: '/previews/example.webm',
  poster: '/previews/example.jpg',
  description: '描述视频展示的界面和关键交互',
  captions: '/previews/example.zh.vtt', // 可选字幕
}
```

视频使用原生控件，不自动播放。当前未虚构或添加示例视频文件，现有九个案例全部使用代码。新增视频案例应提供有效媒体、说明与对应完整提示词，并作为 `CaseDefinition` 记录加入 `cases` 集合；新增代码场景需在 `DemoId` 和演示注册表中实现实际组件。

内容的必备信息包括稳定 `id / slug`、UI / UX 类型、平台、效果标签、风格标签、`visualStyle`、使用场景、完整提示词和验收点。页面通过同一份内容生成标签与提示词，不为五个平台复制五份案例。

## 实现边界

- 上传、消息、车辆和 AI 请求均为本地模拟，不连接实际业务后端。
- Web / H5 是浏览器组件；桌面、小程序、App 是浏览器中的场景模拟，原生工程需按对应提示词另外实现。
- 真实进度和完成状态必须由请求或平台事件驱动，不能使用模拟计时器伪装生产服务。
- 静态封面用于快速浏览，点击“查看效果”后体验实际组件；封面悬停只提供少量视觉反馈。
- 兼顾键盘、可见焦点、减少动态效果与移动端布局。

## 代码结构

```text
src/app/App.tsx          作品画廊、搜索、标签、URL 与本地收藏
src/app/CaseDetail.tsx   代码/视频预览、参数与完整提示词
src/cases/types.ts      内容、媒体与平台类型
src/cases/index.ts      九个案例、风格规范和提示词生成
src/cases/library.ts    标签规范化、组合筛选、URL 与收藏解析
src/cases/*.test.ts     内容边界、状态、标签、链接与收藏测试
src/components/         演示、封面与本地图形
src/components/ui/      shadcn/ui 官方组件源码
src/styles/gallery.css  作品画廊、封面和详情布局
src/styles/demos.css    九个演示的场景和动效样式
```

官方组件来自 shadcn/ui 的 new-york 静态注册表，保留了导入路径与 Tailwind 4 兼容适配；配置见 `components.json`，许可见 `docs/shadcn-LICENSE.md`。添加组件可使用 `npx shadcn@latest add <组件名>`。开发规范见根目录 `AGENTS.md`。
