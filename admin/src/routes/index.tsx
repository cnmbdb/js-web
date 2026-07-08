import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  SquarePen,
  UploadCloud,
  UsersRound,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: AdminDashboard })

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

const navItems = [
  { label: '概览', icon: LayoutDashboard, active: true },
  { label: '内容管理', icon: FileText },
  { label: '案例库', icon: FolderKanban },
  { label: '咨询线索', icon: MessageSquareText },
  { label: '合作申请', icon: UsersRound },
  { label: '媒体资产', icon: UploadCloud },
  { label: '系统设置', icon: Settings },
]

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

const kpis = [
  { label: 'queries', value: '42', note: '内容与线索缓存', tone: 'primary' },
  { label: 'routes', value: '7', note: '后台模块路由', tone: 'dark' },
  { label: 'mutations', value: '3', note: '待发布变更', tone: 'neutral' },
  { label: 'stale', value: '8', note: '需要复核状态', tone: 'primary' },
]

const shellPanels = [
  { label: 'Query', value: 'cache, observers, stale state', active: true },
  { label: 'Router', value: 'matches, loaders, params' },
  { label: 'Custom', value: 'leads, cases, product state' },
]

const caseItems = [
  { title: '智能工厂总览页', views: '2,846', progress: 86 },
  { title: '设备联网解决方案', views: '1,930', progress: 72 },
  { title: '质量追溯案例', views: '1,284', progress: 58 },
]

const updates = [
  { title: '更新首页主视觉文案', meta: '内容管理 · 12 分钟前' },
  { title: '新增工业数据看板案例', meta: '案例库 · 今天 10:28' },
  { title: '处理合作申请 3 条', meta: '合作申请 · 昨天' },
]

function getStatusClass(status: Lead['status']) {
  return status === '待跟进' || status === '方案中' ? 'status-primary' : 'status-neutral'
}

function AdminDashboard() {
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

  return (
    <main className="admin-shell">
      <aside className="sidebar" aria-label="后台导航">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>苏信智造后台</strong>
            <span>TanStack Dev</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button className={item.active ? 'nav-item active' : 'nav-item'} key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <span>开发环境模式</span>
          <strong>Router + Table</strong>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="page-path">Devtools / Admin Shell</p>
            <h1>后台运行态面板</h1>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <Search size={18} aria-hidden="true" />
              <input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder="搜索线索或案例"
              />
            </label>
            <button className="icon-button" aria-label="通知">
              <Bell size={18} />
            </button>
            <button className="primary-button">
              <Plus size={18} aria-hidden="true" />
              新建内容
            </button>
          </div>
        </header>

        <section className="devtools-deck" aria-label="TanStack Devtools 风格面板">
          <div className="deck-copy">
            <span>Unified devtools shell</span>
            <h2>One panel for the state your site is built on.</h2>
            <p>
              将线索、内容、案例、路由和发布状态放进一个开发环境检查面板，
              让后台在运行时可观察、可筛选、可调试。
            </p>
          </div>
          <div className="deck-window">
            <div className="window-bar">
              <span />
              <span />
              <span />
              <strong>TanStack Admin Devtools</strong>
            </div>
            <div className="window-body">
              <div className="plugin-tabs">
                {shellPanels.map((panel) => (
                  <button className={panel.active ? 'active' : ''} key={panel.label}>
                    {panel.label}
                  </button>
                ))}
              </div>
              <div className="plugin-content">
                {shellPanels.map((panel) => (
                  <div className="plugin-row" key={panel.label}>
                    <strong>{panel.label}</strong>
                    <span>{panel.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="kpi-grid" aria-label="运行态指标">
          {kpis.map((item) => (
            <article className={`metric metric-${item.tone}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <p>{item.note}</p>
            </article>
          ))}
        </section>

        <section className="content-grid">
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

          <aside className="right-rail">
            <article className="panel">
              <div className="panel-heading compact">
                <h2>案例表现</h2>
                <BarChart3 size={18} aria-hidden="true" />
              </div>
              <div className="case-list">
                {caseItems.map((item) => (
                  <div className="case-row" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.views} 浏览</span>
                    </div>
                    <div className="progress" aria-label={`${item.title} 表现`}>
                      <span style={{ width: `${item.progress}%` }} />
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
      </section>
    </main>
  )
}
