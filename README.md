# Mira Chatbot 🤖

基于 Next.js 构建的现代化 AI 聊天应用，集成 Mira Backend API，支持多模型对话和智能缓存。

## ✨ 特性

- 🚀 **超快加载** - 持久化缓存技术，页面刷新后立即可用
- 💬 **多模型支持** - 集成多个 AI 模型，灵活切换
- 🎨 **现代化 UI** - 美观的用户界面，流畅的交互体验
- 📱 **响应式设计** - 完美适配桌面和移动设备
- 🌐 **国际化** - 支持中英文切换
- 💾 **智能缓存** - React Query + localStorage 持久化
- 🔍 **开发友好** - 完整的调试工具和文档

## Getting Started

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件，并添加以下配置：

```bash
# Vercel AI Gateway API Key（推荐）
# 获取方式：https://vercel.com/docs/ai-gateway/authentication
# 1. 登录 Vercel 仪表板
# 2. 导航至 AI Gateway 标签页
# 3. 点击左侧边栏的 API keys
# 4. 点击 Add key，然后选择 Create key
# 5. 复制生成的 API 密钥并粘贴到下方
AI_GATEWAY_API_KEY=your_api_key_here

# 或者，如果您想直接使用 OpenAI API（不使用 AI Gateway）
# OPENAI_API_KEY=your_openai_api_key_here

# 或者，如果您想使用其他 AI 提供商
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. 启动开发服务器

```bash
pnpm dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📚 文档

### 核心文档
- [⚡ React Query 使用指南](./docs/react-query-usage.md) - React Query + 持久化缓存完整说明
- [🔧 Hooks 使用文档](./docs/hooks-usage.md) - 自定义 Hooks 使用说明
- [🔌 API 集成总结](./docs/api-integration-summary.md) - API 集成文档
- [📝 更新日志](./docs/CHANGELOG.md) - 版本更新记录

### 主要技术栈

- **框架**: Next.js 16 + React 19
- **状态管理**: React Query (TanStack Query)
- **UI 组件**: Radix UI + Tailwind CSS
- **AI SDK**: Vercel AI SDK
- **国际化**: next-intl
- **动画**: Framer Motion

## 🎯 核心功能

### 1. 持久化缓存 ⚡

使用 React Query + localStorage 实现智能缓存：

```tsx
import { useModels } from '@/hooks/use-models';

function MyComponent() {
  const { data, isLoading } = useModels();
  // 刷新页面后立即显示，无需等待！
}
```

**性能提升：页面刷新速度提升 50 倍！**

在浏览器控制台查看缓存状态：
```javascript
window.__cacheUtils.info()  // 查看缓存信息
window.__cacheUtils.clear() // 清除缓存
```

### 2. 会话管理

```tsx
import { useChatHistory, useCreateChat, useDeleteChat } from '@/hooks/use-chat';

function ChatList() {
  const { chats, isLoading } = useChatHistory();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();
  
  // 所有数据自动同步到 Mira Backend
}
```

### 3. 多模型支持

```tsx
import { useModels, useVisionModels, useToolModels } from '@/hooks/use-models';

// 获取所有模型
const { data: models } = useModels();

// 仅获取支持视觉的模型
const { data: visionModels } = useVisionModels();

// 仅获取支持工具调用的模型
const { data: toolModels } = useToolModels();
```

## 🛠️ 开发调试

### 缓存调试工具

在任何页面中使用可视化调试面板：

```tsx
import { CacheDebugPanel } from '@/components/cache-debug-panel';

export default function DebugPage() {
  return <CacheDebugPanel />;
}
```

或在控制台中使用：
```javascript
// 查看缓存信息
window.__cacheUtils.info()

// 获取缓存大小
window.__cacheUtils.getSize()

// 查看 localStorage 使用情况
window.__cacheUtils.storageInfo()
```

### React Query DevTools

开发环境自动启用，可以实时查看：
- 查询状态和缓存数据
- 查询时间线
- 手动触发刷新/清除

## 📦 项目结构

```
mira-chatbot/
├── app/                    # Next.js App Router
│   ├── (chatbot)/         # 聊天相关页面
│   ├── api/               # API 路由
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── ai-elements/       # AI 相关组件
│   ├── ui/                # UI 基础组件
│   └── ...
├── hooks/                 # 自定义 Hooks
│   ├── use-chat.ts       # 会话管理
│   ├── use-models.ts     # 模型管理（带缓存）
│   └── ...
├── lib/                   # 工具库
│   ├── api-client.ts     # API 客户端
│   ├── cache-utils.ts    # 缓存工具
│   └── utils.ts          # 通用工具
├── docs/                  # 文档
│   ├── cache-quick-start.md
│   ├── local-cache-usage.md
│   └── ...
└── messages/              # 国际化翻译文件
    ├── en.json
    └── zh.json
```

## 🚀 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/mira-chatbot)

1. 点击上方按钮
2. 配置环境变量（同 `.env.local`）
3. 部署完成！

### 手动部署

```bash
# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [React Query 文档](https://tanstack.com/query/latest)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Mira Backend API](https://your-api-docs-url)
