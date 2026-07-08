import { useEffect, useMemo, useState } from 'react'
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
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardList,
  Database,
  Eye,
  FileText,
  GalleryVerticalEnd,
  Handshake,
  Home,
  Image,
  LayoutDashboard,
  MessageSquareText,
  Palette,
  Search,
  Settings,
  SquarePen,
  UsersRound,
} from 'lucide-react'

type AdminSection =
  | 'overview'
  | 'navigation'
  | 'branding'
  | 'blocks'
  | 'footer'
  | 'pageHome'
  | 'pageAbout'
  | 'pageBusiness'
  | 'pageConsult'
  | 'pageCases'
  | 'pageNews'
  | 'pageCooperation'
  | 'pageGallery'

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

type EditableSection = Exclude<AdminSection, 'overview'>

type NavigationMenuItem = {
  id: string
  label: string
  href: string
  page: string
  visible: boolean
}

type FieldValue = string | boolean | Array<NavigationMenuItem>

type EditableField = {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'menu-list'
  defaultValue: FieldValue
  hint?: string
  options?: Array<{ label: string; value: string }>
}

type AdminFormState = Record<EditableSection, Record<string, FieldValue>>

const SITE_CONFIG_KEY = 'suxin-site-config'

const pageTargetOptions = [
  { label: '首页', value: 'index.html', page: 'home' },
  { label: '关于速芯', value: 'about.html', page: 'about' },
  { label: '核心业务', value: 'business.html', page: 'business' },
  { label: '应用场景', value: 'consult.html', page: 'consult' },
  { label: '项目案例', value: 'cases.html', page: 'cases' },
  { label: '资讯中心', value: 'news.html', page: 'news' },
  { label: '招商合作', value: 'cooperation.html', page: 'cooperation' },
  { label: '实景图库', value: 'gallery.html', page: 'gallery' },
]

const defaultNavigationItems: Array<NavigationMenuItem> = pageTargetOptions.map((item) => ({
  id: item.page,
  label: item.label,
  href: item.value,
  page: item.page,
  visible: true,
}))

const topNav: Array<{ label: string; section: AdminSection }> = [
  { label: '控制台', section: 'overview' },
  { label: '导航设置', section: 'navigation' },
  { label: '页面设置', section: 'pageHome' },
  { label: '页脚配置', section: 'footer' },
]

const primaryNav = [
  { label: '控制台概览', icon: LayoutDashboard, section: 'overview' },
  { label: '导航设置', icon: GalleryVerticalEnd, section: 'navigation' },
  { label: 'Logo / 标题 Logo', icon: Image, section: 'branding' },
  { label: '配置区块', icon: Settings, section: 'blocks' },
  { label: '页脚配置区块', icon: FileText, section: 'footer' },
] satisfies Array<{ label: string; icon: typeof LayoutDashboard; section: AdminSection }>

const pageNav = [
  { label: '首页', icon: Home, section: 'pageHome' },
  { label: '关于速芯', icon: UsersRound, section: 'pageAbout' },
  { label: '核心业务', icon: BriefcaseBusiness, section: 'pageBusiness' },
  { label: '应用场景', icon: MessageSquareText, section: 'pageConsult' },
  { label: '项目案例', icon: BookOpen, section: 'pageCases' },
  { label: '资讯中心', icon: SquarePen, section: 'pageNews' },
  { label: '招商合作', icon: Handshake, section: 'pageCooperation' },
  { label: '实景图库', icon: Image, section: 'pageGallery' },
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
  navigation: {
    id: 'navigation',
    title: '导航设置',
    description: '配置顶部导航、按钮、移动端菜单和页面排序。',
    stats: [
      { label: '导航项', value: '8', note: '覆盖主站全部页面' },
      { label: '移动端菜单', value: '已适配', note: '抽屉式后台导航' },
      { label: '入口状态', value: '正常', note: '对应 GitHub Pages /admin/' },
    ],
    items: [
      { title: '顶部主导航', meta: '首页、关于速芯、核心业务、项目案例', state: '已发布' },
      { title: '移动端菜单', meta: '折叠抽屉与快捷入口', state: '已发布' },
      { title: 'CTA 按钮', meta: '招商合作 / 联系咨询入口', state: '待复核' },
    ],
  },
  branding: {
    id: 'branding',
    title: 'Logo / 标题 Logo',
    description: '维护导航 Logo、标题 Logo、品牌字标和站点识别。',
    stats: [
      { label: '品牌资源', value: '4', note: 'Logo、字标、favicon、标题图' },
      { label: '使用页面', value: '9', note: '主站 + 后台入口' },
      { label: '素材状态', value: '齐全', note: 'assets/materials 已归档' },
    ],
    items: [
      { title: '导航 Logo', meta: 'logo-nav.png / 顶部导航展示', state: '使用中' },
      { title: '标题 Logo', meta: 'logo-suxin.png / 页面标题展示', state: '使用中' },
      { title: '后台品牌标记', meta: '苏信智造后台 / S avatar', state: '待复核' },
    ],
  },
  blocks: {
    id: 'blocks',
    title: '配置区块',
    description: '统一管理首页推荐、业务区块、案例卡片和表单入口。',
    stats: [
      { label: '区块数量', value: '18', note: '跨 8 个页面' },
      { label: '待复核', value: '3', note: '文案、图片、排序' },
      { label: '复用组件', value: '6', note: 'CTA、图库、案例、资讯' },
    ],
    items: [
      { title: '首页首屏区块', meta: '标题、说明、主按钮、背景视觉', state: '待复核' },
      { title: '业务能力区块', meta: '核心业务、应用场景、案例推荐', state: '已发布' },
      { title: '转化入口区块', meta: '招商合作、咨询表单、页脚 CTA', state: '已发布' },
    ],
  },
  footer: {
    id: 'footer',
    title: '页脚配置区块',
    description: '配置页脚栏目、联系方式、版权信息和快捷跳转。',
    stats: [
      { label: '页脚栏目', value: '4', note: '品牌、业务、案例、合作' },
      { label: '联系入口', value: '3', note: '电话、邮箱、表单' },
      { label: '版权信息', value: '已配置', note: 'partials/footer.html' },
    ],
    items: [
      { title: '底部导航列', meta: '页面链接与栏目排序', state: '已发布' },
      { title: '企业联系信息', meta: '地址、电话、邮箱、二维码占位', state: '待复核' },
      { title: '备案与版权', meta: '页脚底栏固定信息', state: '已发布' },
    ],
  },
  pageHome: {
    id: 'pageHome',
    title: '首页',
    description: '维护官网首页首屏、业务亮点、推荐案例和主要转化入口。',
    stats: [
      { label: '首屏模块', value: '4', note: '主视觉、能力、案例、咨询' },
      { label: '待发布', value: '2', note: '文案与图片更新' },
      { label: '页面文件', value: 'index.html', note: 'GitHub Pages 首页' },
    ],
    items: [
      { title: '首页主视觉文案', meta: '标题、按钮、背景图', state: '待复核' },
      { title: '核心能力卡片', meta: '3 个能力卖点', state: '已发布' },
      { title: '底部联系入口', meta: '咨询与合作跳转', state: '已发布' },
    ],
  },
  pageAbout: {
    id: 'pageAbout',
    title: '关于速芯',
    description: '维护企业介绍、发展优势、团队能力和品牌信任内容。',
    stats: [
      { label: '内容区块', value: '5', note: '公司介绍、优势、团队、资质' },
      { label: '品牌素材', value: '6', note: 'Logo 与企业视觉' },
      { label: '页面文件', value: 'about.html', note: '关于速芯页面' },
    ],
    items: [
      { title: '企业简介', meta: '关于速芯核心说明', state: '已发布' },
      { title: '能力与资质', meta: '制造经验、技术能力、交付保障', state: '待复核' },
      { title: '品牌标题区', meta: '标题 Logo 与页面主视觉', state: '使用中' },
    ],
  },
  pageBusiness: {
    id: 'pageBusiness',
    title: '核心业务',
    description: '管理核心业务页面的解决方案、服务模块和转化入口。',
    stats: [
      { label: '服务模块', value: '6', note: '覆盖数字化工厂全链路' },
      { label: '本周调整', value: '3', note: '新增能力说明' },
      { label: '页面文件', value: 'business.html', note: '核心业务页面' },
    ],
    items: [
      { title: '智能工厂解决方案', meta: 'business.html', state: '已发布' },
      { title: '设备联网服务', meta: '图文模块', state: '待复核' },
      { title: '工业数据看板', meta: '咨询 CTA', state: '待发布' },
    ],
  },
  pageConsult: {
    id: 'pageConsult',
    title: '应用场景',
    description: '管理应用场景、客户需求入口和线索跟进状态。',
    stats: [
      { label: '场景模块', value: '8', note: '工厂、设备、数据、质量' },
      { label: '待跟进线索', value: '42', note: '来自 consult.html' },
      { label: '页面文件', value: 'consult.html', note: '应用场景 / 咨询入口' },
    ],
    items: [
      { title: '数字化车间场景', meta: '产线设备与数据采集', state: '已发布' },
      { title: '质量追溯场景', meta: '检测、记录、追溯闭环', state: '待复核' },
      { title: '咨询表单入口', meta: '收集客户需求并进入线索表', state: '待跟进' },
    ],
  },
  pageCases: {
    id: 'pageCases',
    title: '项目案例',
    description: '维护案例列表、行业标签、案例图片和首页推荐权重。',
    stats: [
      { label: '已发布案例', value: '36', note: '8 个首页推荐' },
      { label: '素材完整度', value: '92%', note: '6 个案例待补图' },
      { label: '页面文件', value: 'cases.html', note: '项目案例页面' },
    ],
    items: [
      { title: '智能工厂总览页', meta: '首页推荐 · 2,846 浏览', state: '推荐中' },
      { title: '质量追溯案例', meta: '制造行业 · 1,284 浏览', state: '已发布' },
      { title: '设备联网解决方案', meta: '能源设备 · 1,930 浏览', state: '已发布' },
    ],
  },
  pageNews: {
    id: 'pageNews',
    title: '资讯中心',
    description: '维护新闻动态、行业观察、技术文章和发布状态。',
    stats: [
      { label: '资讯条目', value: '12', note: '新闻、技术、行业动态' },
      { label: '草稿', value: '3', note: '等待编辑复核' },
      { label: '页面文件', value: 'news.html', note: '资讯中心页面' },
    ],
    items: [
      { title: '行业趋势文章', meta: '智能制造与数据化转型', state: '草稿' },
      { title: '项目交付动态', meta: '近期案例复盘与成果', state: '待发布' },
      { title: '技术专题', meta: '设备联网、数据看板、质量追溯', state: '已发布' },
    ],
  },
  pageCooperation: {
    id: 'pageCooperation',
    title: '招商合作',
    description: '管理合作伙伴申请、渠道信息、联合方案和回访记录。',
    stats: [
      { label: '新增申请', value: '7', note: '本周' },
      { label: '待评估', value: '5', note: '渠道与方案' },
      { label: '页面文件', value: 'cooperation.html', note: '招商合作页面' },
    ],
    items: [
      { title: '长三角工业服务商', meta: '区域渠道合作', state: '待评估' },
      { title: '自动化集成伙伴', meta: '联合交付方案', state: '方案中' },
      { title: '高校研究团队', meta: '产学研合作', state: '已转化' },
    ],
  },
  pageGallery: {
    id: 'pageGallery',
    title: '实景图库',
    description: '管理工厂实景、项目图库、现场素材和页面图片资源。',
    stats: [
      { label: '图库素材', value: '28', note: '现场、设备、案例图' },
      { label: '待压缩', value: '4', note: '建议优化首屏' },
      { label: '页面文件', value: 'gallery.html', note: '实景图库页面' },
    ],
    items: [
      { title: '工厂现场图组', meta: '设备、车间、产线实景', state: '使用中' },
      { title: '项目案例图库', meta: 'case-*.png 图片组', state: '待整理' },
      { title: '首页推荐图片', meta: '同步主站首屏与案例区', state: '待复核' },
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

const publishOptions = [
  { label: '已发布', value: '已发布' },
  { label: '待复核', value: '待复核' },
  { label: '草稿', value: '草稿' },
]

const layoutOptions = [
  { label: '标准首屏', value: 'standard' },
  { label: '紧凑首屏', value: 'compact' },
  { label: '强调转化', value: 'conversion' },
]

function pageFields(title: string, subtitle: string): Array<EditableField> {
  return [
    {
      id: 'heroTitle',
      label: '页面主标题',
      type: 'text',
      defaultValue: title,
      hint: '同步到前台当前页面的 h1 或首页轮播标题',
    },
    {
      id: 'heroSubtitle',
      label: '页面副标题',
      type: 'textarea',
      defaultValue: subtitle,
      hint: '同步到前台当前页面首屏说明',
    },
    {
      id: 'primaryCtaLabel',
      label: '主按钮文案',
      type: 'text',
      defaultValue: '立即咨询',
    },
    {
      id: 'secondaryCtaLabel',
      label: '次按钮文案',
      type: 'text',
      defaultValue: '查看详情',
    },
    {
      id: 'heroLayout',
      label: '首屏布局',
      type: 'select',
      defaultValue: 'standard',
      options: layoutOptions,
    },
    {
      id: 'publishState',
      label: '发布状态',
      type: 'select',
      defaultValue: '已发布',
      options: publishOptions,
    },
    {
      id: 'showOnHome',
      label: '首页推荐',
      type: 'toggle',
      defaultValue: true,
      hint: '用于首页推荐区和后台统计',
    },
  ]
}

const editableSections: Record<EditableSection, { title: string; fields: Array<EditableField> }> = {
  navigation: {
    title: '导航配置',
    fields: [
      {
        id: 'menuItems',
        label: '顶部导航菜单',
        type: 'menu-list',
        defaultValue: defaultNavigationItems,
        hint: '菜单名称、跳转页面和显示状态都会同步到前台顶部导航',
      },
      {
        id: 'mobileMode',
        label: '手机菜单',
        type: 'select',
        defaultValue: 'drawer',
        options: [
          { label: '抽屉菜单', value: 'drawer' },
          { label: '折叠列表', value: 'stack' },
        ],
      },
      { id: 'ghostActionLabel', label: '次级按钮', type: 'text', defaultValue: '在线咨询' },
      { id: 'solidActionLabel', label: '主按钮', type: 'text', defaultValue: '预约考察' },
    ],
  },
  branding: {
    title: '品牌配置',
    fields: [
      { id: 'brandName', label: '导航 Logo 文字', type: 'text', defaultValue: '速芯算力' },
      { id: 'siteTitle', label: '浏览器标题', type: 'text', defaultValue: '速芯算力 - 绿电算力基础设施服务商' },
      {
        id: 'logoAsset',
        label: 'Logo 资源',
        type: 'select',
        defaultValue: 'logo-nav.png',
        options: [
          { label: '导航 Logo', value: 'logo-nav.png' },
          { label: '标题 Logo', value: 'logo-suxin.png' },
          { label: '仅文字', value: 'text-only' },
        ],
      },
      { id: 'showBrandMark', label: '显示图标标记', type: 'toggle', defaultValue: true },
      { id: 'titleLogoText', label: '标题 Logo 文案', type: 'text', defaultValue: '绿电算力基础设施服务商' },
    ],
  },
  blocks: {
    title: '区块配置',
    fields: [
      { id: 'heroBlockTitle', label: '首页首屏区块名', type: 'text', defaultValue: '首页主视觉' },
      { id: 'featureBlockTitle', label: '业务区块名', type: 'text', defaultValue: '四大业务入口' },
      { id: 'caseBlockTitle', label: '案例区块名', type: 'text', defaultValue: '项目案例推荐' },
      { id: 'leadBlockTitle', label: '线索区块名', type: 'text', defaultValue: '应用场景咨询' },
      {
        id: 'density',
        label: '区块密度',
        type: 'select',
        defaultValue: 'balanced',
        options: [
          { label: '紧凑', value: 'compact' },
          { label: '平衡', value: 'balanced' },
          { label: '宽松', value: 'loose' },
        ],
      },
      { id: 'showStats', label: '显示统计数据', type: 'toggle', defaultValue: true },
    ],
  },
  footer: {
    title: '页脚配置',
    fields: [
      { id: 'companyName', label: '公司/品牌名', type: 'text', defaultValue: '速芯算力' },
      { id: 'serviceLine', label: '服务说明', type: 'text', defaultValue: 'GPU算力硬件销售' },
      { id: 'hostingLine', label: '托管说明', type: 'text', defaultValue: '智算机房托管' },
      { id: 'phone', label: '联系电话', type: 'text', defaultValue: '招商专线' },
      { id: 'wechat', label: '企业微信', type: 'text', defaultValue: '企业微信' },
      { id: 'address', label: '地址入口', type: 'text', defaultValue: '机房地址' },
      { id: 'showMeta', label: '显示页脚信息', type: 'toggle', defaultValue: true },
    ],
  },
  pageHome: {
    title: '首页配置',
    fields: pageFields('绿电算力基础设施服务商', 'GPU算力硬件销售 | 智算机房托管 | 企业AIGC降本 | 跨境算力出海'),
  },
  pageAbout: {
    title: '关于速芯配置',
    fields: pageFields('关于速芯', '聚焦绿电算力基础设施，连接硬件、机房、场景与产业合作。'),
  },
  pageBusiness: {
    title: '核心业务配置',
    fields: pageFields('核心业务', 'GPU算力硬件销售、智算机房托管、企业AIGC降本与跨境算力出海。'),
  },
  pageConsult: {
    title: '应用场景配置',
    fields: pageFields('应用场景', '面向电商、MCN、广告、工业质检、政务与文旅场景快速匹配算力方案。'),
  },
  pageCases: {
    title: '项目案例配置',
    fields: pageFields('项目案例', '展示园区、本地企业、跨境业务和智算机房合作案例。'),
  },
  pageNews: {
    title: '资讯中心配置',
    fields: pageFields('资讯中心', '发布算力基础设施、行业动态、项目交付和技术观察。'),
  },
  pageCooperation: {
    title: '招商合作配置',
    fields: pageFields('招商合作', '面向渠道伙伴、园区资源、机房合作与联合交付开放合作入口。'),
  },
  pageGallery: {
    title: '实景图库配置',
    fields: pageFields('实景图库', '集中展示机房、设备、项目现场和合作空间实景素材。'),
  },
}

function buildDefaultFormState(): AdminFormState {
  return Object.fromEntries(
    Object.entries(editableSections).map(([section, config]) => [
      section,
      Object.fromEntries(config.fields.map((field) => [field.id, field.defaultValue])),
    ]),
  ) as AdminFormState
}

function readFormState(): AdminFormState {
  const fallback = buildDefaultFormState()

  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const saved = window.localStorage.getItem(SITE_CONFIG_KEY)
    if (!saved) {
      return fallback
    }

    const parsed = JSON.parse(saved) as { sections?: Partial<AdminFormState> }
    return Object.fromEntries(
      Object.entries(fallback).map(([section, values]) => [
        section,
        {
          ...values,
          ...(parsed.sections?.[section as EditableSection] ?? {}),
        },
      ]),
    ) as AdminFormState
  } catch {
    return fallback
  }
}

function writeFormState(configState: AdminFormState) {
  if (typeof window === 'undefined') {
    return ''
  }

  const updatedAt = new Date().toISOString()
  window.localStorage.setItem(
    SITE_CONFIG_KEY,
    JSON.stringify({
      version: 1,
      updatedAt,
      sections: configState,
    }),
  )

  return updatedAt
}

function getStatusClass(status: Lead['status'] | string) {
  return status === '待跟进' || status === '方案中' || status === '待发布' || status === '待评估'
    ? 'status-primary'
    : 'status-neutral'
}

function isTopNavActive(section: AdminSection, activeSection: AdminSection) {
  if (section === 'pageHome') {
    return activeSection.startsWith('page')
  }

  return activeSection === section
}

export function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [configState, setConfigState] = useState<AdminFormState>(() => readFormState())
  const [lastSavedAt, setLastSavedAt] = useState('')
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedAt', desc: false },
  ])
  const [leadView, setLeadView] = useState<'全部' | '待跟进' | '方案中'>('全部')

  useEffect(() => {
    const updatedAt = writeFormState(configState)
    if (updatedAt) {
      setLastSavedAt(new Date(updatedAt).toLocaleTimeString('zh-CN', { hour12: false }))
    }
  }, [configState])

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

  const updateConfigField = (section: EditableSection, fieldId: string, value: FieldValue) => {
    setConfigState((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [fieldId]: value,
      },
    }))
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
              className={isTopNavActive(item.section, activeSection) ? 'active' : ''}
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
        <p className="nav-group">控制台</p>
        <SidebarNav
          activeSection={activeSection}
          items={primaryNav}
          onSelect={selectSection}
        />

        <p className="nav-group">页面设置</p>
        <SidebarNav
          activeSection={activeSection}
          items={pageNav}
          onSelect={selectSection}
        />

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
            formValues={configState[activeSection]}
            lastSavedAt={lastSavedAt}
            onConfigChange={updateConfigField}
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

        <p className="nav-group">控制台</p>
        <SidebarNav activeSection={activeSection} items={primaryNav} onSelect={onSelect} />

        <p className="nav-group">页面设置</p>
        <SidebarNav activeSection={activeSection} items={pageNav} onSelect={onSelect} />

        <p className="nav-group">快捷入口</p>
        <div className="mobile-shortcuts">
          {[
            { label: '首页', section: 'pageHome' },
            { label: '关于速芯', section: 'pageAbout' },
            { label: '核心业务', section: 'pageBusiness' },
            { label: '项目案例', section: 'pageCases' },
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
          <p>这个后台对应当前 GitHub Pages 官网，覆盖导航、品牌、页脚和 8 个前台页面。</p>
          <div className="deck-actions">
            <button className="ghost-button" onClick={() => onSelect('navigation')}>配置导航</button>
            <button className="light-button" onClick={() => onSelect('pageHome')}>
              <BookOpen size={16} />
              编辑首页
            </button>
          </div>
          <div className="setup-list">
            {[
              ['导航设置', '维护顶部导航、移动菜单和按钮顺序', GalleryVerticalEnd],
              ['Logo / 标题 Logo', '同步品牌标识、标题图和后台标记', Image],
              ['页面设置', '管理首页、关于速芯、核心业务等 8 个页面', Home],
            ].map(([title, detail, Icon], index) => {
              const SetupIcon = Icon as typeof Home
              return (
                <button
                  className="setup-row"
                  key={title as string}
                  onClick={() => onSelect(['navigation', 'branding', 'pageHome'][index] as AdminSection)}
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
            ['导航设置', '检查顶部导航和移动端菜单', Eye, 'navigation'],
            ['配置区块', '整理首页推荐、业务和 CTA 区块', Settings, 'blocks'],
            ['应用场景', '处理场景内容与咨询线索', MessageSquareText, 'pageConsult'],
            ['实景图库', '整理现场图片与案例素材', Image, 'pageGallery'],
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
          <button onClick={() => onSelect('footer')}>
            查看页脚配置
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
  formValues,
  lastSavedAt,
  onConfigChange,
  table,
  leadView,
  setLeadView,
}: {
  activeSection: EditableSection
  formValues: Record<string, FieldValue>
  lastSavedAt: string
  onConfigChange: (section: EditableSection, fieldId: string, value: FieldValue) => void
  table: ReturnType<typeof useReactTable<Lead>>
  leadView: '全部' | '待跟进' | '方案中'
  setLeadView: (view: '全部' | '待跟进' | '方案中') => void
}) {
  return (
    <>
      <ConfigEditor
        activeSection={activeSection}
        formValues={formValues}
        lastSavedAt={lastSavedAt}
        onChange={onConfigChange}
      />

      {activeSection === 'pageConsult' ? (
        <section className="single-table">
          <LeadTable table={table} leadView={leadView} setLeadView={setLeadView} />
        </section>
      ) : null}
    </>
  )
}

function ConfigEditor({
  activeSection,
  formValues,
  lastSavedAt,
  onChange,
}: {
  activeSection: EditableSection
  formValues: Record<string, FieldValue>
  lastSavedAt: string
  onChange: (section: EditableSection, fieldId: string, value: FieldValue) => void
}) {
  const editableConfig = editableSections[activeSection]

  return (
    <section className="config-layout" aria-label={`${editableConfig.title} 表单`}>
      <article className="panel config-panel">
        <div className="panel-heading">
          <div>
            <h2>{editableConfig.title}</h2>
            <p>这些字段会写入前台配置，当前浏览器访问前台页面时会直接读取</p>
          </div>
          <span className="save-pill">已自动保存 {lastSavedAt || '刚刚'}</span>
        </div>

        <div className="config-form">
          {editableConfig.fields.map((field) => (
            <ConfigField
              field={field}
              key={field.id}
              onChange={(value) => onChange(activeSection, field.id, value)}
              value={formValues[field.id] ?? field.defaultValue}
            />
          ))}
        </div>
      </article>
    </section>
  )
}

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: FieldValue
  onChange: (value: FieldValue) => void
}) {
  if (field.type === 'menu-list') {
    return (
      <NavigationMenuEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? value : defaultNavigationItems}
      />
    )
  }

  if (field.type === 'textarea') {
    return (
      <label className="config-field span-2">
        <span>{field.label}</span>
        <textarea
          onChange={(event) => onChange(event.target.value)}
          value={String(value)}
        />
        {field.hint ? <small>{field.hint}</small> : null}
      </label>
    )
  }

  if (field.type === 'select') {
    return (
      <label className="config-field">
        <span>{field.label}</span>
        <select onChange={(event) => onChange(event.target.value)} value={String(value)}>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {field.hint ? <small>{field.hint}</small> : null}
      </label>
    )
  }

  if (field.type === 'toggle') {
    return (
      <label className="config-toggle">
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>
          <strong>{field.label}</strong>
          {field.hint ? <small>{field.hint}</small> : null}
        </span>
      </label>
    )
  }

  return (
    <label className="config-field">
      <span>{field.label}</span>
      <input
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={String(value)}
      />
      {field.hint ? <small>{field.hint}</small> : null}
    </label>
  )
}

function NavigationMenuEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<NavigationMenuItem>
  onChange: (value: Array<NavigationMenuItem>) => void
}) {
  const updateItem = (id: string, patch: Partial<NavigationMenuItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const addItem = () => {
    const nextIndex = value.length + 1
    onChange([
      ...value,
      {
        id: `custom-${Date.now()}`,
        label: `新菜单 ${nextIndex}`,
        href: 'index.html',
        page: 'home',
        visible: true,
      },
    ])
  }

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  return (
    <div className="menu-editor span-2">
      <div className="menu-editor-head">
        <div>
          <strong>{field.label}</strong>
          {field.hint ? <small>{field.hint}</small> : null}
        </div>
        <button className="ghost-button" onClick={addItem} type="button">
          新增菜单
        </button>
      </div>

      <div className="menu-list-editor">
        {value.map((item, index) => (
          <div className="menu-edit-row" key={item.id}>
            <span className="menu-order">{index + 1}</span>
            <label className="menu-cell">
              <span>菜单名称</span>
              <input
                onChange={(event) => updateItem(item.id, { label: event.target.value })}
                value={item.label}
              />
            </label>
            <label className="menu-cell">
              <span>跳转页面</span>
              <select
                onChange={(event) => {
                  const option = pageTargetOptions.find((target) => target.value === event.target.value)
                  updateItem(item.id, {
                    href: event.target.value,
                    page: option?.page ?? item.page,
                  })
                }}
                value={item.href}
              >
                {pageTargetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.value}
                  </option>
                ))}
              </select>
            </label>
            <label className="menu-visible">
              <input
                checked={item.visible}
                onChange={(event) => updateItem(item.id, { visible: event.target.checked })}
                type="checkbox"
              />
              <span>显示</span>
            </label>
            <button
              className="danger-button"
              disabled={value.length <= 1}
              onClick={() => removeItem(item.id)}
              type="button"
            >
              删除
            </button>
          </div>
        ))}
      </div>
    </div>
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
            {modules.pageCases.items.map((item, index) => (
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

function getSectionLabel(section: AdminSection) {
  if (section === 'overview') {
    return '概览'
  }

  return modules[section].title
}
