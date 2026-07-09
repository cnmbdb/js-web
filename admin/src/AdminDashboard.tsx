import { type ReactNode, useEffect, useMemo, useState } from 'react'
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
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  FileText,
  GalleryVerticalEnd,
  GripVertical,
  Handshake,
  Home,
  Image,
  LayoutDashboard,
  MessageSquareText,
  Palette,
  Search,
  SquarePen,
  UsersRound,
} from 'lucide-react'

type AdminSection =
  | 'navigation'
  | 'branding'
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

type NavigationMenuItem = {
  id: string
  label: string
  href: string
  page: string
  visible: boolean
}

type FooterMenuItem = {
  id: string
  label: string
  href: string
  newTab: boolean
}

type HomeCarouselSlide = {
  id: string
  title: string
  subtitle: string
  imageSrc: string
  imageAlt: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}

type HomeFeatureCard = {
  id: string
  title: string
  subtitle: string
  href: string
  iconClass: string
  highlighted: boolean
}

type HomeEntranceItem = {
  id: string
  label: string
  href: string
  iconClass: string
}

type HomeMediaCard = {
  id: string
  title: string
  imageSrc: string
  imageAlt: string
}

type PageHeroConfig = {
  title: string
  subtitle: string
}

type AboutIntroConfig = {
  title: string
  paragraphs: Array<string>
  highlight: string
  imageSrc: string
  imageAlt: string
}

type LabelItem = {
  id: string
  label: string
}

type LabelListConfig = {
  title: string
  items: Array<LabelItem>
}

type AboutPanelConfig = {
  id: string
  title: string
  variant: 'chips' | 'image'
  chips: Array<string>
  imageSrc: string
  imageAlt: string
}

type BusinessCardItem = {
  id: string
  title: string
  description: string
  href: string
  linkLabel: string
  iconClass: string
}

type InlineBookingConfig = {
  label: string
  iconClass: string
  namePlaceholder: string
  demandPlaceholder: string
  buttonLabel: string
}

type IconLinkItem = {
  id: string
  label: string
  href: string
  iconClass: string
}

type IconLinkSectionConfig = {
  title: string
  items: Array<IconLinkItem>
}

type FormFieldItem = {
  id: string
  label: string
  placeholder: string
  suffixIconClass: string
  wide: boolean
}

type FormPanelConfig = {
  id: string
  title: string
  titleIconClass: string
  buttonLabel: string
  fields: Array<FormFieldItem>
}

type DownloadItem = {
  id: string
  label: string
  href: string
}

type DownloadSectionConfig = {
  title: string
  items: Array<DownloadItem>
}

type FilterItem = {
  id: string
  label: string
  iconClass: string
  trailingIconClass: string
}

type CaseCardItem = {
  id: string
  tag: string
  corner: string
  imageSrc: string
  imageAlt: string
  title: string
  status: string
  mutedStatus: boolean
  highlighted: boolean
}

type NewsLeadConfig = {
  kicker: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

type NewsCardItem = {
  id: string
  title: string
  description: string
  iconClass: string
}

type PhotoCardItem = {
  id: string
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  featured: boolean
}

type FieldValue =
  | string
  | boolean
  | PageHeroConfig
  | AboutIntroConfig
  | LabelListConfig
  | InlineBookingConfig
  | IconLinkSectionConfig
  | DownloadItem
  | DownloadSectionConfig
  | NewsLeadConfig
  | Array<NavigationMenuItem>
  | Array<FooterMenuItem>
  | Array<HomeCarouselSlide>
  | Array<HomeFeatureCard>
  | Array<HomeEntranceItem>
  | Array<HomeMediaCard>
  | Array<AboutPanelConfig>
  | Array<BusinessCardItem>
  | Array<IconLinkItem>
  | Array<FormPanelConfig>
  | Array<FilterItem>
  | Array<CaseCardItem>
  | Array<NewsCardItem>
  | Array<PhotoCardItem>

type EditableField = {
  id: string
  label: string
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'toggle'
    | 'menu-list'
    | 'footer-menu-list'
    | 'home-carousel'
    | 'home-feature-cards'
    | 'home-entrances'
    | 'home-media-cards'
    | 'page-hero'
    | 'about-intro'
    | 'label-list'
    | 'about-panels'
    | 'business-cards'
    | 'booking-form'
    | 'icon-links'
    | 'icon-link-section'
    | 'form-panels'
    | 'downloads'
    | 'download-cta'
    | 'filters'
    | 'case-cards'
    | 'news-lead'
    | 'news-cards'
    | 'photos'
  defaultValue: FieldValue
  hint?: string
  options?: Array<{ label: string; value: string }>
}

type AdminFormState = Record<AdminSection, Record<string, FieldValue>>

const SITE_CONFIG_KEY = 'suxin-site-config'
const DEFAULT_LOGO_IMAGE_SRC = 'assets/materials/logo-nav.png'

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

const defaultFooterMenuItems: Array<FooterMenuItem> = [
  { id: 'cooperation', label: '招商专线', href: 'cooperation.html', newTab: false },
  { id: 'wechat', label: '企业微信', href: 'consult.html', newTab: false },
  { id: 'address', label: '机房地址', href: 'about.html', newTab: false },
  { id: 'video-consult', label: '视频咨询预约', href: 'cooperation.html', newTab: false },
]

const defaultHomeCarouselSlides: Array<HomeCarouselSlide> = [
  {
    id: 'green-compute',
    title: '绿电算力基础设施服务商',
    subtitle: 'GPU算力硬件销售 | 智算机房托管 | 企业AIGC降本 | 跨境算力出海',
    imageSrc: 'assets/materials/hero-chip.png',
    imageAlt: '绿色算力芯片',
    primaryLabel: '应用场景咨询',
    primaryHref: 'consult.html',
    secondaryLabel: '机房实地考察预约',
    secondaryHref: 'cooperation.html',
  },
  {
    id: 'enterprise-consult',
    title: '企业算力方案咨询',
    subtitle: '面向电商、MCN、广告、工业质检、政务与文旅场景，快速测算成本与部署路径',
    imageSrc: 'assets/materials/dashboard-panel.png',
    imageAlt: '算力数据面板',
    primaryLabel: '立即测算',
    primaryHref: 'consult.html',
    secondaryLabel: '查看业务',
    secondaryHref: 'business.html',
  },
  {
    id: 'server-room',
    title: '智算机房托管预约',
    subtitle: '绿电资源、机房租赁、硬件托管、渠道招商与园区项目一站式对接',
    imageSrc: 'assets/materials/server-room.png',
    imageAlt: '绿色智算机房',
    primaryLabel: '预约考察',
    primaryHref: 'cooperation.html',
    secondaryLabel: '查看案例',
    secondaryHref: 'cases.html',
  },
]

const defaultHomeFeatureCards: Array<HomeFeatureCard> = [
  { id: 'business', title: '核心业务', subtitle: '硬件 / 托管 / 出海', href: 'business.html', iconClass: 'ri-focus-3-line', highlighted: true },
  { id: 'consult', title: '应用场景', subtitle: '电商 / MCN / 工业', href: 'consult.html', iconClass: 'ri-file-list-3-line', highlighted: false },
  { id: 'cases', title: '项目案例', subtitle: '园区 / 本地 / 跨境', href: 'cases.html', iconClass: 'ri-box-3-line', highlighted: false },
  { id: 'cooperation', title: '招商合作', subtitle: '渠道 / 园区 / 伙伴', href: 'cooperation.html', iconClass: 'ri-stack-line', highlighted: false },
]

const defaultHomeEntrances: Array<HomeEntranceItem> = [
  { id: 'hardware', label: '硬件采购', href: 'business.html', iconClass: 'ri-cpu-line' },
  { id: 'hosting', label: '机房托管', href: 'business.html', iconClass: 'ri-server-line' },
  { id: 'scenario', label: '应用场景', href: 'consult.html', iconClass: 'ri-apps-2-line' },
  { id: 'partner', label: '招商合作', href: 'cooperation.html', iconClass: 'ri-handshake-line' },
]

const defaultHomeMediaCards: Array<HomeMediaCard> = [
  { id: 'scenario-panel', title: '应用场景', imageSrc: 'assets/materials/dashboard-panel.png', imageAlt: '算力数据面板' },
  { id: 'news-panel', title: '资讯中心', imageSrc: 'assets/materials/server-room.png', imageAlt: '绿色智算机房' },
]

const defaultAboutHero: PageHeroConfig = {
  title: '关于速芯',
  subtitle: '一体化算力基础设施服务商',
}

const defaultAboutIntro: AboutIntroConfig = {
  title: '企业简介',
  paragraphs: [
    '速芯算力围绕西藏、新疆等绿电资源建设算力基础设施，面向企业客户提供GPU整机销售、智算机房托管、AIGC应用降本与跨境算力出海服务。',
    '团队从硬件选型、机房交付、运维保障到业务场景测算一体化推进，帮助客户把算力采购、资产托管和AI应用落到可执行的项目方案。',
  ],
  highlight: '硬件销售 | 机房托管 | 企业算力 | 跨境数字服务',
  imageSrc: 'assets/materials/factory-aerial.png',
  imageAlt: '速芯算力园区航拍',
}

const defaultAboutTimeline: LabelListConfig = {
  title: '发展历程',
  items: [
    { id: 'tibet-project', label: '西藏算力项目起步' },
    { id: 'hefeng-storage', label: '和丰源网荷储落地' },
    { id: 'hetian-park', label: '和田园区合作推进' },
    { id: 'hardware-5090', label: '5090硬件方案发布' },
    { id: 'cross-border', label: '跨境算力服务上线' },
    { id: 'channel-start', label: '全国渠道招商启动' },
  ],
}

const defaultAboutPanels: Array<AboutPanelConfig> = [
  {
    id: 'strength',
    title: '企业实力',
    variant: 'chips',
    chips: ['算力储备', '绿电资源', '运维团队'],
    imageSrc: '',
    imageAlt: '',
  },
  {
    id: 'team',
    title: '核心管理团队',
    variant: 'image',
    chips: [],
    imageSrc: 'assets/materials/team-portraits.png',
    imageAlt: '核心管理团队',
  },
  {
    id: 'certificates',
    title: '资证荣誉',
    variant: 'image',
    chips: [],
    imageSrc: 'assets/materials/certificates.png',
    imageAlt: '资质证书与荣誉',
  },
]

const defaultBusinessHero: PageHeroConfig = {
  title: '核心业务中心',
  subtitle: '算力硬件 | 机房租赁 | 企业方案 | 跨境出海 | 园区项目 | 渠道招商',
}

const defaultBusinessCards: Array<BusinessCardItem> = [
  { id: 'hardware-sale', title: '算力硬件整机销售', description: '8卡RTX5090整机、电费实缴托管、3/5年长协方案', href: 'consult.html', linkLabel: '咨询配置', iconClass: 'ri-file-list-3-line' },
  { id: 'server-rental', title: '机房算力租赁', description: '裸金属分时包月、推理训练分区、绿电与涉密算力', href: 'cooperation.html', linkLabel: '预约托管', iconClass: 'ri-stack-line' },
  { id: 'local-aigc', title: '本地企业AIGC方案', description: '电商、MCN、广告、工业质检、政务、教培、文旅', href: 'consult.html', linkLabel: '查看场景', iconClass: 'ri-map-pin-user-line' },
  { id: 'cross-border-token', title: '跨境Token算力出海', description: '隔离来数加工、海外AI工具、短剧与广告算力', href: 'cases.html', linkLabel: '查看案例', iconClass: 'ri-arrow-down-line' },
  { id: 'green-park', title: '源网荷储算力园区', description: '和丰、和田园区共建、绿电直连、投资测算', href: 'about.html', linkLabel: '了解园区', iconClass: 'ri-shield-check-line' },
  { id: 'channel-partner', title: '渠道算力招商加盟', description: '三重收益、批量政策、会销扶持、渠道标杆', href: 'cooperation.html', linkLabel: '申请合作', iconClass: 'ri-vip-crown-line' },
]

const defaultBusinessBooking: InlineBookingConfig = {
  label: '业务对接预约：',
  iconClass: 'ri-add-line',
  namePlaceholder: '姓名 / 企业',
  demandPlaceholder: '需求说明',
  buttonLabel: '提交预约',
}

const defaultConsultHero: PageHeroConfig = {
  title: '应用场景',
  subtitle: '电商内容生产 | MCN短视频 | 广告投放 | 工业质检 | 政务文旅 | 跨境业务',
}

const defaultConsultQuickLinks: Array<IconLinkItem> = [
  { id: 'ecommerce', label: '电商内容生产', href: '#', iconClass: 'ri-shopping-bag-3-line' },
  { id: 'mcn-video', label: 'MCN短视频', href: '#', iconClass: 'ri-video-line' },
  { id: 'ad-optimization', label: '广告投放优化', href: '#', iconClass: 'ri-megaphone-line' },
  { id: 'visual-inspection', label: '工业视觉质检', href: '#', iconClass: 'ri-scan-2-line' },
  { id: 'cross-border', label: '跨境业务出海', href: '#', iconClass: 'ri-global-line' },
]

const defaultConsultForms: Array<FormPanelConfig> = [
  {
    id: 'scenario-estimate',
    title: '应用方案测算表单',
    titleIconClass: '',
    buttonLabel: '提交测算',
    fields: [
      { id: 'name', label: '姓名', placeholder: '姓名', suffixIconClass: '', wide: false },
      { id: 'phone', label: '电话', placeholder: '电话', suffixIconClass: '', wide: false },
      { id: 'company-type', label: '企业类型', placeholder: '电商 / MCN / 工业', suffixIconClass: '', wide: false },
      { id: 'scene', label: '应用场景', placeholder: '内容 / 视觉 / 投放', suffixIconClass: '', wide: false },
      { id: 'scale', label: '算力规模', placeholder: 'GPU数 / 并发', suffixIconClass: '', wide: false },
      { id: 'budget-cycle', label: '预算周期', placeholder: '月度 / 季度 / 年度', suffixIconClass: '', wide: false },
    ],
  },
  {
    id: 'room-visit',
    title: '机房实地考察预约',
    titleIconClass: '',
    buttonLabel: '提交预约',
    fields: [
      { id: 'contact', label: '联系方式', placeholder: '联系方式', suffixIconClass: 'ri-arrow-down-s-line', wide: true },
      { id: 'visitors', label: '到访人数', placeholder: '到访人数', suffixIconClass: '', wide: false },
      { id: 'time', label: '意向时间', placeholder: '到访时间', suffixIconClass: '', wide: false },
      { id: 'focus', label: '考察重点', placeholder: '环境 / 电力 / 运维', suffixIconClass: '', wide: false },
      { id: 'remark', label: '备注需求', placeholder: '托管 / 租赁', suffixIconClass: '', wide: false },
    ],
  },
]

const defaultConsultDownloads: DownloadSectionConfig = {
  title: '场景资料下载',
  items: [
    { id: 'cost-list', label: 'AIGC降本清单', href: '#' },
    { id: 'scale-sheet', label: '算力规模测算表', href: '#' },
    { id: 'scene-plan', label: '行业场景方案', href: '#' },
    { id: 'visit-list', label: '机房考察清单', href: '#' },
  ],
}

const defaultCasesHero: PageHeroConfig = {
  title: '项目案例中心',
  subtitle: '政企园区案例 | 本地商家案例 | 跨境海外案例',
}

const defaultCaseTabs: LabelListConfig = {
  title: '案例分类标签',
  items: [
    { id: 'government-park', label: '政企园区案例' },
    { id: 'local-business', label: '本地商家案例' },
    { id: 'overseas', label: '跨境海外案例' },
  ],
}

const defaultCaseFilters: Array<FilterItem> = [
  { id: 'industry', label: '行业', iconClass: 'ri-arrow-up-s-line', trailingIconClass: '' },
  { id: 'scene', label: '场景', iconClass: 'ri-map-pin-line', trailingIconClass: '' },
  { id: 'region', label: '地区', iconClass: 'ri-map-pin-line', trailingIconClass: '' },
  { id: 'mode-primary', label: '合作模式', iconClass: 'ri-map-pin-line', trailingIconClass: 'ri-arrow-down-s-line' },
  { id: 'mode-secondary', label: '合作模式', iconClass: 'ri-map-pin-line', trailingIconClass: '' },
]

const defaultCaseCards: Array<CaseCardItem> = [
  { id: 'case-1', tag: '05', corner: '2', imageSrc: 'assets/materials/case-1.png', imageAlt: '上海算力项目', title: '上海握藏算力项目：算力集群部署与运维交付', status: '签署案例', mutedStatus: false, highlighted: true },
  { id: 'case-2', tag: '03', corner: '2', imageSrc: 'assets/materials/case-2.png', imageAlt: '绿电园区共建', title: '和丰源网荷储项目：绿电算力园区共建', status: '盘锦案例', mutedStatus: false, highlighted: true },
  { id: 'case-3', tag: '03', corner: '3', imageSrc: 'assets/materials/case-3.png', imageAlt: '园区共建', title: '和丰源网荷储项目：绿电算力园区共建', status: '签署案例', mutedStatus: false, highlighted: true },
  { id: 'case-4', tag: '03', corner: '4', imageSrc: 'assets/materials/case-4.png', imageAlt: '算力园区', title: '和田增量配电网算力园区：绿电直连与机房托管', status: '签署案例', mutedStatus: false, highlighted: true },
  { id: 'case-5', tag: '02', corner: '3', imageSrc: 'assets/materials/case-5.png', imageAlt: '电力资源与算力运营', title: '和田增量配电网算力园区：电力资源与算力运营', status: '', mutedStatus: false, highlighted: false },
  { id: 'case-6', tag: '03', corner: '4', imageSrc: 'assets/materials/case-6.png', imageAlt: '本地商家AIGC', title: '本地商家AIGC降本案例：内容生产与客服提效', status: '管理成果', mutedStatus: true, highlighted: false },
  { id: 'case-7', tag: '03', corner: '5', imageSrc: 'assets/materials/case-7.png', imageAlt: '广告电商算力滴灌', title: '本地商家AIGC降本案例：广告电商MON算力滴灌', status: '', mutedStatus: false, highlighted: true },
  { id: 'case-8', tag: '03', corner: '5', imageSrc: 'assets/materials/case-8.png', imageAlt: '海外算力服务', title: '跨境海外算力服务案例：海外AI平台与短剧算力', status: '', mutedStatus: false, highlighted: true },
]

const defaultCaseDownload: DownloadItem = {
  id: 'all-cases',
  label: '全部案例资料下载',
  href: '#',
}

const defaultNewsHero: PageHeroConfig = {
  title: '资讯中心',
  subtitle: '行业动态 | 项目进展 | 绿电园区政策 | AIGC应用趋势',
}

const defaultNewsLead: NewsLeadConfig = {
  kicker: '行业观察',
  title: '绿色算力基础设施进入精细化运营阶段',
  description: '围绕GPU硬件、机房托管、绿电资源、项目交付与企业AIGC降本，速芯算力持续整理行业动态、政策方向与场景方法。',
  imageSrc: 'assets/materials/dashboard-panel.png',
  imageAlt: '算力运营数据面板',
}

const defaultNewsTopics: IconLinkSectionConfig = {
  title: '资讯分类',
  items: [
    { id: 'hardware-hosting', label: '算力硬件与托管', href: '#', iconClass: 'ri-cpu-line' },
    { id: 'green-park', label: '绿电园区共建', href: '#', iconClass: 'ri-leaf-line' },
    { id: 'enterprise-aigc', label: '企业AIGC应用', href: '#', iconClass: 'ri-magic-line' },
    { id: 'global-compute', label: '跨境算力出海', href: '#', iconClass: 'ri-global-line' },
  ],
}

const defaultNewsCards: Array<NewsCardItem> = [
  { id: 'hosting-stability', title: '智算机房托管如何评估稳定性', description: '从电力、散热、网络、运维响应与资产安全五个维度建立考察清单。', iconClass: 'ri-server-line' },
  { id: 'aigc-cost', title: '企业AIGC降本测算思路', description: '结合内容生产、客服、设计、投放与质检场景拆分算力需求。', iconClass: 'ri-line-chart-line' },
  { id: 'park-steps', title: '园区共建项目的合作节点', description: '梳理从资源评估、方案测算、机房建设到渠道招商的推进路径。', iconClass: 'ri-building-4-line' },
]

const defaultCooperationHero: PageHeroConfig = {
  title: '招商合作',
  subtitle: '企业算力采购 | 硬件投资人 | 渠道合伙人 | 园区政企共建 | 海外算力服务商',
}

const defaultPartnerCards: Array<IconLinkItem> = [
  { id: 'enterprise-buy', label: '企业算力采购', href: '#forms', iconClass: 'ri-shield-check-line' },
  { id: 'hardware-investor', label: '硬件个人投资人', href: '#forms', iconClass: 'ri-user-location-line' },
  { id: 'regional-channel', label: '渠道区域合伙人', href: '#forms', iconClass: 'ri-global-line' },
  { id: 'park-government', label: '园区政企共建', href: '#forms', iconClass: 'ri-shield-star-line' },
  { id: 'overseas-provider', label: '海外算力服务商', href: '#forms', iconClass: 'ri-shield-check-line' },
]

const defaultCooperationForms: Array<FormPanelConfig> = [
  {
    id: 'partner-intent',
    title: '合作意向登记表单',
    titleIconClass: 'ri-arrow-right-s-line',
    buttonLabel: '提交合作意向',
    fields: [
      { id: 'name', label: '姓名', placeholder: '姓名', suffixIconClass: '', wide: false },
      { id: 'phone', label: '电话', placeholder: '电话', suffixIconClass: 'ri-arrow-down-s-line', wide: false },
      { id: 'partner-type', label: '伙伴类型', placeholder: '渠道 / 投资 / 园区', suffixIconClass: 'ri-arrow-down-s-line', wide: false },
      { id: 'industry', label: '所在行业', placeholder: '企业 / 能源 / 海外', suffixIconClass: 'ri-arrow-down-s-line', wide: false },
      { id: 'compute-need', label: '算力需求', placeholder: '采购 / 托管 / 租赁', suffixIconClass: '', wide: false },
      { id: 'budget', label: '预算范围', placeholder: '预算或采购规模', suffixIconClass: '', wide: false },
    ],
  },
  {
    id: 'visit-intent',
    title: '机房实地考察预约表单',
    titleIconClass: 'ri-arrow-right-s-line',
    buttonLabel: '提交考察预约',
    fields: [
      { id: 'contact', label: '联系方式', placeholder: '联系方式', suffixIconClass: 'ri-arrow-down-s-line', wide: true },
      { id: 'visitors', label: '到访人数', placeholder: '到访人数', suffixIconClass: 'ri-arrow-down-s-line', wide: false },
      { id: 'time', label: '意向', placeholder: '意向到访时间', suffixIconClass: '', wide: false },
      { id: 'focus', label: '考察重点', placeholder: '机房 / 电力', suffixIconClass: '', wide: false },
      { id: 'remark', label: '备注需求', placeholder: '托管 / 渠道政策', suffixIconClass: '', wide: false },
    ],
  },
]

const defaultCooperationDownloads: DownloadSectionConfig = {
  title: '合作资料下载区',
  items: [
    { id: 'hardware-5090', label: '5090硬件参数', href: '#' },
    { id: 'revenue-sheet', label: '收益测算表', href: '#' },
    { id: 'channel-policy', label: '渠道招商政策', href: '#' },
    { id: 'park-plan', label: '园区合作方案', href: '#' },
  ],
}

const defaultGalleryHero: PageHeroConfig = {
  title: '实景图库',
  subtitle: '机房环境 | 绿电园区 | 算力设备 | 项目交付现场',
}

const defaultGalleryPhotos: Array<PhotoCardItem> = [
  { id: 'server-room', title: '智算机房托管区', description: '标准化机柜、供配电、网络与运维动线实景。', imageSrc: 'assets/materials/server-room.png', imageAlt: '绿色智算机房', featured: true },
  { id: 'green-park', title: '绿电园区航拍', description: '园区资源与算力基础设施协同建设场景。', imageSrc: 'assets/materials/factory-aerial.png', imageAlt: '绿电园区航拍', featured: false },
  { id: 'gpu-hardware', title: 'GPU算力硬件', description: '面向企业AIGC、视觉、渲染与推理任务。', imageSrc: 'assets/materials/hero-chip.png', imageAlt: 'GPU算力硬件', featured: false },
  { id: 'grid-floor', title: '机房地板与线缆', description: '高密度部署下的布线与散热空间。', imageSrc: 'assets/materials/grid-floor.png', imageAlt: '机房地板与线缆', featured: false },
  { id: 'certificates', title: '项目资质材料', description: '合作考察、渠道招商与园区对接资料。', imageSrc: 'assets/materials/certificates.png', imageAlt: '资质文件', featured: false },
  { id: 'delivery-team', title: '交付与运维团队', description: '从方案测算、设备交付到现场运维的协作支持。', imageSrc: 'assets/materials/team-portraits.png', imageAlt: '交付团队', featured: true },
]

const defaultPageHeroes: Partial<Record<AdminSection, PageHeroConfig>> = {
  pageAbout: defaultAboutHero,
  pageBusiness: defaultBusinessHero,
  pageConsult: defaultConsultHero,
  pageCases: defaultCasesHero,
  pageNews: defaultNewsHero,
  pageCooperation: defaultCooperationHero,
  pageGallery: defaultGalleryHero,
}

const legacyPageHeroDefaults: Partial<Record<AdminSection, PageHeroConfig>> = {
  pageAbout: {
    title: '关于速芯',
    subtitle: '聚焦绿电算力基础设施，连接硬件、机房、场景与产业合作。',
  },
  pageBusiness: {
    title: '核心业务',
    subtitle: 'GPU算力硬件销售、智算机房托管、企业AIGC降本与跨境算力出海。',
  },
  pageConsult: {
    title: '应用场景',
    subtitle: '面向电商、MCN、广告、工业质检、政务与文旅场景快速匹配算力方案。',
  },
  pageCases: {
    title: '项目案例',
    subtitle: '展示园区、本地企业、跨境业务和智算机房合作案例。',
  },
  pageNews: {
    title: '资讯中心',
    subtitle: '发布算力基础设施、行业动态、项目交付和技术观察。',
  },
  pageCooperation: {
    title: '招商合作',
    subtitle: '面向渠道伙伴、园区资源、机房合作与联合交付开放合作入口。',
  },
  pageGallery: {
    title: '实景图库',
    subtitle: '集中展示机房、设备、项目现场和合作空间实景素材。',
  },
}

const topNav: Array<{ label: string; section: AdminSection }> = [
  { label: '导航设置', section: 'navigation' },
  { label: '页面设置', section: 'pageHome' },
  { label: '页脚配置', section: 'footer' },
]

const primaryNav = [
  { label: '导航设置', icon: GalleryVerticalEnd, section: 'navigation' },
  { label: 'Logo / 标题 Logo', icon: Image, section: 'branding' },
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

const modules: Record<AdminSection, ModuleConfig> = {
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

function heroField(defaultValue: PageHeroConfig): EditableField {
  return {
    id: 'hero',
    label: '页面头部',
    type: 'page-hero',
    defaultValue,
    hint: '对应前台页面顶部 h1 与说明文字',
  }
}

const homeBlockFields: Array<EditableField> = [
  {
    id: 'carouselSlides',
    label: '首屏轮播',
    type: 'home-carousel',
    defaultValue: defaultHomeCarouselSlides,
    hint: '对应前台首页首屏轮播：图片、标题、说明、两个按钮',
  },
  {
    id: 'featureCards',
    label: '顶部推荐卡',
    type: 'home-feature-cards',
    defaultValue: defaultHomeFeatureCards,
    hint: '对应首屏下方 4 个横向推荐入口',
  },
  {
    id: 'businessEntrances',
    label: '四大业务入口',
    type: 'home-entrances',
    defaultValue: defaultHomeEntrances,
    hint: '对应「四大业务入口」卡片里的 4 个小入口',
  },
  {
    id: 'mediaCards',
    label: '图文内容卡',
    type: 'home-media-cards',
    defaultValue: defaultHomeMediaCards,
    hint: '对应首页下方「应用场景」「资讯中心」两张图片卡',
  },
]

const aboutBlockFields: Array<EditableField> = [
  heroField(defaultAboutHero),
  {
    id: 'intro',
    label: '企业简介模块',
    type: 'about-intro',
    defaultValue: defaultAboutIntro,
    hint: '对应关于页简介图文：标题、两段文案、高亮标签、右侧图片',
  },
  {
    id: 'timeline',
    label: '发展历程',
    type: 'label-list',
    defaultValue: defaultAboutTimeline,
    hint: '对应关于页发展历程横向步骤，列表顺序会同步前台',
  },
  {
    id: 'panels',
    label: '实力 / 团队 / 资证卡片',
    type: 'about-panels',
    defaultValue: defaultAboutPanels,
    hint: '对应关于页底部三块内容：企业实力标签、团队图、资证图',
  },
]

const businessBlockFields: Array<EditableField> = [
  heroField(defaultBusinessHero),
  {
    id: 'businessCards',
    label: '业务服务卡片',
    type: 'business-cards',
    defaultValue: defaultBusinessCards,
    hint: '对应核心业务页 6 张业务卡：图标、标题、描述、按钮与跳转',
  },
  {
    id: 'bookingForm',
    label: '业务对接预约条',
    type: 'booking-form',
    defaultValue: defaultBusinessBooking,
    hint: '对应业务页底部预约横条：标签、两个输入占位和提交按钮',
  },
]

const consultBlockFields: Array<EditableField> = [
  heroField(defaultConsultHero),
  {
    id: 'quickLinks',
    label: '场景快捷入口',
    type: 'icon-links',
    defaultValue: defaultConsultQuickLinks,
    hint: '对应应用场景页顶部 5 个场景入口',
  },
  {
    id: 'formPanels',
    label: '咨询 / 考察表单',
    type: 'form-panels',
    defaultValue: defaultConsultForms,
    hint: '对应应用场景页两个表单面板，字段标签与占位文案都可维护',
  },
  {
    id: 'downloadSection',
    label: '场景资料下载',
    type: 'downloads',
    defaultValue: defaultConsultDownloads,
    hint: '对应应用场景页资料下载区标题与 4 个下载入口',
  },
]

const casesBlockFields: Array<EditableField> = [
  heroField(defaultCasesHero),
  {
    id: 'tabs',
    label: '案例分类标签',
    type: 'label-list',
    defaultValue: defaultCaseTabs,
    hint: '对应案例页顶部三个分类标签，第一项为默认高亮',
  },
  {
    id: 'filters',
    label: '案例筛选项',
    type: 'filters',
    defaultValue: defaultCaseFilters,
    hint: '对应案例页左侧筛选栏：图标、名称和右侧展开图标',
  },
  {
    id: 'caseCards',
    label: '案例卡片',
    type: 'case-cards',
    defaultValue: defaultCaseCards,
    hint: '对应案例页 8 张案例卡：标签、角标、图片、标题和状态',
  },
  {
    id: 'downloadCta',
    label: '案例资料按钮',
    type: 'download-cta',
    defaultValue: defaultCaseDownload,
    hint: '对应案例页底部「全部案例资料下载」按钮',
  },
]

const newsBlockFields: Array<EditableField> = [
  heroField(defaultNewsHero),
  {
    id: 'leadArticle',
    label: '头条资讯',
    type: 'news-lead',
    defaultValue: defaultNewsLead,
    hint: '对应资讯页左侧大图头条：图片、分类、标题与摘要',
  },
  {
    id: 'topics',
    label: '资讯分类',
    type: 'icon-link-section',
    defaultValue: defaultNewsTopics,
    hint: '对应资讯页右侧分类区：标题、图标、分类名称和跳转',
  },
  {
    id: 'newsCards',
    label: '资讯卡片',
    type: 'news-cards',
    defaultValue: defaultNewsCards,
    hint: '对应资讯页下方 3 张资讯卡片',
  },
]

const cooperationBlockFields: Array<EditableField> = [
  heroField(defaultCooperationHero),
  {
    id: 'partnerCards',
    label: '合作类型入口',
    type: 'icon-links',
    defaultValue: defaultPartnerCards,
    hint: '对应招商合作页顶部 5 个合作类型入口',
  },
  {
    id: 'formPanels',
    label: '合作 / 考察表单',
    type: 'form-panels',
    defaultValue: defaultCooperationForms,
    hint: '对应招商合作页两个表单面板',
  },
  {
    id: 'downloadSection',
    label: '合作资料下载',
    type: 'downloads',
    defaultValue: defaultCooperationDownloads,
    hint: '对应招商合作页资料下载区标题与 4 个下载入口',
  },
]

const galleryBlockFields: Array<EditableField> = [
  heroField(defaultGalleryHero),
  {
    id: 'photos',
    label: '图库照片',
    type: 'photos',
    defaultValue: defaultGalleryPhotos,
    hint: '对应实景图库 6 张图文照片，勾选重点图会占更宽栅格',
  },
]

const editableSections: Record<AdminSection, { title: string; fields: Array<EditableField> }> = {
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
        id: 'logoImageSrc',
        label: 'Logo 图片链接 / 文件路径',
        type: 'text',
        defaultValue: DEFAULT_LOGO_IMAGE_SRC,
        hint: `当前项目 Logo：${DEFAULT_LOGO_IMAGE_SRC}；也可替换为 https://... 外链`,
      },
      {
        id: 'logoIconClass',
        label: '当前图标 Class',
        type: 'text',
        defaultValue: 'ri-stack-line',
        hint: '当前前台引用的是 Remix Icon 的 ri-stack-line，可替换为其它图标 class',
      },
      { id: 'logoImageSize', label: 'Logo 图大小(px)', type: 'text', defaultValue: '34' },
      { id: 'logoTextSize', label: 'Logo 文案大小(px)', type: 'text', defaultValue: '21' },
      { id: 'showBrandMark', label: '显示图标标记', type: 'toggle', defaultValue: true },
      { id: 'titleLogoText', label: '标题 Logo 文案', type: 'text', defaultValue: '绿电算力基础设施服务商' },
    ],
  },
  footer: {
    title: '页脚配置',
    fields: [
      {
        id: 'menuItems',
        label: '页脚菜单',
        type: 'footer-menu-list',
        defaultValue: defaultFooterMenuItems,
        hint: '每一行左侧是页脚菜单文案，右侧是跳转链接；拖动行可以调整前台页脚顺序',
      },
    ],
  },
  pageHome: {
    title: '首页配置',
    fields: homeBlockFields,
  },
  pageAbout: {
    title: '关于速芯配置',
    fields: aboutBlockFields,
  },
  pageBusiness: {
    title: '核心业务配置',
    fields: businessBlockFields,
  },
  pageConsult: {
    title: '应用场景配置',
    fields: consultBlockFields,
  },
  pageCases: {
    title: '项目案例配置',
    fields: casesBlockFields,
  },
  pageNews: {
    title: '资讯中心配置',
    fields: newsBlockFields,
  },
  pageCooperation: {
    title: '招商合作配置',
    fields: cooperationBlockFields,
  },
  pageGallery: {
    title: '实景图库配置',
    fields: galleryBlockFields,
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

function migrateLegacyFooterSection(section?: Record<string, FieldValue>) {
  if (!section || Array.isArray(section.menuItems)) {
    return section
  }

  const legacyItems = [
    ['phone', 'phoneHref', 'phoneNewTab'],
    ['wechat', 'wechatHref', 'wechatNewTab'],
    ['address', 'addressHref', 'addressNewTab'],
    ['videoConsult', 'videoConsultHref', 'videoConsultNewTab'],
  ] as const

  return {
    ...section,
    menuItems: legacyItems.map(([labelKey, hrefKey, newTabKey], index) => ({
      id: defaultFooterMenuItems[index]?.id ?? `footer-${index + 1}`,
      label: String(section[labelKey] || defaultFooterMenuItems[index]?.label || `菜单 ${index + 1}`),
      href: String(section[hrefKey] || defaultFooterMenuItems[index]?.href || 'index.html'),
      newTab: Boolean(section[newTabKey]),
    })),
  }
}

function migrateLegacyHomeSection(section?: Record<string, FieldValue>) {
  if (!section || Array.isArray(section.carouselSlides)) {
    return section
  }

  const heroTitle = String(section.heroTitle || defaultHomeCarouselSlides[0].title)
  const heroSubtitle = String(section.heroSubtitle || defaultHomeCarouselSlides[0].subtitle)
  const primaryCtaLabel = String(section.primaryCtaLabel || defaultHomeCarouselSlides[0].primaryLabel)
  const secondaryCtaLabel = String(section.secondaryCtaLabel || defaultHomeCarouselSlides[0].secondaryLabel)

  return {
    ...section,
    carouselSlides: [
      {
        ...defaultHomeCarouselSlides[0],
        title: heroTitle,
        subtitle: heroSubtitle,
        primaryLabel: primaryCtaLabel,
        secondaryLabel: secondaryCtaLabel,
      },
      ...defaultHomeCarouselSlides.slice(1),
    ],
    featureCards: defaultHomeFeatureCards,
    businessEntrances: defaultHomeEntrances,
    mediaCards: defaultHomeMediaCards,
  }
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function migrateLegacyPageSection(section: Record<string, FieldValue> | undefined, sectionId: AdminSection) {
  if (!section) {
    return section
  }

  const defaultHero = defaultPageHeroes[sectionId]
  if (!defaultHero) {
    return section
  }

  const legacyHero = legacyPageHeroDefaults[sectionId]
  const currentHero = isRecordValue(section.hero) ? section.hero : undefined
  const savedTitle = String(currentHero?.title || section.heroTitle || '')
  const savedSubtitle = String(currentHero?.subtitle || section.heroSubtitle || '')
  const title = !savedTitle || savedTitle === legacyHero?.title ? defaultHero.title : savedTitle
  const subtitle = !savedSubtitle || savedSubtitle === legacyHero?.subtitle ? defaultHero.subtitle : savedSubtitle

  return {
    ...section,
    hero: { title, subtitle },
  }
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

    const parsed = JSON.parse(saved) as {
      sections?: Partial<AdminFormState> & { blocks?: Record<string, FieldValue> }
    }
    const savedSections = parsed.sections ?? {}
    const savedBranding = savedSections.branding
    if (savedBranding && savedBranding.logoImageSrc === '') {
      savedBranding.logoImageSrc = DEFAULT_LOGO_IMAGE_SRC
    }
    savedSections.footer = migrateLegacyFooterSection(savedSections.footer as Record<string, FieldValue>)
    savedSections.pageHome = migrateLegacyHomeSection(savedSections.pageHome as Record<string, FieldValue>)
    ;([
      'pageAbout',
      'pageBusiness',
      'pageConsult',
      'pageCases',
      'pageNews',
      'pageCooperation',
      'pageGallery',
    ] as Array<AdminSection>).forEach((section) => {
      savedSections[section] = migrateLegacyPageSection(
        savedSections[section] as Record<string, FieldValue> | undefined,
        section,
      )
    })

    return Object.fromEntries(
      Object.entries(fallback).map(([section, values]) => [
        section,
        {
          ...values,
          ...(section === 'pageHome' ? (savedSections.blocks ?? {}) : {}),
          ...(savedSections[section as AdminSection] ?? {}),
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
  const [activeSection, setActiveSection] = useState<AdminSection>('navigation')
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

  const updateConfigField = (section: AdminSection, fieldId: string, value: FieldValue) => {
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
              aria-current={isTopNavActive(item.section, activeSection) ? 'page' : undefined}
              className={isTopNavActive(item.section, activeSection) ? 'active' : ''}
              data-section={item.section}
              key={item.label}
              onClick={() => selectSection(item.section)}
              type="button"
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
        <p className="nav-group">配置管理</p>
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
        <ModulePage
          activeSection={activeSection}
          formValues={configState[activeSection]}
          lastSavedAt={lastSavedAt}
          onConfigChange={updateConfigField}
          table={table}
          leadView={leadView}
          setLeadView={setLeadView}
        />
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

        <p className="nav-group">配置管理</p>
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
            <button
              key={item.label}
              onClick={() => onSelect(item.section as AdminSection)}
              type="button"
            >
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
            aria-current={activeSection === item.section ? 'page' : undefined}
            aria-label={item.label}
            className={activeSection === item.section ? 'nav-item active' : 'nav-item'}
            data-section={item.section}
            key={item.label}
            onClick={() => onSelect(item.section)}
            type="button"
          >
            <Icon size={18} aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
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
  activeSection: AdminSection
  formValues: Record<string, FieldValue>
  lastSavedAt: string
  onConfigChange: (section: AdminSection, fieldId: string, value: FieldValue) => void
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
  activeSection: AdminSection
  formValues: Record<string, FieldValue>
  lastSavedAt: string
  onChange: (section: AdminSection, fieldId: string, value: FieldValue) => void
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

function listValue<T>(value: FieldValue, fallback: Array<T>): Array<T> {
  return Array.isArray(value) ? (value as Array<T>) : fallback
}

function objectValue<T extends object>(value: FieldValue, fallback: T): T {
  return isRecordValue(value) ? ({ ...fallback, ...value } as T) : fallback
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
        value={Array.isArray(value) ? (value as Array<NavigationMenuItem>) : defaultNavigationItems}
      />
    )
  }

  if (field.type === 'footer-menu-list') {
    return (
      <FooterMenuEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? (value as Array<FooterMenuItem>) : defaultFooterMenuItems}
      />
    )
  }

  if (field.type === 'home-carousel') {
    return (
      <HomeCarouselEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? (value as Array<HomeCarouselSlide>) : defaultHomeCarouselSlides}
      />
    )
  }

  if (field.type === 'home-feature-cards') {
    return (
      <HomeFeatureCardsEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? (value as Array<HomeFeatureCard>) : defaultHomeFeatureCards}
      />
    )
  }

  if (field.type === 'home-entrances') {
    return (
      <HomeEntrancesEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? (value as Array<HomeEntranceItem>) : defaultHomeEntrances}
      />
    )
  }

  if (field.type === 'home-media-cards') {
    return (
      <HomeMediaCardsEditor
        field={field}
        onChange={onChange}
        value={Array.isArray(value) ? (value as Array<HomeMediaCard>) : defaultHomeMediaCards}
      />
    )
  }

  if (field.type === 'page-hero') {
    return (
      <PageHeroEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as PageHeroConfig)}
      />
    )
  }

  if (field.type === 'about-intro') {
    return (
      <AboutIntroEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as AboutIntroConfig)}
      />
    )
  }

  if (field.type === 'label-list') {
    return (
      <LabelListEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as LabelListConfig)}
      />
    )
  }

  if (field.type === 'about-panels') {
    return (
      <AboutPanelsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<AboutPanelConfig>)}
      />
    )
  }

  if (field.type === 'business-cards') {
    return (
      <BusinessCardsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<BusinessCardItem>)}
      />
    )
  }

  if (field.type === 'booking-form') {
    return (
      <BookingFormEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as InlineBookingConfig)}
      />
    )
  }

  if (field.type === 'icon-links') {
    return (
      <IconLinksEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<IconLinkItem>)}
      />
    )
  }

  if (field.type === 'icon-link-section') {
    return (
      <IconLinkSectionEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as IconLinkSectionConfig)}
      />
    )
  }

  if (field.type === 'form-panels') {
    return (
      <FormPanelsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<FormPanelConfig>)}
      />
    )
  }

  if (field.type === 'downloads') {
    return (
      <DownloadSectionEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as DownloadSectionConfig)}
      />
    )
  }

  if (field.type === 'download-cta') {
    return (
      <DownloadCtaEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as DownloadItem)}
      />
    )
  }

  if (field.type === 'filters') {
    return (
      <FiltersEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<FilterItem>)}
      />
    )
  }

  if (field.type === 'case-cards') {
    return (
      <CaseCardsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<CaseCardItem>)}
      />
    )
  }

  if (field.type === 'news-lead') {
    return (
      <NewsLeadEditor
        field={field}
        onChange={onChange}
        value={objectValue(value, field.defaultValue as NewsLeadConfig)}
      />
    )
  }

  if (field.type === 'news-cards') {
    return (
      <NewsCardsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<NewsCardItem>)}
      />
    )
  }

  if (field.type === 'photos') {
    return (
      <PhotoCardsEditor
        field={field}
        onChange={onChange}
        value={listValue(value, field.defaultValue as Array<PhotoCardItem>)}
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

function FooterMenuEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<FooterMenuItem>
  onChange: (value: Array<FooterMenuItem>) => void
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const updateItem = (id: string, patch: Partial<FooterMenuItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const addItem = () => {
    const nextIndex = value.length + 1
    onChange([
      ...value,
      {
        id: `footer-custom-${Date.now()}`,
        label: `新菜单 ${nextIndex}`,
        href: 'index.html',
        newTab: false,
      },
    ])
  }

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id))
  }

  const moveItem = (fromId: string, toId: string) => {
    if (fromId === toId) return

    const fromIndex = value.findIndex((item) => item.id === fromId)
    const toIndex = value.findIndex((item) => item.id === toId)
    if (fromIndex < 0 || toIndex < 0) return

    const nextItems = [...value]
    const [movedItem] = nextItems.splice(fromIndex, 1)
    nextItems.splice(toIndex, 0, movedItem)
    onChange(nextItems)
  }

  return (
    <div className="menu-editor footer-menu-editor span-2">
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
          <div
            className={`menu-edit-row footer-menu-row${draggingId === item.id ? ' is-dragging' : ''}`}
            draggable
            key={item.id}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => event.preventDefault()}
            onDragStart={(event) => {
              setDraggingId(item.id)
              event.dataTransfer.effectAllowed = 'move'
              event.dataTransfer.setData('text/plain', item.id)
            }}
            onDrop={(event) => {
              event.preventDefault()
              moveItem(event.dataTransfer.getData('text/plain') || draggingId || '', item.id)
              setDraggingId(null)
            }}
          >
            <span className="menu-order drag-handle" aria-label={`拖动第 ${index + 1} 项排序`}>
              <GripVertical size={16} aria-hidden="true" />
              <span>{index + 1}</span>
            </span>
            <label className="menu-cell">
              <span>菜单文案</span>
              <input
                onChange={(event) => updateItem(item.id, { label: event.target.value })}
                value={item.label}
              />
            </label>
            <label className="menu-cell">
              <span>跳转链接</span>
              <input
                onChange={(event) => updateItem(item.id, { href: event.target.value })}
                placeholder="index.html 或 https://..."
                value={item.href}
              />
            </label>
            <label className="menu-visible">
              <input
                checked={item.newTab}
                onChange={(event) => updateItem(item.id, { newTab: event.target.checked })}
                type="checkbox"
              />
              <span>新页面</span>
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

function HomeCarouselEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<HomeCarouselSlide>
  onChange: (value: Array<HomeCarouselSlide>) => void
}) {
  const updateSlide = (id: string, patch: Partial<HomeCarouselSlide>) => {
    onChange(value.map((slide) => (slide.id === id ? { ...slide, ...patch } : slide)))
  }

  return (
    <div className="home-module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="home-slide-grid">
        {value.map((slide, index) => (
          <article className="home-slide-editor" key={slide.id}>
            <div className="home-module-kicker">轮播 {index + 1}</div>
            <label className="menu-cell span-2">
              <span>标题文案</span>
              <input value={slide.title} onChange={(event) => updateSlide(slide.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell span-2">
              <span>说明文案</span>
              <textarea value={slide.subtitle} onChange={(event) => updateSlide(slide.id, { subtitle: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>主按钮</span>
              <input value={slide.primaryLabel} onChange={(event) => updateSlide(slide.id, { primaryLabel: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>主按钮链接</span>
              <input value={slide.primaryHref} onChange={(event) => updateSlide(slide.id, { primaryHref: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>次按钮</span>
              <input value={slide.secondaryLabel} onChange={(event) => updateSlide(slide.id, { secondaryLabel: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>次按钮链接</span>
              <input value={slide.secondaryHref} onChange={(event) => updateSlide(slide.id, { secondaryHref: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片路径</span>
              <input value={slide.imageSrc} onChange={(event) => updateSlide(slide.id, { imageSrc: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片说明</span>
              <input value={slide.imageAlt} onChange={(event) => updateSlide(slide.id, { imageAlt: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function HomeFeatureCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<HomeFeatureCard>
  onChange: (value: Array<HomeFeatureCard>) => void
}) {
  const updateCard = (id: string, patch: Partial<HomeFeatureCard>) => {
    onChange(value.map((card) => (card.id === id ? { ...card, ...patch } : card)))
  }

  return (
    <div className="home-module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="home-compact-grid">
        {value.map((card, index) => (
          <article className="home-compact-editor" key={card.id}>
            <div className="home-module-kicker">推荐卡 {index + 1}</div>
            <label className="menu-cell">
              <span>标题</span>
              <input value={card.title} onChange={(event) => updateCard(card.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>副文案</span>
              <input value={card.subtitle} onChange={(event) => updateCard(card.id, { subtitle: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>跳转链接</span>
              <input value={card.href} onChange={(event) => updateCard(card.id, { href: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图标 Class</span>
              <input value={card.iconClass} onChange={(event) => updateCard(card.id, { iconClass: event.target.value })} />
            </label>
            <label className="menu-visible">
              <input
                checked={card.highlighted}
                onChange={(event) => updateCard(card.id, { highlighted: event.target.checked })}
                type="checkbox"
              />
              <span>高亮</span>
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function HomeEntrancesEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<HomeEntranceItem>
  onChange: (value: Array<HomeEntranceItem>) => void
}) {
  const updateItem = (id: string, patch: Partial<HomeEntranceItem>) => {
    onChange(value.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="home-module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="home-compact-grid">
        {value.map((item, index) => (
          <article className="home-compact-editor" key={item.id}>
            <div className="home-module-kicker">入口 {index + 1}</div>
            <label className="menu-cell">
              <span>入口文案</span>
              <input value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>跳转链接</span>
              <input value={item.href} onChange={(event) => updateItem(item.id, { href: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图标 Class</span>
              <input value={item.iconClass} onChange={(event) => updateItem(item.id, { iconClass: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function HomeMediaCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<HomeMediaCard>
  onChange: (value: Array<HomeMediaCard>) => void
}) {
  const updateCard = (id: string, patch: Partial<HomeMediaCard>) => {
    onChange(value.map((card) => (card.id === id ? { ...card, ...patch } : card)))
  }

  return (
    <div className="home-module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="home-compact-grid two-up">
        {value.map((card, index) => (
          <article className="home-compact-editor" key={card.id}>
            <div className="home-module-kicker">图文卡 {index + 1}</div>
            <label className="menu-cell">
              <span>区块标题</span>
              <input value={card.title} onChange={(event) => updateCard(card.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片路径</span>
              <input value={card.imageSrc} onChange={(event) => updateCard(card.id, { imageSrc: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片说明</span>
              <input value={card.imageAlt} onChange={(event) => updateCard(card.id, { imageAlt: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function makeEditorId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

function updateListItem<T extends { id: string }>(items: Array<T>, id: string, patch: Partial<T>) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

function removeListItem<T extends { id: string }>(items: Array<T>, id: string) {
  return items.filter((item) => item.id !== id)
}

function moveListItem<T extends { id: string }>(items: Array<T>, id: string, direction: -1 | 1) {
  const index = items.findIndex((item) => item.id === id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) {
    return items
  }

  const nextItems = [...items]
  const [item] = nextItems.splice(index, 1)
  nextItems.splice(nextIndex, 0, item)
  return nextItems
}

function RowActions({
  canMoveDown,
  canMoveUp,
  canRemove,
  onMoveDown,
  onMoveUp,
  onRemove,
}: {
  canMoveDown: boolean
  canMoveUp: boolean
  canRemove: boolean
  onMoveDown: () => void
  onMoveUp: () => void
  onRemove: () => void
}) {
  return (
    <div className="module-actions">
      <button disabled={!canMoveUp} onClick={onMoveUp} type="button">
        上移
      </button>
      <button disabled={!canMoveDown} onClick={onMoveDown} type="button">
        下移
      </button>
      <button className="danger-inline" disabled={!canRemove} onClick={onRemove} type="button">
        删除
      </button>
    </div>
  )
}

function PageHeroEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: PageHeroConfig
  onChange: (value: PageHeroConfig) => void
}) {
  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <article className="module-card two-column">
        <label className="menu-cell">
          <span>页面标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>页面说明</span>
          <textarea value={value.subtitle} onChange={(event) => onChange({ ...value, subtitle: event.target.value })} />
        </label>
      </article>
    </div>
  )
}

function AboutIntroEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: AboutIntroConfig
  onChange: (value: AboutIntroConfig) => void
}) {
  const updateParagraph = (index: number, paragraph: string) => {
    const paragraphs = [...value.paragraphs]
    paragraphs[index] = paragraph
    onChange({ ...value, paragraphs })
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <article className="module-card two-column">
        <label className="menu-cell">
          <span>区块标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>高亮标签</span>
          <input value={value.highlight} onChange={(event) => onChange({ ...value, highlight: event.target.value })} />
        </label>
        <label className="menu-cell span-2">
          <span>简介段落 1</span>
          <textarea value={value.paragraphs[0] ?? ''} onChange={(event) => updateParagraph(0, event.target.value)} />
        </label>
        <label className="menu-cell span-2">
          <span>简介段落 2</span>
          <textarea value={value.paragraphs[1] ?? ''} onChange={(event) => updateParagraph(1, event.target.value)} />
        </label>
        <label className="menu-cell">
          <span>图片路径</span>
          <input value={value.imageSrc} onChange={(event) => onChange({ ...value, imageSrc: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>图片说明</span>
          <input value={value.imageAlt} onChange={(event) => onChange({ ...value, imageAlt: event.target.value })} />
        </label>
      </article>
    </div>
  )
}

function LabelListEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: LabelListConfig
  onChange: (value: LabelListConfig) => void
}) {
  const updateItems = (items: Array<LabelItem>) => onChange({ ...value, items })
  const addItem = () => {
    updateItems([...value.items, { id: makeEditorId('label'), label: `新条目 ${value.items.length + 1}` }])
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增条目</button>}
        field={field}
      />
      <article className="module-card">
        <label className="menu-cell">
          <span>区块标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <div className="module-list">
          {value.items.map((item, index) => (
            <div className="module-list-row" key={item.id}>
              <span className="menu-order">{index + 1}</span>
              <label className="menu-cell">
                <span>条目文案</span>
                <input
                  value={item.label}
                  onChange={(event) => updateItems(updateListItem(value.items, item.id, { label: event.target.value }))}
                />
              </label>
              <RowActions
                canMoveDown={index < value.items.length - 1}
                canMoveUp={index > 0}
                canRemove={value.items.length > 1}
                onMoveDown={() => updateItems(moveListItem(value.items, item.id, 1))}
                onMoveUp={() => updateItems(moveListItem(value.items, item.id, -1))}
                onRemove={() => updateItems(removeListItem(value.items, item.id))}
              />
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function AboutPanelsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<AboutPanelConfig>
  onChange: (value: Array<AboutPanelConfig>) => void
}) {
  const updatePanel = (id: string, patch: Partial<AboutPanelConfig>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="module-grid">
        {value.map((panel, index) => (
          <article className="module-card" key={panel.id}>
            <div className="module-card-title">
              <span>卡片 {index + 1}</span>
            </div>
            <label className="menu-cell">
              <span>标题</span>
              <input value={panel.title} onChange={(event) => updatePanel(panel.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>内容类型</span>
              <select
                value={panel.variant}
                onChange={(event) => updatePanel(panel.id, { variant: event.target.value as AboutPanelConfig['variant'] })}
              >
                <option value="chips">实力标签</option>
                <option value="image">图片</option>
              </select>
            </label>
            {panel.variant === 'chips' ? (
              <label className="menu-cell">
                <span>标签文案（用 | 分隔）</span>
                <input
                  value={panel.chips.join(' | ')}
                  onChange={(event) => updatePanel(panel.id, {
                    chips: event.target.value.split('|').map((item) => item.trim()).filter(Boolean),
                  })}
                />
              </label>
            ) : (
              <>
                <label className="menu-cell">
                  <span>图片路径</span>
                  <input value={panel.imageSrc} onChange={(event) => updatePanel(panel.id, { imageSrc: event.target.value })} />
                </label>
                <label className="menu-cell">
                  <span>图片说明</span>
                  <input value={panel.imageAlt} onChange={(event) => updatePanel(panel.id, { imageAlt: event.target.value })} />
                </label>
              </>
            )}
          </article>
        ))}
      </div>
    </div>
  )
}

function BusinessCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<BusinessCardItem>
  onChange: (value: Array<BusinessCardItem>) => void
}) {
  const addCard = () => {
    onChange([
      ...value,
      {
        id: makeEditorId('business'),
        title: `新业务 ${value.length + 1}`,
        description: '补充业务说明',
        href: 'consult.html',
        linkLabel: '查看详情',
        iconClass: 'ri-links-line',
      },
    ])
  }

  const updateCard = (id: string, patch: Partial<BusinessCardItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addCard} type="button">新增业务</button>}
        field={field}
      />
      <div className="module-grid">
        {value.map((card, index) => (
          <article className="module-card two-column" key={card.id}>
            <div className="module-card-title">
              <span>业务卡 {index + 1}</span>
              <RowActions
                canMoveDown={index < value.length - 1}
                canMoveUp={index > 0}
                canRemove={value.length > 1}
                onMoveDown={() => onChange(moveListItem(value, card.id, 1))}
                onMoveUp={() => onChange(moveListItem(value, card.id, -1))}
                onRemove={() => onChange(removeListItem(value, card.id))}
              />
            </div>
            <label className="menu-cell">
              <span>标题</span>
              <input value={card.title} onChange={(event) => updateCard(card.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图标 Class</span>
              <input value={card.iconClass} onChange={(event) => updateCard(card.id, { iconClass: event.target.value })} />
            </label>
            <label className="menu-cell span-2">
              <span>描述</span>
              <textarea value={card.description} onChange={(event) => updateCard(card.id, { description: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>按钮文案</span>
              <input value={card.linkLabel} onChange={(event) => updateCard(card.id, { linkLabel: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>跳转链接</span>
              <input value={card.href} onChange={(event) => updateCard(card.id, { href: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function BookingFormEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: InlineBookingConfig
  onChange: (value: InlineBookingConfig) => void
}) {
  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <article className="module-card two-column">
        <label className="menu-cell">
          <span>左侧标签</span>
          <input value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>标签图标 Class</span>
          <input value={value.iconClass} onChange={(event) => onChange({ ...value, iconClass: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>姓名输入占位</span>
          <input value={value.namePlaceholder} onChange={(event) => onChange({ ...value, namePlaceholder: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>需求输入占位</span>
          <input value={value.demandPlaceholder} onChange={(event) => onChange({ ...value, demandPlaceholder: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>按钮文案</span>
          <input value={value.buttonLabel} onChange={(event) => onChange({ ...value, buttonLabel: event.target.value })} />
        </label>
      </article>
    </div>
  )
}

function IconLinksRows({
  value,
  onChange,
}: {
  value: Array<IconLinkItem>
  onChange: (value: Array<IconLinkItem>) => void
}) {
  const updateItem = (id: string, patch: Partial<IconLinkItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-grid compact">
      {value.map((item, index) => (
        <article className="module-card" key={item.id}>
          <div className="module-card-title">
            <span>入口 {index + 1}</span>
            <RowActions
              canMoveDown={index < value.length - 1}
              canMoveUp={index > 0}
              canRemove={value.length > 1}
              onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
              onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
              onRemove={() => onChange(removeListItem(value, item.id))}
            />
          </div>
          <label className="menu-cell">
            <span>入口文案</span>
            <input value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
          </label>
          <label className="menu-cell">
            <span>跳转链接</span>
            <input value={item.href} onChange={(event) => updateItem(item.id, { href: event.target.value })} />
          </label>
          <label className="menu-cell">
            <span>图标 Class</span>
            <input value={item.iconClass} onChange={(event) => updateItem(item.id, { iconClass: event.target.value })} />
          </label>
        </article>
      ))}
    </div>
  )
}

function IconLinksEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<IconLinkItem>
  onChange: (value: Array<IconLinkItem>) => void
}) {
  const addItem = () => {
    onChange([...value, { id: makeEditorId('icon-link'), label: `新入口 ${value.length + 1}`, href: '#', iconClass: 'ri-links-line' }])
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增入口</button>}
        field={field}
      />
      <IconLinksRows onChange={onChange} value={value} />
    </div>
  )
}

function IconLinkSectionEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: IconLinkSectionConfig
  onChange: (value: IconLinkSectionConfig) => void
}) {
  const addItem = () => {
    onChange({
      ...value,
      items: [...value.items, { id: makeEditorId('topic'), label: `新分类 ${value.items.length + 1}`, href: '#', iconClass: 'ri-links-line' }],
    })
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增分类</button>}
        field={field}
      />
      <article className="module-card">
        <label className="menu-cell">
          <span>区块标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
      </article>
      <IconLinksRows onChange={(items) => onChange({ ...value, items })} value={value.items} />
    </div>
  )
}

function FormPanelsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<FormPanelConfig>
  onChange: (value: Array<FormPanelConfig>) => void
}) {
  const updatePanel = (id: string, patch: Partial<FormPanelConfig>) => {
    onChange(updateListItem(value, id, patch))
  }

  const updateField = (panel: FormPanelConfig, fieldId: string, patch: Partial<FormFieldItem>) => {
    updatePanel(panel.id, { fields: updateListItem(panel.fields, fieldId, patch) })
  }

  const addFormField = (panel: FormPanelConfig) => {
    updatePanel(panel.id, {
      fields: [
        ...panel.fields,
        { id: makeEditorId('form-field'), label: `字段 ${panel.fields.length + 1}`, placeholder: '输入提示', suffixIconClass: '', wide: false },
      ],
    })
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <div className="module-grid one-up">
        {value.map((panel, index) => (
          <article className="module-card two-column" key={panel.id}>
            <div className="module-card-title">
              <span>表单 {index + 1}</span>
            </div>
            <label className="menu-cell">
              <span>表单标题</span>
              <input value={panel.title} onChange={(event) => updatePanel(panel.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>标题图标 Class</span>
              <input value={panel.titleIconClass} onChange={(event) => updatePanel(panel.id, { titleIconClass: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>按钮文案</span>
              <input value={panel.buttonLabel} onChange={(event) => updatePanel(panel.id, { buttonLabel: event.target.value })} />
            </label>
            <div className="module-sublist span-2">
              <div className="module-sublist-head">
                <strong>字段设置</strong>
                <button className="ghost-button" onClick={() => addFormField(panel)} type="button">
                  新增字段
                </button>
              </div>
              {panel.fields.map((item, fieldIndex) => (
                <div className="module-list-row form-field-row" key={item.id}>
                  <span className="menu-order">{fieldIndex + 1}</span>
                  <label className="menu-cell">
                    <span>字段名</span>
                    <input value={item.label} onChange={(event) => updateField(panel, item.id, { label: event.target.value })} />
                  </label>
                  <label className="menu-cell">
                    <span>占位文案</span>
                    <input value={item.placeholder} onChange={(event) => updateField(panel, item.id, { placeholder: event.target.value })} />
                  </label>
                  <label className="menu-cell">
                    <span>后缀图标</span>
                    <input value={item.suffixIconClass} onChange={(event) => updateField(panel, item.id, { suffixIconClass: event.target.value })} />
                  </label>
                  <label className="menu-visible">
                    <input checked={item.wide} onChange={(event) => updateField(panel, item.id, { wide: event.target.checked })} type="checkbox" />
                    <span>宽字段</span>
                  </label>
                  <RowActions
                    canMoveDown={fieldIndex < panel.fields.length - 1}
                    canMoveUp={fieldIndex > 0}
                    canRemove={panel.fields.length > 1}
                    onMoveDown={() => updatePanel(panel.id, { fields: moveListItem(panel.fields, item.id, 1) })}
                    onMoveUp={() => updatePanel(panel.id, { fields: moveListItem(panel.fields, item.id, -1) })}
                    onRemove={() => updatePanel(panel.id, { fields: removeListItem(panel.fields, item.id) })}
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function DownloadItemsRows({
  value,
  onChange,
}: {
  value: Array<DownloadItem>
  onChange: (value: Array<DownloadItem>) => void
}) {
  const updateItem = (id: string, patch: Partial<DownloadItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-list">
      {value.map((item, index) => (
        <div className="module-list-row" key={item.id}>
          <span className="menu-order">{index + 1}</span>
          <label className="menu-cell">
            <span>下载文案</span>
            <input value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
          </label>
          <label className="menu-cell">
            <span>跳转链接</span>
            <input value={item.href} onChange={(event) => updateItem(item.id, { href: event.target.value })} />
          </label>
          <RowActions
            canMoveDown={index < value.length - 1}
            canMoveUp={index > 0}
            canRemove={value.length > 1}
            onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
            onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
            onRemove={() => onChange(removeListItem(value, item.id))}
          />
        </div>
      ))}
    </div>
  )
}

function DownloadSectionEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: DownloadSectionConfig
  onChange: (value: DownloadSectionConfig) => void
}) {
  const addItem = () => {
    onChange({ ...value, items: [...value.items, { id: makeEditorId('download'), label: `资料 ${value.items.length + 1}`, href: '#' }] })
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增资料</button>}
        field={field}
      />
      <article className="module-card">
        <label className="menu-cell">
          <span>区块标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <DownloadItemsRows onChange={(items) => onChange({ ...value, items })} value={value.items} />
      </article>
    </div>
  )
}

function DownloadCtaEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: DownloadItem
  onChange: (value: DownloadItem) => void
}) {
  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <article className="module-card two-column">
        <label className="menu-cell">
          <span>按钮文案</span>
          <input value={value.label} onChange={(event) => onChange({ ...value, label: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>跳转链接</span>
          <input value={value.href} onChange={(event) => onChange({ ...value, href: event.target.value })} />
        </label>
      </article>
    </div>
  )
}

function FiltersEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<FilterItem>
  onChange: (value: Array<FilterItem>) => void
}) {
  const addItem = () => {
    onChange([...value, { id: makeEditorId('filter'), label: `筛选 ${value.length + 1}`, iconClass: 'ri-map-pin-line', trailingIconClass: '' }])
  }

  const updateItem = (id: string, patch: Partial<FilterItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增筛选</button>}
        field={field}
      />
      <div className="module-list">
        {value.map((item, index) => (
          <div className="module-list-row filter-row-editor" key={item.id}>
            <span className="menu-order">{index + 1}</span>
            <label className="menu-cell">
              <span>筛选名称</span>
              <input value={item.label} onChange={(event) => updateItem(item.id, { label: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>左侧图标</span>
              <input value={item.iconClass} onChange={(event) => updateItem(item.id, { iconClass: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>右侧图标</span>
              <input value={item.trailingIconClass} onChange={(event) => updateItem(item.id, { trailingIconClass: event.target.value })} />
            </label>
            <RowActions
              canMoveDown={index < value.length - 1}
              canMoveUp={index > 0}
              canRemove={value.length > 1}
              onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
              onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
              onRemove={() => onChange(removeListItem(value, item.id))}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CaseCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<CaseCardItem>
  onChange: (value: Array<CaseCardItem>) => void
}) {
  const addItem = () => {
    onChange([
      ...value,
      {
        id: makeEditorId('case'),
        tag: '01',
        corner: String(value.length + 1),
        imageSrc: 'assets/materials/case-1.png',
        imageAlt: '案例图片',
        title: `新案例 ${value.length + 1}`,
        status: '已发布',
        mutedStatus: false,
        highlighted: false,
      },
    ])
  }

  const updateItem = (id: string, patch: Partial<CaseCardItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增案例</button>}
        field={field}
      />
      <div className="module-grid one-up">
        {value.map((item, index) => (
          <article className="module-card two-column" key={item.id}>
            <div className="module-card-title">
              <span>案例 {index + 1}</span>
              <RowActions
                canMoveDown={index < value.length - 1}
                canMoveUp={index > 0}
                canRemove={value.length > 1}
                onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
                onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
                onRemove={() => onChange(removeListItem(value, item.id))}
              />
            </div>
            <label className="menu-cell">
              <span>左上标签</span>
              <input value={item.tag} onChange={(event) => updateItem(item.id, { tag: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>右上角标</span>
              <input value={item.corner} onChange={(event) => updateItem(item.id, { corner: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片路径</span>
              <input value={item.imageSrc} onChange={(event) => updateItem(item.id, { imageSrc: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片说明</span>
              <input value={item.imageAlt} onChange={(event) => updateItem(item.id, { imageAlt: event.target.value })} />
            </label>
            <label className="menu-cell span-2">
              <span>案例标题</span>
              <textarea value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>状态文案</span>
              <input value={item.status} onChange={(event) => updateItem(item.id, { status: event.target.value })} />
            </label>
            <label className="menu-visible">
              <input checked={item.highlighted} onChange={(event) => updateItem(item.id, { highlighted: event.target.checked })} type="checkbox" />
              <span>重点样式</span>
            </label>
            <label className="menu-visible">
              <input checked={item.mutedStatus} onChange={(event) => updateItem(item.id, { mutedStatus: event.target.checked })} type="checkbox" />
              <span>弱化状态</span>
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function NewsLeadEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: NewsLeadConfig
  onChange: (value: NewsLeadConfig) => void
}) {
  return (
    <div className="module-editor span-2">
      <ModuleEditorHead field={field} />
      <article className="module-card two-column">
        <label className="menu-cell">
          <span>分类标签</span>
          <input value={value.kicker} onChange={(event) => onChange({ ...value, kicker: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>标题</span>
          <input value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} />
        </label>
        <label className="menu-cell span-2">
          <span>摘要</span>
          <textarea value={value.description} onChange={(event) => onChange({ ...value, description: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>图片路径</span>
          <input value={value.imageSrc} onChange={(event) => onChange({ ...value, imageSrc: event.target.value })} />
        </label>
        <label className="menu-cell">
          <span>图片说明</span>
          <input value={value.imageAlt} onChange={(event) => onChange({ ...value, imageAlt: event.target.value })} />
        </label>
      </article>
    </div>
  )
}

function NewsCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<NewsCardItem>
  onChange: (value: Array<NewsCardItem>) => void
}) {
  const addItem = () => {
    onChange([...value, { id: makeEditorId('news'), title: `新资讯 ${value.length + 1}`, description: '补充资讯摘要', iconClass: 'ri-file-list-3-line' }])
  }

  const updateItem = (id: string, patch: Partial<NewsCardItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增资讯</button>}
        field={field}
      />
      <div className="module-grid">
        {value.map((item, index) => (
          <article className="module-card" key={item.id}>
            <div className="module-card-title">
              <span>资讯 {index + 1}</span>
              <RowActions
                canMoveDown={index < value.length - 1}
                canMoveUp={index > 0}
                canRemove={value.length > 1}
                onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
                onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
                onRemove={() => onChange(removeListItem(value, item.id))}
              />
            </div>
            <label className="menu-cell">
              <span>标题</span>
              <input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图标 Class</span>
              <input value={item.iconClass} onChange={(event) => updateItem(item.id, { iconClass: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>摘要</span>
              <textarea value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function PhotoCardsEditor({
  field,
  value,
  onChange,
}: {
  field: EditableField
  value: Array<PhotoCardItem>
  onChange: (value: Array<PhotoCardItem>) => void
}) {
  const addItem = () => {
    onChange([
      ...value,
      {
        id: makeEditorId('photo'),
        title: `新图片 ${value.length + 1}`,
        description: '补充图片说明',
        imageSrc: 'assets/materials/server-room.png',
        imageAlt: '图库图片',
        featured: false,
      },
    ])
  }

  const updateItem = (id: string, patch: Partial<PhotoCardItem>) => {
    onChange(updateListItem(value, id, patch))
  }

  return (
    <div className="module-editor span-2">
      <ModuleEditorHead
        action={<button className="ghost-button" onClick={addItem} type="button">新增图片</button>}
        field={field}
      />
      <div className="module-grid">
        {value.map((item, index) => (
          <article className="module-card two-column" key={item.id}>
            <div className="module-card-title">
              <span>图片 {index + 1}</span>
              <RowActions
                canMoveDown={index < value.length - 1}
                canMoveUp={index > 0}
                canRemove={value.length > 1}
                onMoveDown={() => onChange(moveListItem(value, item.id, 1))}
                onMoveUp={() => onChange(moveListItem(value, item.id, -1))}
                onRemove={() => onChange(removeListItem(value, item.id))}
              />
            </div>
            <label className="menu-cell">
              <span>标题</span>
              <input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片路径</span>
              <input value={item.imageSrc} onChange={(event) => updateItem(item.id, { imageSrc: event.target.value })} />
            </label>
            <label className="menu-cell">
              <span>图片说明</span>
              <input value={item.imageAlt} onChange={(event) => updateItem(item.id, { imageAlt: event.target.value })} />
            </label>
            <label className="menu-visible">
              <input checked={item.featured} onChange={(event) => updateItem(item.id, { featured: event.target.checked })} type="checkbox" />
              <span>重点图</span>
            </label>
            <label className="menu-cell span-2">
              <span>说明文案</span>
              <textarea value={item.description} onChange={(event) => updateItem(item.id, { description: event.target.value })} />
            </label>
          </article>
        ))}
      </div>
    </div>
  )
}

function ModuleEditorHead({ action, field }: { action?: ReactNode; field: EditableField }) {
  return (
    <div className="menu-editor-head">
      <div>
        <strong>{field.label}</strong>
        {field.hint ? <small>{field.hint}</small> : null}
      </div>
      {action}
    </div>
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
  return modules[section].title
}
