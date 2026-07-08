export type ProductDevtoolsSection = {
  label: string
  value: string
  detail: string
}

export const productDevtoolsSnapshot = {
  environment: 'development',
  app: '苏信智造后台',
  sections: [
    {
      label: 'leads',
      value: '42 active',
      detail: '咨询线索、负责人、跟进状态',
    },
    {
      label: 'content',
      value: '5 routes',
      detail: '首页、业务、案例、咨询、合作',
    },
    {
      label: 'cases',
      value: '36 published',
      detail: '案例库发布状态和展示权重',
    },
    {
      label: 'assets',
      value: '18 media',
      detail: '官网图片、渲染图、参考素材',
    },
  ] satisfies Array<ProductDevtoolsSection>,
}
