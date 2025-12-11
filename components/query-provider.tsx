'use client';

/**
 * React Query Provider
 * 为整个应用提供 React Query 功能
 * 支持持久化缓存到 localStorage
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { useState, useMemo, useEffect } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认配置
            staleTime: 60 * 1000, // 1分钟
            gcTime: 5 * 60 * 1000, // 5分钟
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // 追踪是否已在客户端挂载
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 创建持久化存储器（仅在客户端挂载后）
  const persister = useMemo(() => {
    if (isMounted) {
      return createAsyncStoragePersister({
        storage: window.localStorage,
        key: 'MIRA_CHATBOT_CACHE', // 缓存键名
      });
    }
    return undefined;
  }, [isMounted]);

  // 在挂载前或服务端，始终返回相同的组件树结构
  // 挂载后如果有持久化存储器，使用持久化 Provider
  if (isMounted && persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 24 * 60 * 60 * 1000, // 缓存保留 24 小时
          dehydrateOptions: {
            // 只持久化特定的查询
            shouldDehydrateQuery: (query) => {
              // 只持久化 models 查询
              return query.queryKey[0] === 'models';
            },
          },
        }}
      >
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </PersistQueryClientProvider>
    );
  }

  // 默认方案：服务端渲染和客户端初始渲染都使用普通 Provider
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

