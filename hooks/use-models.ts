/**
 * React Query hook for fetching AI models
 */
import { useQuery } from '@tanstack/react-query';
import { apiClient, type ModelsListResponse } from '@/lib/api-client';
import { useState, useEffect } from 'react';

/**
 * 获取支持的 AI 模型列表
 * 
 * 特性：
 * - 本地持久化缓存（localStorage）
 * - 首次加载后立即可用（即使刷新页面）
 * - 后台自动更新，保持数据新鲜度
 * 
 * @example
 * ```tsx
 * function ModelSelector() {
 *   const { data, isLoading, error } = useModels();
 *   
 *   if (isLoading) return <div>加载中...</div>;
 *   if (error) return <div>加载失败</div>;
 *   
 *   return (
 *     <select>
 *       {data?.models.map(model => (
 *         <option key={model.id} value={model.id}>
 *           {model.name}
 *         </option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useModels() {
  return useQuery<ModelsListResponse>({
    queryKey: ['models'],
    queryFn: () => apiClient.getModels(),
    staleTime: 30 * 60 * 1000, // 30分钟内认为数据是新鲜的
    gcTime: 24 * 60 * 60 * 1000, // 内存缓存保留 24 小时
    refetchOnWindowFocus: false, // 模型列表不需要频繁刷新
    refetchOnMount: false, // 组件挂载时不自动刷新（如果有缓存）
    refetchOnReconnect: true, // 网络重连时刷新
    retry: 2, // 失败时重试 2 次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
    // 使用缓存数据的同时在后台重新验证
    placeholderData: (previousData) => previousData,
  });
}

/**
 * 获取默认模型
 */
export function useDefaultModel() {
  const { data } = useModels();
  return data?.default_model;
}

/**
 * 根据 ID 获取特定模型信息
 */
export function useModel(modelId: string | undefined) {
  const { data } = useModels();
  return data?.models.find((model) => model.id === modelId);
}

/**
 * 获取支持视觉的模型列表
 */
export function useVisionModels() {
  const { data, ...rest } = useModels();
  const visionModels = data?.models.filter((model) => model.supports_vision);
  
  return {
    ...rest,
    data: visionModels,
  };
}

/**
 * 获取支持工具调用的模型列表
 */
export function useToolModels() {
  const { data, ...rest } = useModels();
  const toolModels = data?.models.filter((model) => model.supports_tools);
  
  return {
    ...rest,
    data: toolModels,
  };
}

/**
 * 按提供商分组的模型列表
 */
export function useModelsByProvider() {
  const { data, ...rest } = useModels();
  
  const modelsByProvider = data?.models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof data.models>);
  
  return {
    ...rest,
    data: modelsByProvider,
  };
}

/**
 * 管理当前选择的模型（全局状态 + localStorage 持久化）
 * 
 * 特性：
 * - 跨页面共享模型选择状态
 * - localStorage 持久化，刷新页面后保持选择
 * - 自动使用 API 默认模型作为初始值
 * 
 * @example
 * ```tsx
 * function ModelSelector() {
 *   const selectedModel = useSelectedModel();
 *   
 *   return (
 *     <select 
 *       value={selectedModel.selectedModel || ''} 
 *       onChange={(e) => selectedModel.setSelectedModel(e.target.value)}
 *     >
 *       <option>Select a model</option>
 *     </select>
 *   );
 * }
 * ```
 */
export function useSelectedModel() {
  const { data: modelsData } = useModels();
  const STORAGE_KEY = 'mira-selected-model';
  
  // 从 localStorage 读取初始值
  const getInitialModel = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  
  const [selectedModel, setSelectedModelState] = useState<string | null>(getInitialModel);
  
  // 当模型数据加载完成时，如果没有选中的模型，使用默认模型
  useEffect(() => {
    if (modelsData?.default_model && !selectedModel) {
      setSelectedModelState(modelsData.default_model);
      try {
        localStorage.setItem(STORAGE_KEY, modelsData.default_model);
      } catch {
        // localStorage 不可用时忽略错误
      }
    }
  }, [modelsData, selectedModel]);
  
  // 设置选中的模型并持久化到 localStorage
  const setSelectedModel = (modelId: string) => {
    setSelectedModelState(modelId);
    try {
      localStorage.setItem(STORAGE_KEY, modelId);
    } catch {
      // localStorage 不可用时忽略错误
    }
  };
  
  return {
    selectedModel: selectedModel || modelsData?.default_model || null,
    setSelectedModel,
    isReady: Boolean(modelsData),
  };
}
