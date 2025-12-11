# Hooks 使用指南（简化版）

## 📦 项目 Hooks 概览

```
hooks/
├── use-models.ts       # 模型管理（1个核心 hook）
└── use-chat.ts         # 会话和消息管理（4个 hooks）
```

## 🎯 核心 Hooks

### 1. 模型管理 - `use-models.ts`

#### `useModels()` - 获取所有模型

```tsx
import { useModels } from '@/hooks/use-models';

function ModelSelector() {
  const { data, isLoading, error } = useModels();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <select>
      {data?.models.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
```

**其他快捷方式**（在同一文件中）：
- `useDefaultModel()` - 获取默认模型 ID
- `useModel(id)` - 获取特定模型信息
- `useVisionModels()` - 仅视觉模型
- `useToolModels()` - 仅工具模型
- `useModelsByProvider()` - 按提供商分组

### 2. 会话管理 - `use-chat.ts`

#### `useChatHistory(userId?)` - 会话历史（主要使用）

使用 API 获取会话历史（使用默认用户 ID）：

```tsx
import { useChatHistory, DEFAULT_USER_ID } from '@/hooks/use-chat';

function Sidebar() {
  const {
    chats,           // 会话列表
    isLoading,       // 加载状态
    deleteChat,      // 删除方法
    isDeleting,      // 删除中状态
    userId,          // 当前用户 ID
  } = useChatHistory(); // 使用默认用户 ID

  return (
    <div>
      {chats.map(chat => (
        <div key={chat.id}>
          {chat.title}
          <button onClick={() => deleteChat(chat.id)}>删除</button>
        </div>
      ))}
    </div>
  );
}

// 如果需要指定用户 ID
function CustomSidebar() {
  const { chats } = useChatHistory('custom-user-id');
  // ...
}

// 默认用户 ID
console.log(DEFAULT_USER_ID); // 'd544f6dd-aa49-4127-a424-f600b26e810b'
```

#### `useSession(sessionId)` - 获取单个会话详情（仅 API）

```tsx
import { useSession } from '@/hooks/use-chat';

function SessionDetail({ sessionId }: { sessionId: string }) {
  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h2>{session?.title}</h2>
      <p>模型: {session?.model}</p>
      <p>消息数: {session?.message_count}</p>
    </div>
  );
}
```

#### `useMessages(sessionId)` - 获取消息历史（仅 API）

```tsx
import { useMessages } from '@/hooks/use-chat';

function MessageList({ sessionId }: { sessionId: string }) {
  const { data: messages, isLoading } = useMessages(sessionId);

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {messages?.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
    </div>
  );
}
```

#### `useUpdateSession()` - 更新会话（仅 API）

```tsx
import { useUpdateSession } from '@/hooks/use-chat';

function EditSession({ sessionId }: { sessionId: string }) {
  const { mutate: updateSession, isPending } = useUpdateSession();

  const handleUpdate = () => {
    updateSession(
      {
        sessionId,
        data: { title: '新标题' }
      },
      {
        onSuccess: () => console.log('更新成功'),
        onError: (error) => console.error('更新失败', error),
      }
    );
  };

  return (
    <button onClick={handleUpdate} disabled={isPending}>
      保存
    </button>
  );
}
```

## 📋 实际使用示例

### ChatInput 组件（模型选择）

```tsx
import { useModels } from '@/hooks/use-models';

export function ChatInput() {
  const { data: modelsData, isLoading } = useModels();
  
  const availableModels = modelsData?.models || [];
  
  return (
    <select disabled={isLoading}>
      {availableModels.map(model => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
```

### AppSidebar 组件（会话历史）

```tsx
import { useChatHistory } from '@/hooks/use-chat';

export function AppSidebar() {
  const { chats, isLoading, deleteChat, isDeleting } = useChatHistory();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      {chats.map(chat => (
        <div key={chat.id}>
          <a href={`/chat/${chat.id}`}>{chat.title}</a>
          <button 
            onClick={() => deleteChat(chat.id)}
            disabled={isDeleting}
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 设计理念

### 为什么只有 2 个文件？

1. **`use-models.ts`** - 模型是独立的功能域
2. **`use-chat.ts`** - 会话、消息都属于"聊天"领域，放一起更合理

### 为什么使用默认用户 ID？

在实现用户鉴权之前，所有会话都关联到一个默认用户 ID：

```tsx
// 当前（未实现鉴权）
const { chats } = useChatHistory(); // 使用默认 userId

// 未来（实现鉴权后）
const { chats } = useChatHistory(currentUser.id); // 使用真实 userId
```

默认用户 ID: `d544f6dd-aa49-4127-a424-f600b26e810b`

这样设计可以：
- ✅ 简化当前开发流程
- ✅ 数据已存储在 API（不丢失）
- ✅ 实现鉴权后只需传入真实用户 ID

## 🔄 数据流

```
React 组件
    ↓
React Query Hook (use-models.ts / use-chat.ts)
    ↓
API Client (lib/api-client.ts)
    ↓
Mira Backend API
```

## 📊 对比：简化前 vs 简化后

### 简化前（3个文件 + 19个 hooks）
```
hooks/
├── use-sessions.ts (7个 hooks)
├── use-messages.ts (3个 hooks)
├── use-chat-history.ts (3个 hooks)
└── use-models.ts (6个 hooks)
```

### 简化后（2个文件 + 10个 hooks）
```
hooks/
├── use-models.ts (6个 hooks)
└── use-chat.ts (4个 hooks)
```

**减少了**：
- ❌ 1个文件（合并 3 → 1）
- ❌ 9个 hooks（精简掉不常用的）
- ❌ 大量重复代码

**保留了**：
- ✅ 所有核心功能
- ✅ 类型安全
- ✅ 自动缓存
- ✅ 渐进式迁移能力

## 💡 何时使用哪个 Hook？

| 场景 | 使用的 Hook |
|------|-------------|
| 选择 AI 模型 | `useModels()` |
| 侧边栏会话列表 | `useChatHistory()` |
| 查看会话详情 | `useSession(sessionId)` |
| 显示聊天消息 | `useMessages(sessionId)` |
| 修改会话标题 | `useUpdateSession()` |

## 🔑 默认用户 ID

当前项目使用默认用户 ID（未实现用户鉴权）：

```tsx
import { DEFAULT_USER_ID } from '@/hooks/use-chat';

console.log(DEFAULT_USER_ID); // 'd544f6dd-aa49-4127-a424-f600b26e810b'

// 在 API 调用中使用
const response = await apiClient.getUserSessions(DEFAULT_USER_ID);
```

**注意**：实现用户系统后，应该使用真实的用户 ID。

## 📚 进阶用法

### 组合多个 hooks

```tsx
function ChatPage({ sessionId, userId }: Props) {
  const { data: session } = useSession(sessionId);
  const { data: messages } = useMessages(sessionId);
  const { chats } = useChatHistory(userId);
  
  // 组合使用多个 hooks
}
```

### 条件请求

```tsx
// 只在需要时请求
const { data } = useSession(isDetailView ? sessionId : undefined);
```

### 手动刷新

```tsx
const { data, refetch } = useChatHistory(userId);

<button onClick={() => refetch()}>刷新</button>
```

## 🛠️ 配置

### 环境变量

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api-test.mirahr.ai
```

### 缓存时间

在 `components/query-provider.tsx` 中配置：

```tsx
{
  queries: {
    staleTime: 60 * 1000,        // 1分钟
    gcTime: 5 * 60 * 1000,       // 5分钟
    refetchOnWindowFocus: false,
  }
}
```

## 🎉 总结

**简化后的架构**：
- 📁 只有 2 个 hook 文件
- 🎯 10 个精选的 hooks
- 🚀 更容易理解和维护
- ✨ 保留所有核心功能

需要更多帮助？查看 React Query 官方文档或项目中的 `docs/react-query-usage.md`。

