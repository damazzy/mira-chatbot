# Mira Chatbot - Cursor Rules

## 项目概述
这是一个基于 Next.js 16 的聊天机器人项目，使用 TypeScript、React 19、Tailwind CSS v4 和 shadcn/ui 组件库构建。

## 技术栈
- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (strict mode)
- **UI 库**: React 19
- **样式**: Tailwind CSS v4
- **组件库**: Radix UI + shadcn/ui
- **国际化**: next-intl
- **包管理器**: pnpm
- **代码检查**: ESLint (Next.js 配置)

## 代码规范

### TypeScript
- 使用 TypeScript strict 模式
- 所有组件和函数必须提供类型定义
- 优先使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型和工具类型
- 避免使用 `any`，必要时使用 `unknown`
- 使用路径别名 `@/*` 替代相对路径导入

### React 组件
- 使用函数式组件和 React Hooks
- 组件文件使用 PascalCase 命名（如 `Button.tsx`）
- 默认导出组件，命名导出工具函数和类型
- 使用 `"use client"` 指令标记客户端组件
- 服务端组件优先，仅在需要交互时使用客户端组件
- Props 使用 `Readonly<{}>` 或 `React.ComponentProps` 类型

### 样式规范
- 使用 Tailwind CSS 类名进行样式定义
- 使用 `cn()` 工具函数（来自 `@/lib/utils`）合并类名
- 使用 CVA (class-variance-authority) 管理组件变体
- 支持暗色模式，使用 `dark:` 前缀
- 颜色使用 OKLCH 颜色空间（在 CSS 变量中定义）
- 优先使用语义化颜色变量（如 `bg-background`, `text-foreground`）

### 文件组织
- 页面文件放在 `app/` 目录下，遵循 App Router 约定
- UI 组件放在 `components/ui/` 目录
- 业务组件放在 `components/` 目录
- 工具函数放在 `lib/` 目录
- 国际化配置放在 `i18n/` 目录
- 翻译文件放在 `messages/` 目录（按语言代码命名，如 `zh.json`, `en.json`）
- 使用 `components.json` 管理 shadcn/ui 组件配置

### 导入顺序
1. React 和 Next.js 相关导入
2. 第三方库导入
3. 内部组件导入（使用 `@/` 别名）
4. 类型导入（使用 `import type`）
5. 样式导入

### 命名约定
- 组件：PascalCase（如 `Button`, `ChatMessage`）
- 函数/变量：camelCase（如 `handleClick`, `userData`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- 类型/接口：PascalCase（如 `UserProps`, `ApiResponse`）
- 文件：kebab-case 用于页面路由，PascalCase 用于组件

### Next.js 最佳实践
- 使用 App Router 的文件系统路由
- 服务端组件优先，减少客户端 JavaScript 体积
- 使用 `next/image` 优化图片
- 使用 `next/link` 进行客户端导航
- 使用 `next/navigation` 的 hooks（如 `useRouter`, `usePathname`）
- Metadata 使用 `export const metadata` 导出

### 代码质量
- 遵循 ESLint 规则（Next.js 配置）
- 保持函数简洁，单一职责
- 提取可复用的逻辑到自定义 Hooks
- 使用错误边界处理错误
- 添加必要的注释，特别是复杂逻辑

### 组件开发
- UI 组件应该支持 `asChild` 模式（使用 Radix UI Slot）
- 使用 `data-slot` 属性标识组件
- 组件应该支持 `className` prop 进行样式扩展
- 使用 CVA 定义组件变体（variant）和尺寸（size）
- 提供合理的默认值（defaultVariants）

### 性能优化
- 使用 `React.memo` 优化重渲染
- 使用 `useMemo` 和 `useCallback` 优化计算和函数
- 图片使用 `next/image` 并设置合适的 `priority`
- 代码分割使用动态导入（`dynamic import`）
- 避免在服务端组件中使用客户端 API

### 可访问性
- 使用语义化 HTML 元素
- 提供适当的 ARIA 属性
- 确保键盘导航支持
- 使用 `focus-visible` 样式提供焦点指示
- 表单元素使用 `aria-invalid` 标记错误状态

### 错误处理
- 使用 `try-catch` 处理异步操作
- 使用 Sonner toast 显示用户友好的错误消息
- 在 API 路由中返回适当的 HTTP 状态码
- 使用 Next.js 错误边界处理运行时错误

### 国际化规范
- 使用 **next-intl** 实现国际化功能
- 支持的语言：中文（zh，默认）、英文（en）
- 语言偏好通过 Cookie（`NEXT_LOCALE`）持久化存储
- 所有用户可见的文本必须使用翻译键，禁止硬编码文本
- 翻译键使用命名空间组织（如 `common`, `dashboard`, `chatbot`）
- 服务端组件使用 `useTranslations` hook（来自 `next-intl`）
- 客户端组件使用 `useTranslations` hook（需要 `'use client'` 指令）
- Server Actions 使用 `getTranslations`（来自 `next-intl/server`）
- 翻译键命名规范：使用有意义的命名空间和键名，保持所有语言文件结构一致
- 添加新功能时，必须同时更新所有语言的翻译文件
- 使用 `LanguageSwitcher` 组件提供语言切换功能
- 翻译文件路径：`messages/{locale}.json`
- 配置文件路径：`i18n/config.ts`（语言列表和默认语言）
- 请求配置路径：`i18n/request.ts`（next-intl 请求配置）

### Git 提交
- 提交前运行 `pnpm lint` 检查代码
- 提交信息使用中文或英文，保持清晰简洁
- 遵循约定式提交格式（如 `feat:`, `fix:`, `docs:`）

## 常用命令
- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行 ESLint 检查

## 注意事项
- 不要提交 `node_modules`、`.next`、`out` 等构建产物
- 保持 `package.json` 和 `pnpm-lock.yaml` 同步
- 新增依赖时使用 `pnpm add` 命令
- 修改 UI 组件时注意保持与设计系统一致
- 使用暗色模式时测试两种主题下的显示效果
- 添加新功能时，确保所有语言的翻译文件都已更新
- 翻译文本应保持简洁明了，避免过长文本影响 UI 布局
- 测试时验证不同语言下的页面显示和功能是否正常

