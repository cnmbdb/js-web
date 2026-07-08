import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Database,
  Eye,
  FileText,
  GalleryVerticalEnd,
  Handshake,
  Home,
  Image,
  KeyRound,
  LayoutDashboard,
  MessageSquareText,
  Palette,
  Play,
  Radio,
  Search,
  Settings,
  SquarePen,
  TerminalSquare,
  Ticket,
  Wrench,
  UsersRound,
} from 'lucide-react'

type AdminSection =
  | 'overview'
  | 'home'
  | 'business'
  | 'cases'
  | 'consult'
  | 'cooperation'
  | 'assets'
  | 'settings'

type Lead = {
  id: string
  company: string
  contact: string
  intent: string
  source: string
  owner: string
  status: '待跟进' | '已联系' | '方案中' | '已转化'
  updatedAt: string
}

type ModuleConfig = {
  id: AdminSection
  title: string
  description: string
  stats: Array<{ label: string; value: string; note: string }>
  items: Array<{ title: string; meta: string; state: string }>
}

const topNav: Array<{ label: string; section: AdminSection }> = [
  { label: '控制台', section: 'overview' },
  { label: '首页', section: 'home' },
  { label: '业务', section: 'business' },
  { label: '案例', section: 'cases' },
  { label: '咨询', section: 'consult' },
  { label: '合作', section: 'cooperation' },
]

const primaryNav = [
  { label: '概览', icon: LayoutDashboard, section: 'overview' },
  { label: '首页管理', icon: Home, section: 'home' },
  { label: '业务服务', icon: BriefcaseBusiness, section: 'business' },
  { label: '案例中心', icon: BookOpen, section: 'cases' },
  { label: '咨询线索', icon: MessageSquareText, section: 'consult' },
] satisfies Array<{ label: string; icon: typeof LayoutDashboard; section: AdminSection }>

const operationNav = [
  { label: '合作申请', icon: Handshake, section: 'cooperation' },
  { label: '媒体资产', icon: Image, section: 'assets' },
  { label: '前台预览', icon: Eye, section: 'overview' },
  { label: '系统设置', icon: Settings, section: 'settings' },
] satisfies Array<{ label: string; icon: typeof LayoutDashboard; section: AdminSection }>

const leads: Array<Lead> = [
  {
    id: 'L-1028',
    company: '华东智能装备有限公司',
    contact: '陈经理',
    intent: '数字化车间改造',
    source: '官网咨询',
    owner: '周彦',
    status: '待跟进',
    updatedAt: '09:42',
  },
  {
    id: 'L-1027',
    company: '宁波精密制造集团',
    contact: '王总',
    intent: '工业数据看板',
    source: '合作页面',
    owner: '林乔',
    status: '方案中',
    updatedAt: '昨天',
  },
  {
    id: 'L-1026',
    company: '苏州新材料科技',
    contact: '李工',
    intent: '产线设备联网',
    source: '案例详情',
    owner: '周彦',
    status: '已联系',
    updatedAt: '周一',
  },
  {
    id: 'L-1025',
    company: '南通自动化研究院',
    contact: '赵主任',
    intent: '联合解决方案',
    source: '合作申请',
    owner: '沈睿',
    status: '已转化',
    updatedAt: '07-06',
  },
  {
    id: 'L-1024',
    company: '上海能源设备厂',
    contact: '何经理',
    intent: '质量追溯系统',
    source: '首页入口',
    owner: '林乔',
    status: '待跟进',
    updatedAt: '07-05',
  },
]

const modules: Record<Exclude<AdminSection, 'overview'>, ModuleConfig> = {
  home: {
    id: 'home',
    title: '首页管理',
    description: '维护官网首页首屏、轮播、核心能力和页脚入口。',
    stats: [
      { label: '首屏模块', value: '4', note: '主视觉、能力、案例、咨询' },
      { label: '待发布', value: '2', note: '文案与图片更新' },
      { label: '页面状态', value: '正常', note: 'index.html 已连接' },
    ],
    items: [
      { title: '首页主视觉文案', meta: '标题、按钮、背景图', state: '待复核' },
      { title: '核心能力卡片', meta: '3 个能力卖点', state: '已发布' },
      { title: '底部联系入口', meta: '咨询与合作跳转', state: '已发布' },
    ],
  },
  business: {
    id: 'business',
    title: '业务服务',
    description: '管理业务页面的解决方案、服务模块和转化入口。',
    stats: [
      { label: '服务模块', value: '6', note: '覆盖数字化工厂全链路' },
      { label: '本周调整', value: '3', note: '新增能力说明' },
      { label: '入口点击', value: '1,284', note: '较上周 +12%' },
    ],
    items: [
      { title: '智能工厂解决方案', meta: 'business.html', state: '已发布' },
      { title: '设备联网服务', meta: '图文模块', state: '草稿' },
      { title: '工业数据看板', meta: '咨询 CTA', state: '待发布' },
    ],
  },
  cases: {
    id: 'cases',
    title: '案例中心',
    description: '维护案例列表、行业标签、案例图片和首页推荐权重。',
    stats: [
      { label: '已发布案例', value: '36', note: '8 个首页推荐' },
      { label: '素材完整度', value: '92%', note: '6 个案例待补图' },
      { label: '浏览量', value: '8,426', note: '近 30 天' },
    ],
    items: [
      { title: '智能工厂总览页', meta: '首页推荐 · 2,846 浏览', state: '推荐中' },
      { title: '质量追溯案例', meta: '制造行业 · 1,284 浏览', state: '已发布' },
      { title: '设备联网解决方案', meta: '能源设备 · 1,930 浏览', state: '已发布' },
    ],
  },
  consult: {
    id: 'consult',
    title: '咨询线索',
    description: '处理官网咨询表单、意向需求、跟进人和转化状态。',
    stats: [
      { label: '今日线索', value: '18', note: '+6 较昨日' },
      { label: '待跟进', value: '42', note: '12 条超 24 小时' },
      { label: '转化率', value: '21%', note: '近 30 天' },
    ],
    items: [
      { title: '华东智能装备有限公司', meta: '数字化车间改造', state: '待跟进' },
      { title: '宁波精密制造集团', meta: '工业数据看板', state: '方案中' },
      { title: '南通自动化研究院', meta: '联合解决方案', state: '已转化' },
    ],
  },
  cooperation: {
    id: 'cooperation',
    title: '合作申请',
    description: '管理合作伙伴申请、渠道信息、联合方案和回访记录。',
    stats: [
      { label: '新增申请', value: '7', note: '本周' },
      { label: '待评估', value: '5', note: '渠道与方案' },
      { label: '已签约', value: '12', note: '年度合作' },
    ],
    items: [
      { title: '长三角工业服务商', meta: '区域渠道合作', state: '待评估' },
      { title: '自动化集成伙伴', meta: '联合交付方案', state: '洽谈中' },
      { title: '高校研究团队', meta: '产学研合作', state: '已通过' },
    ],
  },
  assets: {
    id: 'assets',
    title: '媒体资产',
    description: '管理官网图片、案例图、参考素材和页面渲染资源。',
    stats: [
      { label: '图片资产', value: '28', note: 'assets 目录' },
      { label: '参考素材', value: '16', note: '微信图片素材' },
      { label: '待压缩', value: '4', note: '建议优化首屏' },
    ],
    items: [
      { title: 'logo-nav.png', meta: '导航品牌标识', state: '使用中' },
      { title: 'factory-aerial.png', meta: '首页/业务视觉', state: '使用中' },
      { title: 'case-*.png', meta: '案例中心图片组', state: '待整理' },
    ],
  },
  settings: {
    id: 'settings',
    title: '系统设置',
    description: '配置 GitHub Pages 发布、站点入口、后台权限和静态构建。',
    stats: [
      { label: '发布目标', value: '/admin/', note: 'GitHub Pages 静态入口' },
      { label: '开发模式', value: 'Start', note: '本机保留 TanStack Start' },
      { label: '生产模式', value: 'SPA', note: '纯静态构建' },
    ],
    items: [
      { title: 'GitHub Pages 发布', meta: '_site/admin/index.html', state: '已配置' },
      { title: 'Devtools Shell', meta: '仅开发环境挂载', state: '已启用' },
      { title: '路由策略', meta: '后台单页模块切换', state: '已配置' },
    ],
  },
}

const kpis = [
  { label: '首页模块', value: '5', note: '主站页面已纳入管理', tone: 'primary' },
  { label: '待跟进线索', value: '42', note: '来自 consult.html', tone: 'dark' },
  { label: '案例浏览', value: '8,426', note: '近 30 天展示数据', tone: 'neutral' },
]

const updates = [
  { title: '更新首页主视觉文案', meta: '首页管理 · 12 分钟前' },
  { title: '新增工业数据看板案例', meta: '案例中心 · 今天 10:28' },
  { title: '处理合作申请 3 条', meta: '合作申请 · 昨天' },
]

function getStatusClass(status: Lead['status'] | string) {
  return status === '待跟进' || status === '方案中' || status === '待发布' || status === '待评估'
    ? 'status-primary'
    : 'status-neutral'
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedAt', desc: false },
  ])
  const [leadView, setLeadView] = useState<'全部' | '待跟进' | '方案中'>('全部')

  const columns = useMemo<Array<ColumnDef<Lead>>>(
    () => [
      {
        accessorKey: 'company',
        header: '客户',
        cell: ({ row }) => (
          <div className="customer-cell">
            <strong>{row.original.company}</strong>
            <span>{row.original.id} · {row.original.contact}</span>
          </div>
        ),
      },
      {
        accessorKey: 'intent',
        header: '需求',
      },
      {
        accessorKey: 'source',
        header: '来源',
      },
      {
        accessorKey: 'owner',
        header: '负责人',
      },
      {
        accessorKey: 'status',
        header: '状态',
        cell: ({ getValue }) => (
          <span className={`status ${getStatusClass(getValue<Lead['status']>())}`}>
            {getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: '更新时间',
      },
    ],
    [],
  )

  const filteredLeads = useMemo(
    () => leads.filter((lead) => leadView === '全部' || lead.status === leadView),
    [leadView],
  )

  const table = useReactTable({
    data: filteredLeads,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const selectSection = (section: AdminSection) => {
    setActiveSection(section)
    setIsMobileMenuOpen(false)
  }

  return (
    <main className="admin-shell">
      <header className="global-topbar">
        <button
          aria-expanded={isMobileMenuOpen}
          aria-label="打开后台菜单"
          className="top-icon"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <GalleryVerticalEnd size={17} />
        </button>
        <nav className="global-nav" aria-label="主导航">
          {topNav.map((item) => (
            <button
              className={activeSection === item.section ? 'active' : ''}
              key={item.label}
              onClick={() => selectSection(item.section)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <label className="global-search">
          <Search size={17} aria-hidden="true" />
          <input
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder="搜索线索或案例"
            value={globalFilter}
          />
          <kbd>⌘ K</kbd>
        </label>
        <div className="global-actions">
          <Bell size={20} />
          <Palette size={20} />
          <span className="avatar">S</span>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <MobileMenu
          activeSection={activeSection}
          onClose={() => setIsMobileMenuOpen(false)}
          onSelect={selectSection}
        />
      ) : null}

      <aside className="sidebar" aria-label="后台导航">
        <p className="nav-group">内容运营</p>
        <SidebarNav
          activeSection={activeSection}
          items={primaryNav}
          onSelect={selectSection}
        />

        <p className="nav-group">运营工具</p>
        <SidebarNav
          activeSection={activeSection}
          items={operationNav}
          onSelect={selectSection}
        />

        <p className="nav-group">账户</p>
        <nav className="nav-list">
          {[
            { label: '工作台成员', icon: UsersRound },
            { label: '个人资料', icon: CircleUserRound },
            { label: '发布记录', icon: ClipboardList },
            { label: '系统维护', icon: Wrench },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button className="nav-item" key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <span>本机开发</span>
          <strong>TanStack Start</strong>
        </div>
      </aside>

      <section className="workspace">
        {activeSection === 'overview' ? (
          <OverviewPage
            onSelect={selectSection}
            table={table}
            leadView={leadView}
            setLeadView={setLeadView}
          />
        ) : (
          <ModulePage
            activeSection={activeSection}
            config={modules[activeSection]}
            onSelect={selectSection}
            table={table}
            leadView={leadView}
            setLeadView={setLeadView}
          />
        )}
      </section>
    </main>
  )
}

function MobileMenu({
  activeSection,
  onClose,
  onSelect,
}: {
  activeSection: AdminSection
  onClose: () => void
  onSelect: (section: AdminSection) => void
}) {
  return (
    <div className="mobile-menu-backdrop">
      <button aria-label="关闭菜单" className="mobile-menu-scrim" onClick={onClose} />
      <section className="mobile-menu-panel" aria-label="手机后台菜单">
        <div className="mobile-menu-heading">
          <span>苏信智造后台</span>
          <strong>{getSectionLabel(activeSection)}</strong>
        </div>

        <p className="nav-group">内容运营</p>
        <SidebarNav activeSection={activeSection} items={primaryNav} onSelect={onSelect} />

        <p className="nav-group">运营工具</p>
        <SidebarNav activeSection={activeSection} items={operationNav} onSelect={onSelect} />

        <p className="nav-group">快捷入口</p>
        <div className="mobile-shortcuts">
          {[
            { label: '首页', section: 'home' },
            { label: '案例', section: 'cases' },
            { label: '咨询', section: 'consult' },
            { label: '合作', section: 'cooperation' },
          ].map((item) => (
            <button key={item.label} onClick={() => onSelect(item.section as AdminSection)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

function SidebarNav({
  activeSection,
  items,
  onSelect,
}: {
  activeSection: AdminSection
  items: Array<{ label: string; icon: typeof LayoutDashboard; section: AdminSection }>
  onSelect: (section: AdminSection) => void
}) {
  return (
    <nav className="nav-list">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <button
            className={activeSection === item.section ? 'nav-item active' : 'nav-item'}
            key={item.label}
            onClick={() => onSelect(item.section)}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function OverviewPage({
  onSelect,
  table,
  leadView,
  setLeadView,
}: {
  onSelect: (section: AdminSection) => void
  table: ReturnType<typeof useReactTable<Lead>>
  leadView: '全部' | '待跟进' | '方案中'
  setLeadView: (view: '全部' | '待跟进' | '方案中') => void
}) {
  return (
    <>
      <h1>苏信智造后台</h1>

      <section className="devtools-deck" aria-label="项目后台概览">
        <div className="deck-copy">
          <span><ClipboardList size={16} /> 开始使用</span>
          <h2>管理官网内容、咨询线索和合作入口</h2>
          <p>这个后台对应当前 GitHub Pages 官网，覆盖首页、业务、案例、咨询、合作和素材。</p>
          <div className="deck-actions">
            <button className="ghost-button" onClick={() => onSelect('home')}>编辑首页</button>
            <button className="light-button" onClick={() => onSelect('cases')}>
              <BookOpen size={16} />
              发布案例
            </button>
          </div>
          <div className="setup-list">
            {[
              ['首页管理', '维护 index.html 首屏、能力模块和 CTA', Home],
              ['业务服务', '同步 business.html 解决方案内容', BriefcaseBusiness],
              ['咨询线索', '跟进 consult.html 收集的客户需求', MessageSquareText],
            ].map(([title, detail, Icon], index) => {
              const SetupIcon = Icon as typeof Home
              return (
                <button
                  className="setup-row"
                  key={title as string}
                  onClick={() => onSelect(['home', 'business', 'consult'][index] as AdminSection)}
                >
                  <span className="checkmark">✓</span>
                  <SetupIcon size={18} />
                  <div>
                    <strong>{index + 1}. {title as string}</strong>
                    <p>{detail as string}</p>
                  </div>
                  <span className="row-arrow">→</span>
                </button>
              )
            })}
          </div>
        </div>

        <aside className="recommend-panel">
          <span>推荐操作</span>
          <h2>保持官网就绪</h2>
          {[
            ['前台预览', '检查首页、业务、案例页面', Eye, 'overview'],
            ['案例库', '更新首页推荐案例和权重', BookOpen, 'cases'],
            ['咨询线索', '处理待跟进客户需求', MessageSquareText, 'consult'],
            ['媒体资产', '整理 assets 与参考素材', Image, 'assets'],
          ].map(([title, detail, Icon, section]) => {
            const RecIcon = Icon as typeof Eye
            return (
              <button
                className="recommend-row"
                key={title as string}
                onClick={() => onSelect(section as AdminSection)}
              >
                <RecIcon size={20} />
                <span>
                  <strong>{title as string}</strong>
                  <small>{detail as string}</small>
                </span>
              </button>
            )
          })}
        </aside>
      </section>

      <section className="usage-panel" aria-label="项目状态">
        <div className="usage-main">
          <div className="panel-heading plain">
            <div>
              <h2>项目状态</h2>
              <p>监控页面、线索和案例发布情况</p>
            </div>
            <button className="ghost-button">
              <Database size={16} />
              同步数据
            </button>
          </div>
          <div className="kpi-grid">
            {kpis.map((item) => (
              <article className={`metric metric-${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
                {item.label === '首页模块' ? (
                  <div className="mini-bars" aria-hidden="true">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <i key={index} style={{ height: `${28 + index * 2}px` }} />
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
        <aside className="balance-card">
          <span>GitHub Pages</span>
          <strong>/admin/</strong>
          <p>静态后台入口</p>
          <button onClick={() => onSelect('settings')}>
            查看发布配置
            <span>→</span>
          </button>
        </aside>
      </section>

      <DashboardBottom table={table} leadView={leadView} setLeadView={setLeadView} />
    </>
  )
}

function ModulePage({
  activeSection,
  config,
  onSelect,
  table,
  leadView,
  setLeadView,
}: {
  activeSection: Exclude<AdminSection, 'overview'>
  config: ModuleConfig
  onSelect: (section: AdminSection) => void
  table: ReturnType<typeof useReactTable<Lead>>
  leadView: '全部' | '待跟进' | '方案中'
  setLeadView: (view: '全部' | '待跟进' | '方案中') => void
}) {
  return (
    <>
      <section className="module-hero">
        <div>
          <span>{config.id}</span>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="module-actions">
          <button className="ghost-button" onClick={() => onSelect('overview')}>返回概览</button>
          <button className="light-button">
            <SquarePen size={16} />
            新建条目
          </button>
        </div>
      </section>

      <section className="module-grid" aria-label={`${config.title} 数据`}>
        {config.stats.map((stat) => (
          <article className="metric" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="module-layout">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <h2>{config.title}条目</h2>
              <p>保持与前台对应页面内容一致</p>
            </div>
            <button className="ghost-button">
              <TerminalSquare size={16} />
              预览配置
            </button>
          </div>
          <div className="module-list">
            {config.items.map((item) => (
              <div className="module-row" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className={`status ${getStatusClass(item.state)}`}>{item.state}</span>
              </div>
            ))}
          </div>
        </article>

        <aside className="panel module-inspector">
          <div className="panel-heading compact">
            <h2>页面映射</h2>
            <FileText size={18} aria-hidden="true" />
          </div>
          <div className="inspector-list">
            <div><span>前台文件</span><strong>{getFrontendFile(activeSection)}</strong></div>
            <div><span>发布入口</span><strong>/admin/</strong></div>
            <div><span>开发入口</span><strong>localhost:3000</strong></div>
            <div><span>构建模式</span><strong>Start dev + SPA pages</strong></div>
          </div>
        </aside>
      </section>

      {activeSection === 'consult' ? (
        <section className="single-table">
          <LeadTable table={table} leadView={leadView} setLeadView={setLeadView} />
        </section>
      ) : null}
    </>
  )
}

function DashboardBottom({
  table,
  leadView,
  setLeadView,
}: {
  table: ReturnType<typeof useReactTable<Lead>>
  leadView: '全部' | '待跟进' | '方案中'
  setLeadView: (view: '全部' | '待跟进' | '方案中') => void
}) {
  return (
    <section className="content-grid">
      <LeadTable table={table} leadView={leadView} setLeadView={setLeadView} />

      <aside className="right-rail">
        <article className="panel">
          <div className="panel-heading compact">
            <h2>案例表现</h2>
            <BarChart3 size={18} aria-hidden="true" />
          </div>
          <div className="case-list">
            {modules.cases.items.map((item, index) => (
              <div className="case-row" key={item.title}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{['2,846', '1,930', '1,284'][index]} 浏览</span>
                </div>
                <div className="progress" aria-label={`${item.title} 表现`}>
                  <span style={{ width: `${[86, 72, 58][index]}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading compact">
            <h2>最近更新</h2>
            <SquarePen size={18} aria-hidden="true" />
          </div>
          <div className="updates">
            {updates.map((item) => (
              <div className="update-item" key={item.title}>
                <span className="update-dot" />
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </aside>
    </section>
  )
}

function LeadTable({
  table,
  leadView,
  setLeadView,
}: {
  table: ReturnType<typeof useReactTable<Lead>>
  leadView: '全部' | '待跟进' | '方案中'
  setLeadView: (view: '全部' | '待跟进' | '方案中') => void
}) {
  return (
    <article className="panel leads-panel">
      <div className="panel-heading">
        <div>
          <h2>咨询线索</h2>
          <p>使用 TanStack Table 管理筛选、排序和渲染状态</p>
        </div>
        <div className="segmented" role="tablist" aria-label="线索筛选">
          {(['全部', '待跟进', '方案中'] as const).map((item) => (
            <button
              aria-selected={leadView === item}
              className={leadView === item ? 'selected' : ''}
              key={item}
              onClick={() => setLeadView(item)}
              role="tab"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    <button
                      className="column-sort"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ChevronDown
                        className={header.column.getIsSorted() ? 'sort-active' : ''}
                        size={14}
                        aria-hidden="true"
                      />
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function getFrontendFile(section: AdminSection) {
  const files: Record<AdminSection, string> = {
    overview: 'index.html',
    home: 'index.html',
    business: 'business.html',
    cases: 'cases.html',
    consult: 'consult.html',
    cooperation: 'cooperation.html',
    assets: 'assets/',
    settings: 'GitHub Pages',
  }

  return files[section]
}

function getSectionLabel(section: AdminSection) {
  if (section === 'overview') {
    return '概览'
  }

  return modules[section].title
}
