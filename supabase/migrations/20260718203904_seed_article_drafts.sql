with first_admin as (
  select user_id
  from public.site_admins
  order by created_at asc
  limit 1
)
insert into public.article_drafts (
  slug, title, description, category, tags, cover_url, author, body_mdx,
  status, featured, published_at, updated_at, updated_by
)
select
  article.slug,
  article.title,
  article.description,
  article.category,
  article.tags,
  article.cover_url,
  '速芯算力',
  article.body_mdx,
  'published',
  article.featured,
  article.published_at,
  make_timestamptz(2026, 7, 19, 0, 0, 0, 'Asia/Shanghai'),
  first_admin.user_id
from first_admin
cross join (
  values
    (
      'green-compute-operations',
      '绿色算力基础设施进入精细化运营阶段',
      '围绕GPU硬件、机房托管、绿电资源、项目交付与企业AIGC降本，梳理算力基础设施的运营重点。',
      '行业观察',
      array['绿色算力', '算力运营']::text[],
      'https://suxin.ai/assets/materials/dashboard-panel.png',
      $green$算力基础设施的竞争重点，正在从单纯的硬件供给转向稳定交付、能源效率和持续运营。

## 从设备采购转向全生命周期运营

企业评估算力项目时，需要同时关注 GPU 设备、网络、电力、散热、监控、备件和运维响应，而不是只比较单卡价格。

<Info>
  一套可持续的算力方案，应当把设备利用率、能源成本和业务产出放在同一个测算模型中。
</Info>

## 绿电资源需要转化为交付能力

绿电资源只有与机房建设、网络条件、设备上架和客户需求结合，才能形成真正可交付的算力服务。

## 精细化运营的三个指标

1. 设备可用率和故障恢复时间
2. 单位算力的综合能耗与成本
3. 算力资源与实际业务负载的匹配程度$green$,
      true,
      date '2026-07-19'
    ),
    (
      'data-center-hosting-stability',
      '智算机房托管如何评估稳定性',
      '从电力、散热、网络、运维响应与资产安全五个维度建立智算机房考察清单。',
      '算力硬件与托管',
      array['智算机房', 'GPU托管']::text[],
      'https://suxin.ai/assets/materials/server-room.png',
      $hosting$GPU 服务器的功耗、散热密度和网络要求明显高于传统机架服务器，托管考察必须覆盖完整运行链路。

## 电力与散热

- 核对双路供电、UPS 和备用发电能力。
- 记录机柜额定功率和实际可用功率。
- 评估高密度机柜的冷热通道和液冷扩展条件。

## 网络与运维

- 确认运营商线路、跨境链路和故障切换方案。
- 明确 7×24 小时响应、备件和上架操作边界。
- 将告警、巡检和故障工单纳入统一记录。

<Tip>
  现场考察时，应要求查看真实监控记录和历史故障处理时间，而不只看方案文档。
</Tip>$hosting$,
      false,
      date '2026-07-18'
    ),
    (
      'enterprise-aigc-cost-analysis',
      '企业AIGC降本测算思路',
      '结合内容生产、客服、设计、投放与质检场景，拆分企业AIGC算力需求和成本结构。',
      '企业AIGC应用',
      array['AIGC', '降本增效']::text[],
      '',
      $aigc$企业引入 AIGC 时，最容易出现的问题是先采购模型或算力，再寻找可以落地的业务场景。

## 先计算业务工作量

以内容生产为例，需要记录月度任务量、平均处理时间、人工成本、返工率和质量要求，再评估模型能够替代或辅助的比例。

## 再拆分算力需求

不同场景对推理延迟、并发、上下文长度和图像生成能力的要求不同，不应该用同一种 GPU 配置覆盖所有业务。

## 最后比较综合成本

综合成本需要同时包含模型调用、GPU 租赁或采购、部署运维、数据整理和人工复核，而不是只计算 Token 或显卡费用。$aigc$,
      false,
      date '2026-07-17'
    )
) as article(slug, title, description, category, tags, cover_url, body_mdx, featured, published_at)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  tags = excluded.tags,
  cover_url = excluded.cover_url,
  author = excluded.author,
  body_mdx = excluded.body_mdx,
  status = excluded.status,
  featured = excluded.featured,
  published_at = excluded.published_at,
  updated_at = excluded.updated_at,
  updated_by = excluded.updated_by,
  last_error = null;
