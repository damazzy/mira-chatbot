'use client';

/**
 * 缓存调试面板（仅开发环境使用）
 * 用于可视化查看和管理 React Query 持久化缓存
 */

import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getCacheInfo, clearPersistedCache, getLocalStorageInfo } from '@/lib/cache-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CacheDebugPanel() {
  const queryClient = useQueryClient();
  const [cacheInfo, setCacheInfo] = useState<ReturnType<typeof getCacheInfo>>();
  const [storageInfo, setStorageInfo] = useState<ReturnType<typeof getLocalStorageInfo>>();

  const refreshInfo = () => {
    setCacheInfo(getCacheInfo());
    setStorageInfo(getLocalStorageInfo());
  };

  useEffect(() => {
    refreshInfo();
  }, []);

  const handleClearCache = () => {
    if (confirm('确定要清除所有持久化缓存吗？')) {
      clearPersistedCache();
      queryClient.clear();
      refreshInfo();
    }
  };

  const handleRefreshModels = () => {
    queryClient.refetchQueries({ queryKey: ['models'] });
    setTimeout(refreshInfo, 100);
  };

  const handleInvalidateModels = () => {
    queryClient.invalidateQueries({ queryKey: ['models'] });
    setTimeout(refreshInfo, 100);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">缓存调试面板</h3>
        <Button onClick={refreshInfo} variant="outline" size="sm">
          刷新信息
        </Button>
      </div>

      {/* 缓存基本信息 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">持久化缓存状态</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">状态:</span>
            {cacheInfo?.exists ? (
              <Badge variant="default" className="ml-2">已启用</Badge>
            ) : (
              <Badge variant="secondary" className="ml-2">未启用</Badge>
            )}
          </div>
          <div>
            <span className="text-muted-foreground">大小:</span>
            <span className="ml-2 font-mono">{cacheInfo?.size || 0} KB</span>
          </div>
          <div>
            <span className="text-muted-foreground">查询数:</span>
            <span className="ml-2 font-mono">{cacheInfo?.queries || 0}</span>
          </div>
          <div>
            <span className="text-muted-foreground">时间戳:</span>
            <span className="ml-2 font-mono text-xs">
              {cacheInfo?.timestamp 
                ? new Date(cacheInfo.timestamp).toLocaleString() 
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 查询键列表 */}
      {cacheInfo?.queryKeys && cacheInfo.queryKeys.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">缓存的查询键</h4>
          <div className="flex flex-wrap gap-2">
            {cacheInfo.queryKeys.map((key: any, index: number) => (
              <Badge key={index} variant="outline">
                {Array.isArray(key) ? key.join(' > ') : String(key)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* localStorage 信息 */}
      {storageInfo && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">LocalStorage 使用情况</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-muted-foreground">总大小:</span>
              <span className="ml-2 font-mono">{storageInfo.totalSize} KB</span>
              <span className="ml-2 text-xs text-muted-foreground">
                / {storageInfo.estimatedLimit} KB
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (storageInfo.totalSize / storageInfo.estimatedLimit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2 pt-2 border-t">
        <Button 
          onClick={handleRefreshModels} 
          variant="outline" 
          size="sm"
        >
          刷新模型列表
        </Button>
        <Button 
          onClick={handleInvalidateModels} 
          variant="outline" 
          size="sm"
        >
          失效模型缓存
        </Button>
        <Button 
          onClick={handleClearCache} 
          variant="destructive" 
          size="sm"
        >
          清除所有缓存
        </Button>
      </div>

      {/* 提示信息 */}
      <div className="text-xs text-muted-foreground pt-2 border-t">
        💡 提示: 也可以在浏览器控制台中使用 <code className="bg-secondary px-1 rounded">window.__cacheUtils</code> 进行调试
      </div>
    </Card>
  );
}

