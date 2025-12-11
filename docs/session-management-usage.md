# 会话管理 React Query Hooks 使用指南

## 📦 创建的 Hooks

### 1. `hooks/use-sessions.ts` - 会话管理核心 Hooks
- `useSessions(userId)` - 获取用户会话列表
- `useSession(sessionId)` - 获取单个会话详情
- `useUpdateSession()` - 更新会话（mutation）
- `useDeleteSession()` - 删除会话（mutation）
- `useUpdateSessionTitle()` - 更新会话标题（乐观更新）
- `useFindSession()` - 从列表中查找会话
- `useRecentSessions()` - 获取最近的 N 个会话

### 2. `hooks/use-messages.ts` - 消息管理 Hooks
- `useMessages(sessionId)` - 获取会话消息历史
- `useRecentMessages()` - 获取最近消息
- `useMessageCount()` - 获取消息数量

### 3. `hooks/use-chat-history.ts` - 混合策略 Hook
- `useChatHistory(userId?)` - 智能切换 API/本地存储
- `useApiChatHistory(userId)` - 仅使用 API
- `useLocalChatHistory()` - 仅使用本地存储

## 🚀 使用示例

### 基础用法 - 获取会话列表

```tsx
import { useSessions } from '@/hooks/use-sessions';

function SessionList({ userId }: { userId: string }) {
  const { data: sessions, isLoading, error } = useSessions(userId);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败</div>;

  return (
    <ul>
      {sessions?.map(session => (
        <li key={session.id}>
          {session.title} - {session.message_count} 条消息
        </li>
      ))}
    </ul>
  );
}
```

### 删除会话

```tsx
import { useDeleteSession } from '@/hooks/use-sessions';

function DeleteButton({ sessionId }: { sessionId: string }) {
  const { mutate: deleteSession, isPending } = useDeleteSession();

  const handleDelete = () => {
    deleteSession(sessionId, {
      onSuccess: () => {
        console.log('删除成功');
      },
      onError: (error) => {
        console.error('删除失败:', error);
      },
    });
  };

  return (
    <button onClick={handleDelete} disabled={isPending}>
      {isPending ? '删除中...' : '删除'}
    </button>
  );
}
```

### 更新会话标题（乐观更新）

```tsx
import { useUpdateSessionTitle } from '@/hooks/use-sessions';

function EditTitle({ sessionId }: { sessionId: string }) {
  const [title, setTitle] = useState('');
  const { mutate: updateTitle, isPending } = useUpdateSessionTitle();

  const handleSave = () => {
    updateTitle(
      { sessionId, title },
      {
        onSuccess: () => {
          console.log('保存成功');
        },
      }
    );
  };

  return (
    <div>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
      />
      <button onClick={handleSave} disabled={isPending}>
        保存
      </button>
    </div>
  );
}
```

### 获取消息历史

```tsx
import { useMessages } from '@/hooks/use-messages';

function MessageHistory({ sessionId }: { sessionId: string }) {
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

### 混合策略 - 智能切换 API/本地存储

```tsx
import { useChatHistory } from '@/hooks/use-chat-history';

function ChatSidebar({ userId }: { userId?: string }) {
  const {
    chats,
    isLoading,
    deleteChat,
    isDeleting,
    useApi,
  } = useChatHistory(userId); // 有 userId 则用 API，否则用本地存储

  return (
    <div>
      <div className="text-xs text-gray-500">
        数据源: {useApi ? 'API' : '本地存储'}
      </div>
      
      {isLoading ? (
        <div>加载中...</div>
      ) : (
        <ul>
          {chats.map(chat => (
            <li key={chat.id}>
              {chat.title}
              <button 
                onClick={() => deleteChat(chat.id)}
                disabled={isDeleting}
              >
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 🎯 AppSidebar 集成示例

`components/app-sidebar.tsx` 已经集成了混合策略：

```tsx
// 使用本地存储（默认）
<AppSidebar />

// 使用 API
<AppSidebar userId="user-123" />
```

### 特性

- ✅ **加载状态** - 显示骨架屏和加载图标
- ✅ **删除状态** - 删除按钮显示加载状态
- ✅ **自动切换** - 根据是否提供 userId 切换数据源
- ✅ **错误处理** - 捕获并显示错误
- ✅ **乐观更新** - 立即显示 UI 变化
- ✅ **自动同步** - 本地存储支持跨标签页同步

## 📊 React Query 特性

### 自动缓存

```tsx
// 会话列表缓存 30 秒
const { data } = useSessions('user-123');
```

### 手动刷新

```tsx
const { data, refetch } = useSessions('user-123');

<button onClick={() => refetch()}>刷新</button>
```

### 乐观更新

更新会话标题时立即在 UI 显示，无需等待服务器响应：

```tsx
const { mutate } = useUpdateSessionTitle();

mutate({ sessionId: 'xxx', title: '新标题' });
// UI 立即更新，如果请求失败会自动回滚
```

### 自动失效

删除会话后，自动使相关缓存失效：

```tsx
const { mutate: deleteSession } = useDeleteSession();

deleteSession('session-id');
// 自动触发会话列表重新获取
```

## 🔄 数据流

```
用户操作
  ↓
React Query Hook
  ↓
API Client (lib/api-client.ts)
  ↓
Mira Backend API
  ↓
响应 → 更新缓存 → 触发重新渲染
```

## 🛠️ 开发工具

使用 React Query Devtools 查看：
- 当前缓存的会话列表
- 查询状态（loading/error/success）
- Mutation 状态
- 缓存失效和重新获取

## 📝 环境变量

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api-test.mirahr.ai
```

## 🎨 UI 状态处理

### 加载状态

```tsx
{isLoading && <Skeleton />}
```

### 空状态

```tsx
{chats.length === 0 && <EmptyState />}
```

### 错误状态

```tsx
{error && <ErrorMessage error={error} />}
```

### 删除状态

```tsx
<Button disabled={isDeleting}>
  {isDeleting ? <Spinner /> : <TrashIcon />}
</Button>
```

## 🚀 渐进式迁移

你可以逐步从本地存储迁移到 API：

1. **阶段 1**: 保持本地存储（当前）
```tsx
<AppSidebar />
```

2. **阶段 2**: 用户登录后使用 API
```tsx
<AppSidebar userId={currentUser?.id} />
```

3. **阶段 3**: 完全迁移到 API
```tsx
// 移除本地存储相关代码
<AppSidebar userId={currentUser.id} />
```

## 💡 最佳实践

1. **总是处理加载状态**
```tsx
if (isLoading) return <Skeleton />;
```

2. **捕获错误**
```tsx
if (error) return <ErrorMessage />;
```

3. **使用乐观更新提升 UX**
```tsx
const { mutate } = useUpdateSessionTitle();
```

4. **合理设置缓存时间**
```tsx
staleTime: 30 * 1000, // 30秒
gcTime: 5 * 60 * 1000, // 5分钟
```

5. **使用 enabled 避免不必要的请求**
```tsx
useSession(sessionId, { enabled: Boolean(sessionId) })
```

## 🔍 调试技巧

1. 打开 React Query Devtools（开发环境自动启用）
2. 查看 `sessions` 查询的状态
3. 检查缓存数据
4. 手动触发重新获取
5. 查看 mutation 历史

需要更多帮助？查看 `docs/react-query-usage.md` 获取 React Query 基础知识。

