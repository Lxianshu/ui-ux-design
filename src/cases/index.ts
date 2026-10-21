import type { CaseDefinition, DemoId, Platform, PromptOptions, SimulationStatus } from './types.ts';

export const platforms: { id: Platform; label: string; group: 'PC' | '移动端'; note: string }[] = [
  { id: 'web', label: 'Web', group: 'PC', note: '浏览器组件 · React + TypeScript + CSS' },
  {
    id: 'desktop',
    label: '桌面',
    group: 'PC',
    note: '桌面窗口模拟 · React 渲染层；宿主能力需单独接入',
  },
  {
    id: 'miniapp',
    label: '小程序',
    group: '移动端',
    note: '小程序界面模拟 · 原生实现参考 WXML / WXSS / TypeScript',
  },
  { id: 'h5', label: 'H5', group: '移动端', note: '移动浏览器组件 · React + TypeScript + CSS' },
  {
    id: 'app',
    label: 'App',
    group: '移动端',
    note: 'App 界面模拟 · 原生实现提示词采用 React Native',
  },
];

const platformIds = platforms.map(({ id }) => id);
const accessibility =
  '所有按钮支持键盘操作并有可见焦点；异步状态使用简短文字播报，不能只依赖颜色；遵循系统减少动态效果设置，移除非必要位移与循环动画，保留状态反馈。';

const caseSeeds: (Omit<CaseDefinition, 'preview' | 'effects' | 'styleTags' | 'visualStyle'> & {
  demoId: DemoId;
})[] = [
  {
    id: 'launch',
    slug: 'logo-reveal',
    demoId: 'launch',
    category: 'ui',
    title: 'Logo 开场，顺势入场',
    englishTitle: 'Logo reveal',
    summary: '让品牌标识变成入口，告别启动页到首页的生硬切换。',
    oneLiner: '让 Logo 放大淡出，首页像幕布打开一样从下方浮现，等待和进入保持连贯。',
    tags: ['品牌过渡', '启动页', '动效'],
    principle: '用空间连续性连接两个状态',
    scenario: '内容型应用从启动页进入首页；仅在应用内展示过渡，不模拟或替换操作系统启动屏。',
    platforms: platformIds,
    parameters: { durationMs: 2400 },
    states: ['待启动', '准备内容', 'Logo 放大淡出', '首页浮现', '准备失败 → 重试'],
    prompt:
      '设计一段应用内启动过渡。初始为深森林色 #222b20 背景与青柠色 #d0ff6c 方形品牌 Logo，旁边有“正在准备你的灵感”状态文字。点击“进入首页”后保留启动画面至内容准备结束；结束前最后 30% 的时间里，将 Logo 从 1 倍放大到 12 倍并逐渐淡出，首页从下方 24px 淡入，使用 cubic-bezier(.22,1,.36,1)。首页包含“今天，也有新灵感”、三张色彩卡和一条内容摘要。整个过程中内容容器尺寸固定，过渡层不阻止完成后的操作。失败时保留品牌与错误说明，提供重试，不进入空首页。减少动态效果模式使用直接切换和状态文字。',
    implementationNotes:
      '启动动画不会提升首屏数据速度。真实项目要先完成必要初始化，再推进到首页；不要人为延迟可用内容。',
    acceptanceCriteria: [
      '启动后能到达首页，重播可回到启动页',
      '模拟失败停留在错误状态并能重试',
      '减少动态效果时仍能进入首页',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'progress',
    slug: 'top-progress',
    demoId: 'progress',
    category: 'ui',
    title: '轻量顶部进度条',
    englishTitle: 'Top progress',
    summary: '原页面保持可见，用一条细线交代导航正在发生。',
    oneLiner: '页面不动，顶部 3px 进度条先快后慢推进，请求完成才冲到终点并淡出。',
    tags: ['页面导航', '进度反馈', '动效'],
    principle: '轻反馈，不打断当前上下文',
    scenario: '切换内容页或刷新已有数据，不适合阻塞性或破坏性操作。',
    platforms: platformIds,
    parameters: { durationMs: 3000 },
    states: ['原页面', '请求中 ≤ 90%', '完成 100%', '淡出', '失败 → 重试'],
    prompt:
      '实现一个页面顶部 3px 的绿色导航进度条。点击“刷新内容”保留现有文章、标题和卡片；进度条按先快后慢的曲线从 0 推进，未收到完成信号前最多到 90%。请求成功后到 100%，停留 250ms 后用 200ms 淡出，文字更新为“内容已更新”。这是不确定进度指示，不展示假百分比。失败时进度条停下并改用文字“刷新失败，原内容仍可查看”，提供重试。运行时禁用重复刷新，组件销毁时清理所有资源；采用 transform: scaleX 且原点在左侧。减少动态效果时显示静态加载线与状态文字。',
    implementationNotes:
      '这是模拟导航指示，不是真实下载百分比。实际项目由路由或请求完成事件驱动收尾。',
    acceptanceCriteria: [
      '请求未完成时进度不超过 90%',
      '成功后完成并淡出，原页面始终可见',
      '失败后可重试且保留原内容',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'skeleton',
    slug: 'skeleton-reveal',
    demoId: 'skeleton',
    category: 'ui',
    title: '骨架扫光，内容接力',
    englishTitle: 'Skeleton reveal',
    summary: '先把内容的位置留好，数据到达后再逐块揭晓。',
    oneLiner: '用与内容同尺寸的骨架占位，轻柔扫光，完成后按块错开 90ms 浮现。',
    tags: ['骨架屏', '内容加载', '渐进呈现'],
    principle: '先交代结构，再填充内容',
    scenario: '文章和卡片列表首次加载，已知内容结构但数据尚未返回。',
    platforms: platformIds,
    parameters: { durationMs: 2600 },
    states: ['示例内容', '骨架扫光', '数据就绪', '逐块浮现', '加载失败 → 重试'],
    prompt:
      '实现一个三行灵感文章列表的加载效果。每行使用固定尺寸的封面、两行标题占位和一行辅助信息，骨架结构与最终内容完全一致。点击“加载内容”后先显示低对比度灰色骨架，以 1.5s 周期从左向右扫光；数据到达时停止扫光，三行以 90ms 间隔从下方 8px 淡入，每行过渡 320ms。内容为“让空间保持呼吸”“把日常装进设计”“收集微小的美好”。失败时停止循环动画并展示可重试的错误状态，不能让骨架无限播放。减少动态效果时骨架静止、内容直接替换。',
    implementationNotes:
      '占位尺寸要按真实内容布局预留。真实数据未就绪时不能为结束动画而展示虚构内容。',
    acceptanceCriteria: [
      '骨架与内容高度一致',
      '成功时三行有顺序地出现',
      '失败时停止扫光并出现重试入口',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'image',
    slug: 'blur-to-sharp',
    demoId: 'image',
    category: 'ui',
    title: '从朦胧到清晰',
    englishTitle: 'Blur to sharp',
    summary: '同色占位先抵达，让画面像相机对焦一样出现。',
    oneLiner: '预留 16:10 图片比例，先显示同色模糊图，资源解码后用 700ms 过渡到清晰。',
    tags: ['图片占位', '渐进呈现', '布局稳定'],
    principle: '加载细节，不移动布局',
    scenario: '图片密集型内容、作品集或图片详情首屏。演示使用本地矢量景观模拟低清与清晰资源。',
    platforms: platformIds,
    parameters: { durationMs: 2800 },
    states: ['低清占位', '模拟资源准备', '解码就绪', '清晰呈现', '图片失败 → 重试'],
    prompt:
      '制作一张固定 16:10 比例的山野景观卡片。默认先显示与最终画面一致的模糊低清占位，点击“加载清晰图”模拟准备资源。只有完成信号到达后，才在 700ms 内将模糊程度从 22px 降至 0 并淡入清晰层，不改变容器尺寸，图下标题始终可见。示例用本地 SVG 景观表示两层资源，不依赖外部图片地址。失败时保留占位、停止等待，并显示文字和重试按钮。真实接入时应等待图片 load / decode 成功后切换，支持懒加载并提供替代文本。减少动态效果时直接切换清晰画面。',
    implementationNotes:
      '本例不下载远程照片。生产环境应生成低清占位，并等待真实图片加载和解码；样式滤镜不能替代资源优化。',
    acceptanceCriteria: [
      '加载前后容器尺寸不变',
      '完成信号之前保留模糊占位',
      '失败后保留占位并能重试',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'upload',
    slug: 'photo-upload',
    demoId: 'upload',
    category: 'ux',
    title: '照片逐张上传',
    englishTitle: 'Independent uploads',
    summary: '三张照片各走各的进度，全部就绪后才允许发布。',
    oneLiner: '三张照片独立上传，从灰暗到明亮，每张完成显示对勾，失败只重试该张。',
    tags: ['上传', '进度反馈', '失败恢复'],
    principle: '每个任务都有独立、可信的反馈',
    scenario: '用户发布包含多张图片的动态。本地示例不读取或上传真实文件。',
    platforms: platformIds,
    parameters: { durationMs: 3600 },
    states: ['待上传', '三张独立进度', '单张成功', '单张失败 → 单独重试', '全部完成 → 发布'],
    prompt:
      '实现一个三张照片的发布流程，使用三幅本地风景示例图。点击“开始上传”后同时启动三个独立模拟任务，各自用总时长的 65%、82%、100% 完成。上传进度从下向上揭开明亮图层，未完成部分保持灰暗；每张独立显示百分比、完成后显示对勾。模拟失败只让第二张在 55% 停止并出现“重试这张”，保留其余成功项；重试从该张重新开始且不能创建重复任务。只有全部三张成功后启用“发布动态”，点击后显示发布成功。重置可取消当前任务并回到待上传。真实项目应使用上传进度事件，不使用计时器伪装字节进度。',
    implementationNotes:
      '浏览器演示以时间模拟各任务进度；真实上传需使用平台支持的上传进度 API、服务端校验及失败重试策略。',
    acceptanceCriteria: [
      '三张进度独立变化',
      '第二张失败时其他成功项不被清空',
      '重试后全部成功才允许发布，发布后有确认',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'message',
    slug: 'optimistic-message',
    demoId: 'message',
    category: 'ux',
    title: '消息先到，状态跟上',
    englishTitle: 'Optimistic message',
    summary: '发送即上屏，把“等服务器”变成可理解的状态。',
    oneLiner: '发送后立刻插入消息并标记发送中，确认后显示双勾，失败保留内容并可重试。',
    tags: ['乐观更新', '即时反馈', '失败恢复'],
    principle: '立即回应操作，诚实交代结果',
    scenario: '即时聊天或评论发送；不适合支付等需要强一致确认的操作。',
    platforms: platformIds,
    parameters: { durationMs: 2400 },
    states: ['输入消息', '立即上屏 / 发送中', '服务器确认 / 双勾', '失败保留 / 重试'],
    prompt:
      '实现聊天中的乐观发送。提供输入框和“发送消息”按钮，拒绝空白内容，最多 120 字。点击后立即把文本插入右侧绿色气泡，清空输入，显示“发送中”；模拟确认后同一条消息显示双勾与“已送达”，不能重复插入。双勾仅代表送达，不虚构已读。模拟失败后保留原消息并标记“发送失败”，允许针对同一消息重试；不要求用户重新输入。演示限制同一时间一个待确认任务，重复点击不能重复发送。生产环境为每条消息生成稳定客户端 ID，服务端按幂等键去重，重试沿用原 ID。状态变化可被辅助技术理解，焦点留在输入区域。',
    implementationNotes:
      '乐观更新缩短感知等待，不代表发送成功。真实系统需要幂等键、网络确认、超时与断线重连策略。',
    acceptanceCriteria: [
      '点击后无需等待即可看到原文本',
      '失败不丢失消息，重试不新增重复气泡',
      '成功显示送达，空白文本不可发送',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'ride',
    slug: 'ride-matching',
    demoId: 'ride',
    category: 'ux',
    title: '等待，也有方向',
    englishTitle: 'Ride matching',
    summary: '从寻找司机到车辆到达，让等待有阶段、有出口。',
    oneLiner: '定位点扩散波纹寻找司机，匹配后停止波纹，让车辆沿路线接近，并可随时取消。',
    tags: ['分阶段反馈', '地图', '取消操作'],
    principle: '告知当前阶段和下一步',
    scenario: '叫车匹配过程，使用抽象本地地图，不调用真实定位或派单服务。',
    platforms: platformIds,
    parameters: { durationMs: 4800 },
    states: ['准备叫车', '匹配司机', '司机已接单', '车辆驶近', '已到达 / 无人接单 / 取消'],
    prompt:
      '设计一个模拟叫车等待界面，显示抽象街区地图、当前位置和目的地。点击“开始叫车”后前 45% 时间以当前位置为中心扩散低对比度波纹，显示“正在寻找附近司机”。匹配成功后停止波纹，显示“林师傅已接单 · 演示车辆”，车辆标识沿预设折线路线逐步靠近当前位置，到达后明确提示“车辆已到达”。整个等待过程提供“取消叫车”；取消立即停止动画并说明“已取消，可重新叫车”。模拟失败在匹配阶段结束时显示“暂时没有司机接单”，提供重试。不得虚构实际距离或预计时间，不调用定位和真实派单。减少动态效果时以文字阶段代替波纹与移动。',
    implementationNotes:
      '车辆路线和匹配结果均为本地模拟。真实业务必须由司机位置与派单事件更新，不能用动画伪造服务进展。',
    acceptanceCriteria: [
      '匹配与接驾有不同文字和效果',
      '匹配中或接驾中都可取消',
      '无人接单时提供重新叫车，取消后无残留任务',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'pagination',
    slug: 'infinite-feed',
    demoId: 'pagination',
    category: 'ux',
    title: '下一屏，提前准备',
    englishTitle: 'Seamless pagination',
    summary: '接近底部就预加载，让内容接上，滚动位置不跳。',
    oneLiner: '距离列表底部 120px 时预取下一页，保留原内容和滚动位置，失败可重试，到底明确收尾。',
    tags: ['预加载', '长列表', '失败恢复'],
    principle: '提前准备，保留阅读位置',
    scenario: '具有明确分页边界的内容流；示例每页 4 条，共 3 页，在独立滚动容器中演示。',
    platforms: platformIds,
    parameters: { durationMs: 2200 },
    states: ['首批内容', '接近底部', '预取中', '新内容追加', '失败 → 重试 / 没有更多'],
    prompt:
      '实现独立滚动容器中的三页灵感列表，每页四条卡片。首屏有四条内容，距离底部 120px 时触发下一页预加载；同时保留“加载下一页”按钮作为可访问替代入口。请求期间保留旧列表和当前 scrollTop，用底部状态提示加载，不锁滚动。成功后将四条新内容以 70ms 间隔淡入追加，不能替换整个列表；加载状态必须阻止并发重复请求，按稳定 ID 去重。模拟失败保留已有条目并显示“加载失败，重试下一页”。最后一页明确显示“你已看完全部灵感”，此后不再请求。重置回到第一页。真实项目还应提供分页链接或足够可达的页尾，不能无限阻挡页脚。',
    implementationNotes:
      '示例使用滚动距离判断，真实项目可使用观察哨兵或平台触底事件；服务端仍需分页、稳定排序和去重。',
    acceptanceCriteria: [
      '接近底部会触发且无并发重复加载',
      '追加后旧内容和滚动位置保留',
      '失败可重试且第三页后停止加载',
    ],
    accessibilityNotes: accessibility,
  },
  {
    id: 'stream',
    slug: 'ai-streaming',
    demoId: 'stream',
    category: 'ux',
    title: 'AI 回复，边想边说',
    englishTitle: 'Streaming response',
    summary: '气泡立即出现，思考、生成、完成各有明确反馈。',
    oneLiner: '发送后立即显示思考气泡，首段到达后按语义块追加，支持停止、失败恢复和重新生成。',
    tags: ['AI 对话', '流式响应', '取消操作'],
    principle: '区分等待首段与持续生成',
    scenario: 'AI 对话或生成式助手。演示用本地中文语义块模拟网络流，不是真实模型请求。',
    platforms: platformIds,
    parameters: { durationMs: 4200 },
    states: ['待提问', '思考气泡', '语义块追加', '完成', '停止 / 中断 → 重新生成'],
    prompt:
      '实现一个 AI 助手对话演示。点击“发送问题”立即插入问题“如何让等待更友好？”与助手气泡，前 20% 时间用三个呼吸圆点和“正在思考”提示等待首段；此后将回答按六个中文语义块逐次追加，而非伪装成逐字打字机。回答依次为“先让界面立即回应。”“用占位说明内容结构，”“用进度说明任务阶段。”“允许取消与失败重试，”“并保留已经产生的内容。”“等待应该有反馈，也应该有出口。”生成中允许停止，停止或中断均保留已有文本，提供重新生成并替换同一回答。模拟失败在第 3 块后中断。不要每次追加都强制滚动；读屏只播报开始、完成和中断状态。真实项目消费 SSE 或平台流 API，并使用取消信号中止请求。',
    implementationNotes:
      '真实流式体验依赖服务端首段延迟、流式协议和客户端解析。给完整回复补打字动画不能改善首次反馈时间。',
    acceptanceCriteria: [
      '点击后立即看到助手气泡',
      '思考后按六个语义块追加',
      '停止或失败保留已有内容，重新生成不新增重复回答',
    ],
    accessibilityNotes: accessibility,
  },
];

/** 案例只有一份内容；平台、效果与风格通过标签组合表达。 */
const presentation: Record<DemoId, { effects: string[]; styleTags: string[] }> = {
  launch: { effects: ['Loading', '启动过渡'], styleTags: ['极简', '品牌感'] },
  progress: { effects: ['Loading', '进度反馈'], styleTags: ['极简', '浅色'] },
  skeleton: { effects: ['Loading', '骨架屏'], styleTags: ['编辑式', '浅色'] },
  image: { effects: ['Loading', '图片渐进'], styleTags: ['自然', '留白'] },
  upload: { effects: ['上传', '进度反馈'], styleTags: ['自然', '浅色'] },
  message: { effects: ['发送', '即时反馈'], styleTags: ['柔和', '圆角'] },
  ride: { effects: ['Loading', '地图', '分阶段反馈'], styleTags: ['自然', '浅色'] },
  pagination: { effects: ['Loading', '滚动加载'], styleTags: ['编辑式', '留白'] },
  stream: { effects: ['发送', 'Loading', 'AI 对话', '流式响应'], styleTags: ['柔和', '极简'] },
};
const visualStyles: Record<DemoId, string> = {
  launch:
    '启动层使用深森林色 #222b20，方形 Logo 使用青柠色 #d0ff6c 与真实 Layers SVG；首页使用浅色背景。Logo 圆角 16px，避免文字字符充当图标。',
  progress:
    '原内容使用奶油白 #fffef5、深灰绿正文和低饱和色块；顶部 3px 导航线使用 #658b60。信息层级克制，保持阅读区域稳定。',
  skeleton:
    '采用编辑式纸张布局，底色 #f0eae0、石灰色占位与深色标题；图片和文字占位的尺寸与最终内容严格对齐。',
  image:
    '使用青绿山野插画与低对比度的自然色，固定画幅，不用纯白占位；让模糊到清晰的过渡成为视觉中心。',
  upload:
    '采用暖纸色 #faf3e8，三张示例照片等宽排列；进度状态叠在照片下沿，成功用真实 SVG 对勾，失败用真实警告图标。',
  message:
    '采用柔和浅粉色 #fcf5f7 和圆角气泡，接收气泡中性浅色、发送气泡深绿色；发送中用 Clock、送达用 CheckCheck、失败用 CircleAlert SVG 图标。',
  ride: '使用浅绿色抽象街区与虚线路线；Car SVG 车辆与路线共享坐标系。司机状态清楚分层，地图不替代文字反馈。',
  pagination:
    '采用编辑式留白、暖白 #f6f5f0 与小幅配图；条目层级稳定，下一页沿原列表接续，不改变已读内容尺寸。',
  stream:
    '采用柔和灰蓝 #f3f6f5、极简对话布局与真实 Sparkles SVG 标记；思考圆点低对比度，正文按语义块自然追加。',
};
export const cases: CaseDefinition[] = caseSeeds.map(({ demoId, ...item }) => ({
  ...item,
  ...presentation[demoId],
  visualStyle: visualStyles[demoId],
  preview: { kind: 'code', demoId },
}));

const platformInstructions: Record<Platform, string> = {
  web: '目标端：PC / Web。使用 React + TypeScript + CSS，语义化 DOM；桌面内容最大宽度 1200px，兼容 375px 以上布局。用浏览器请求或事件驱动真实状态，演示不得依赖后台服务。',
  desktop:
    '目标端：PC / 桌面应用。使用 React + TypeScript 实现 Tauri 或 Electron 的渲染层，支持窗口缩放、键盘操作与系统减少动态效果。动画限制在内容区，不覆盖原生标题栏。本例不需要 Node 权限或宿主桥；真实文件与窗口操作通过最小权限的宿主 API 接入。',
  miniapp:
    '目标端：移动端 / 微信小程序。生产实现使用 WXML、WXSS 与 TypeScript，以 view、text、button、scroll-view 等原生组件代替 DOM，兼容安全区和原生导航栏；用平台请求、上传进度或触底事件接入数据，生命周期清理任务。仅在目标基础库支持时使用动画与流式能力，缺少能力则提供文字反馈与普通请求降级。本页效果是浏览器模拟，不能直接粘贴 React 代码到小程序。',
  h5: '目标端：移动端 / H5。使用 React + TypeScript + CSS，采用移动优先布局、触摸目标至少 44px、输入字号至少 16px，适配安全区、软键盘与 375px 视口，不依赖 hover。监听真实资源与请求结果；页面隐藏时暂停非必要视觉动画。',
  app: '目标端：移动端 / App。生产实现使用 React Native + TypeScript，采用 View、Text、Pressable、FlatList 和平台可用的动画能力，避免直接使用 DOM、CSS filter、clip-path 或浏览器 SVG。模糊和揭示效果采用平台组件或渐变透明度降级；适配 iOS / Android 安全区、键盘与系统减少动态效果。使用原生网络与资源回调驱动状态。本页为浏览器模拟，不代表原生工程已构建。',
};

/** 由演示的当前配置生成独立、完整的目标端提示词。 */
export function buildPrompt(item: CaseDefinition, options: PromptOptions): string {
  return [
    `目标：${item.title}。${item.oneLiner}`,
    `使用场景：${item.scenario}`,
    `风格方向：${item.styleTags.join('、')}。${item.visualStyle} 使用清晰层次、充足留白与统一间距；图标使用真实 SVG 组件，不用文字或 Emoji 代替。`,
    `结构与交互：${item.prompt}`,
    `当前演示参数：一次模拟任务总时长 ${options.durationMs}ms；${options.simulateFailure ? '开启模拟失败，按上述失败路径展示，再允许重试。' : '默认成功，同时保留可切换的失败演示。'}时间仅用于本地模拟；生产环境不能用定时器假装真实完成。`,
    platformInstructions[options.platform],
    `无障碍：${item.accessibilityNotes}`,
    `实现边界：${item.implementationNotes}`,
    `验收标准：\n${item.acceptanceCriteria.map((criterion, index) => `${index + 1}. ${criterion}`).join('\n')}`,
  ].join('\n\n');
}

/** 不确定任务的视觉进度只能在收到完成状态后到达终点。 */
export function navigationProgress(progress: number, status: SimulationStatus): number {
  if (status === 'success') return 1;
  return Math.min(0.9, 1 - Math.exp(-3 * Math.max(0, progress)));
}

/** 三个上传任务使用独立速度；只有第二张受失败演示影响。 */
export function photoProgress(progress: number, index: number, failed: boolean): number {
  const value = Math.min(1, Math.max(0, progress) / [0.65, 0.82, 1][index]);
  return failed && index === 1 ? Math.min(0.55, value) : value;
}

export const responseChunks = [
  '先让界面立即回应。',
  '用占位说明内容结构，',
  '用进度说明任务阶段。',
  '允许取消与失败重试，',
  '并保留已经产生的内容。',
  '等待应该有反馈，也应该有出口。',
];

/** 用语义块模拟首段等待与逐段输出，失败时保留前三块。 */
export function streamCount(progress: number, failed: boolean): number {
  const count = progress < 0.2 ? 0 : Math.min(6, 1 + Math.floor(((progress - 0.2) / 0.8) * 6));
  return failed ? Math.min(3, count) : count;
}
