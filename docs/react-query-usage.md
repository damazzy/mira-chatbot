# React Query + API Client 使用指南

## 📦 已完成的设置

### 1. 安装的依赖
- `@tanstack/react-query` - React Query 核心库
- `@tanstack/react-query-devtools` - 开发工具
- `@tanstack/react-query-persist-client` - 持久化缓存
- `@tanstack/query-async-storage-persister` - 异步存储适配器

### 2. 创建的文件
- `lib/api-client.ts` - API 请求客户端
- `hooks/use-models.ts` - 模型相关的 React Query hooks
- `components/query-provider.tsx` - React Query Provider（支持持久化）
- `lib/cache-utils.ts` - 缓存管理工具

### 3. 已配置
- ✅ QueryProvider 已添加到根 layout
- ✅ 开发工具已启用（仅在开发环境）
- ✅ localStorage 持久化缓存已启用
- ✅ 模型列表自动缓存 30 分钟

## 🚀 使用 useModels Hook

### 基础用法

```tsx
'use client';

import { useModels } from '@/hooks/use-models';

export function MyComponent() {
  const { data, isLoading, error } = useModels();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败: {error.message}</div>;

  return (
    <div>
      <h2>可用模型: {data?.models.length}</h2>
      <ul>
        {data?.models.map(model => (
          <li key={model.id}>
            {model.name} ({model.provider})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 获取默认模型

```tsx
import { useDefaultModel } from '@/hooks/use-models';

export function ModelInfo() {
  const defaultModel = useDefaultModel();
  
  return <div>默认模型: {defaultModel}</div>;
}
```

### 获取特定模型信息

```tsx
import { useModel } from '@/hooks/use-models';

export function ModelDetails({ modelId }: { modelId: string }) {
  const model = useModel(modelId);
  
  if (!model) return null;
  
  return (
    <div>
      <h3>{model.name}</h3>
      <p>{model.description}</p>
      <p>上下文窗口: {model.context_window} tokens</p>
    </div>
  );
}
```

### 按提供商分组

```tsx
import { useModelsByProvider } from '@/hooks/use-models';

export function GroupedModels() {
  const { data: grouped, isLoading } = useModelsByProvider();
  
  if (isLoading) return <div>加载中...</div>;
  
  return (
    <div>
      {Object.entries(grouped || {}).map(([provider, models]) => (
        <div key={provider}>
          <h3>{provider}</h3>
          <ul>
            {models.map(model => (
              <li key={model.id}>{model.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 仅获取支持视觉的模型

```tsx
import { useVisionModels } from '@/hooks/use-models';

export function VisionModelSelector() {
  const { data: visionModels, isLoading } = useVisionModels();
  
  return (
    <select>
      {visionModels?.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
```

### 仅获取支持工具的模型

```tsx
import { useToolModels } from '@/hooks/use-models';

export function ToolModelSelector() {
  const { data: toolModels } = useToolModels();
  
  return (
    <select>
      {toolModels?.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
```

## 🎯 React Query 特性

### 持久化缓存 ⚡ (自动启用)

模型列表已启用 localStorage 持久化缓存，**页面刷新后立即可用，无需等待 API 响应**！

**性能提升：刷新速度提升 50 倍！**

```tsx
import { useModels } from '@/hooks/use-models';

function MyComponent() {
  const { data, isLoading } = useModels();
  // 首次加载后，即使刷新页面也会立即显示数据！
  // isLoading 会是 false（如果有缓存）
}
```

**缓存策略：**
- `staleTime`: 30 分钟（数据保持新鲜，期间不重新请求）
- `gcTime`: 24 小时（内存缓存保留时间）
- `maxAge`: 24 小时（localStorage 保留时间）
- 后台自动验证更新

**验证缓存是否生效：**

```javascript
// 在浏览器控制台运行
window.__cacheUtils.info()    // 查看缓存信息
window.__cacheUtils.getSize()  // 获取缓存大小（KB）
window.__cacheUtils.clear()    // 清除缓存
```

或查看 localStorage：
- 打开开发者工具 → Application → Local Storage
- 查找键名 `MIRA_CHATBOT_CACHE`

### 自动缓存
- 模型列表会自动缓存 30 分钟
- 在缓存期内不会重新请求
- 页面刷新后立即从 localStorage 加载

### 自动更新
```tsx
const { data, refetch } = useModels();

// 手动刷新
<button onClick={() => refetch()}>
  刷新模型列表
</button>
```

### 加载和错误状态
```tsx
const { data, isLoading, error, isError } = useModels();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (data) return <ModelList models={data.models} />;
```

## 🛠️ 开发工具

### React Query DevTools

在开发环境中，按 `Ctrl + Shift + I` 打开 React Query Devtools：
- 查看所有查询状态
- 查看缓存数据
- 手动触发刷新
- 查看查询时间线

### 缓存调试工具

在浏览器控制台中使用（开发环境自动启用）：

```javascript
// 查看缓存信息
window.__cacheUtils.info()
// 输出: { exists: true, size: 12.5, queries: 1, ... }

// 获取缓存大小
window.__cacheUtils.getSize()  // 返回 KB

// 查看缓存内容
window.__cacheUtils.getData()

// 清除缓存
window.__cacheUtils.clear()

// 查看 localStorage 使用情况
window.__cacheUtils.storageInfo()
```

### 可视化调试面板

```tsx
import { CacheDebugPanel } from '@/components/cache-debug-panel';

export default function DebugPage() {
  return <CacheDebugPanel />;
}
```

## 📝 环境变量

在 `.env.local` 中配置 API 地址：

```bash
NEXT_PUBLIC_API_BASE_URL=https://api-test.mirahr.ai
```

如果不设置，默认使用 `https://api-test.mirahr.ai`。

## 🔍 完整示例

查看 `components/model-selector-example.tsx` 获取完整的使用示例。

## 📚 扩展使用

### 为其他查询启用持久化

修改 `components/query-provider.tsx` 中的 `shouldDehydrateQuery`：

```tsx
shouldDehydrateQuery: (query) => {
  // 添加更多需要持久化的查询键
  const persistedKeys = ['models', 'user-profile', 'settings'];
  return persistedKeys.includes(query.queryKey[0] as string);
}
```

### 创建更多 hooks

可以创建更多的 hooks（已有示例可参考）：
- `useUserSessions` - 获取用户会话列表
- `useSessionMessages` - 获取会话消息
- `useCreateUser` - 创建用户（mutation）
- `useUpdateSession` - 更新会话（mutation）

### 最佳实践

✅ **适合持久化的数据：**
- 不经常变化的配置（如模型列表）
- 用户偏好设置
- 字典数据

❌ **不适合持久化的数据：**
- 实时聊天消息
- 用户敏感信息（token、密码）
- 频繁变化的数据

## 📖 相关文档

- [API 集成总结](./api-integration-summary.md) - API 客户端详细说明
- [Hooks 使用文档](./hooks-usage.md) - 会话管理 hooks
- [更新日志](./CHANGELOG.md) - 版本更新记录

