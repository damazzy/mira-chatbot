/**
 * 缓存管理工具函数
 * 用于管理和调试 React Query 持久化缓存
 */

const CACHE_KEY = 'MIRA_CHATBOT_CACHE';

/**
 * 获取缓存大小（以 KB 为单位）
 */
export function getCacheSize(): number {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
      const sizeInBytes = new Blob([cache]).size;
      return Number((sizeInBytes / 1024).toFixed(2));
    }
    return 0;
  } catch (error) {
    console.error('获取缓存大小失败:', error);
    return 0;
  }
}

/**
 * 获取缓存内容（解析后的对象）
 */
export function getCacheData(): unknown {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    return cache ? JSON.parse(cache) : null;
  } catch (error) {
    console.error('获取缓存数据失败:', error);
    return null;
  }
}

/**
 * 清除持久化缓存
 */
export function clearPersistedCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('持久化缓存已清除');
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
}

/**
 * 检查缓存是否存在
 */
export function hasCachedData(): boolean {
  try {
    return localStorage.getItem(CACHE_KEY) !== null;
  } catch (error) {
    console.error('检查缓存失败:', error);
    return false;
  }
}

/**
 * 获取缓存信息（用于调试）
 */
export function getCacheInfo() {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) {
      return {
        exists: false,
        size: 0,
        queries: 0,
      };
    }

    const data = JSON.parse(cache);
    const queries = data?.clientState?.queries || [];
    
    return {
      exists: true,
      size: getCacheSize(),
      queries: queries.length,
      queryKeys: queries.map((q: any) => q.queryKey),
      timestamp: data?.timestamp || null,
    };
  } catch (error) {
    console.error('获取缓存信息失败:', error);
    return {
      exists: false,
      size: 0,
      queries: 0,
      error: String(error),
    };
  }
}

/**
 * 导出缓存数据（用于调试或迁移）
 */
export function exportCache(): string | null {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    return cache;
  } catch (error) {
    console.error('导出缓存失败:', error);
    return null;
  }
}

/**
 * 导入缓存数据（用于调试或迁移）
 */
export function importCache(cacheData: string): boolean {
  try {
    // 验证数据格式
    JSON.parse(cacheData);
    localStorage.setItem(CACHE_KEY, cacheData);
    console.log('缓存导入成功');
    return true;
  } catch (error) {
    console.error('导入缓存失败:', error);
    return false;
  }
}

/**
 * 监控 localStorage 空间使用情况
 */
export function getLocalStorageInfo() {
  try {
    let totalSize = 0;
    const items: Record<string, number> = {};

    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        if (value) {
          const size = new Blob([value]).size;
          items[key] = Number((size / 1024).toFixed(2));
          totalSize += size;
        }
      }
    }

    return {
      totalSize: Number((totalSize / 1024).toFixed(2)),
      items,
      itemCount: Object.keys(items).length,
      // localStorage 通常限制为 5-10MB
      estimatedLimit: 5120, // 5MB in KB
    };
  } catch (error) {
    console.error('获取 localStorage 信息失败:', error);
    return null;
  }
}

// 开发环境中的调试工具
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 将工具函数挂载到 window 对象上，方便在控制台中使用
  (window as any).__cacheUtils = {
    getSize: getCacheSize,
    getData: getCacheData,
    clear: clearPersistedCache,
    has: hasCachedData,
    info: getCacheInfo,
    export: exportCache,
    import: importCache,
    storageInfo: getLocalStorageInfo,
  };

  console.log(
    '%c💾 缓存调试工具已加载',
    'background: #4F46E5; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;'
  );
  console.log('在控制台中使用: window.__cacheUtils');
  console.log('可用方法: getSize(), getData(), clear(), has(), info(), export(), import(), storageInfo()');
}

