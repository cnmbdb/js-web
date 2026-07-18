# Article content Edge Function

本地开发由 Vite 的 `/__local/articles` 接口直接读写 `docs/blog/*.mdx`。正式环境部署本函数后，后台会自动改用它。

部署前需要在 Supabase Edge Function Secrets 中配置：

- `GITHUB_TOKEN`：只允许读写目标私有仓库 Contents 的细粒度 Token。
- `GITHUB_OWNER`：仓库所有者，例如 `cnmbdb`。
- `GITHUB_REPO`：仓库名，例如 `js-web`。
- `GITHUB_BRANCH`：发布分支，默认 `main`。

函数必须启用 JWT 校验。函数内部还会再次调用 `auth.getUser()` 并检查 `site_admins`，GitHub Token 不得进入 Vite 环境变量或浏览器包。
