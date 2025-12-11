/**
 * 统一的会话和消息管理 Hook
 * 合并了 use-sessions、use-messages、use-chat-history 的所有功能
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SessionSummary, SessionResponse, MessageResponse } from '@/lib/api-client';

// ==================== 默认配置 ====================

/**
 * 默认用户 ID（未实现用户鉴权时使用）
 */
export const DEFAULT_USER_ID = 'd544f6dd-aa49-4127-a424-f600b26e810b';

// ==================== 类型定义 ====================

export interface ChatHistoryItem {
  id: string;
  title: string | null;
  updatedAt: number;
  messageCount: number;
  model?: string;
}

// ==================== 核心 Hook：会话历史 ====================

/**
 * 会话历史管理（仅使用 API）
 * 
 * @param userId - 用户 ID（可选，默认使用 DEFAULT_USER_ID）
 * 
 * @example
 * ```tsx
 * // 使用默认用户
 * const { chats, deleteChat } = useChatHistory();
 * 
 * // 指定用户
 * const { chats, deleteChat } = useChatHistory('custom-user-id');
 * ```
 */
export function useChatHistory(userId: string = DEFAULT_USER_ID) {
  const queryClient = useQueryClient();

  // ==================== 获取会话列表 ====================
  const {
    data: apiSessions,
    isLoading,
    error,
  } = useQuery<SessionSummary[]>({
    queryKey: ['sessions', userId],
    queryFn: () => apiClient.getUserSessions(userId, 100),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // ==================== 删除会话 ====================
  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  // ==================== 转换为统一格式 ====================
  const chats: ChatHistoryItem[] = (apiSessions || []).map((session) => ({
    id: session.id,
    title: session.title || '新对话',
    updatedAt: session.last_message_at
      ? new Date(session.last_message_at).getTime()
      : new Date(session.created_at).getTime(),
    messageCount: session.message_count,
    model: session.model,
  }));

  // ==================== 删除方法 ====================
  const handleDeleteChat = async (chatId: string) => {
    await deleteSessionMutation.mutateAsync(chatId);
  };

  return {
    chats,
    isLoading,
    error,
    deleteChat: handleDeleteChat,
    isDeleting: deleteSessionMutation.isPending,
    userId, // 返回当前使用的 userId
  };
}

// ==================== 可选：单个会话详情 ====================

/**
 * 获取单个会话详情（仅 API）
 */
export function useSession(sessionId: string | undefined) {
  return useQuery<SessionResponse>({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient.getSession(sessionId!),
    enabled: Boolean(sessionId),
    staleTime: 30 * 1000,
  });
}

// ==================== 可选：消息历史 ====================

/**
 * 获取会话的消息历史（仅 API）
 */
export function useMessages(sessionId: string | undefined, limit: number = 100) {
  return useQuery<MessageResponse[]>({
    queryKey: ['messages', sessionId, limit],
    queryFn: () => apiClient.getSessionMessages(sessionId!, limit),
    enabled: Boolean(sessionId),
    staleTime: 10 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// ==================== 可选：创建会话 ====================

/**
 * 创建新会话（仅 API）
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title?: string | null;
      model?: string | null;
      temperature?: number;
      max_tokens?: number;
      system_prompt?: string | null;
      user_id?: string;
    }) => apiClient.createSession({
      user_id: data.user_id || DEFAULT_USER_ID,
      title: data.title,
      model: data.model,
      temperature: data.temperature,
      max_tokens: data.max_tokens,
      system_prompt: data.system_prompt,
    }),
    onSuccess: (newSession) => {
      queryClient.setQueryData(['session', newSession.id], newSession);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// ==================== 可选：更新会话 ====================

/**
 * 更新会话信息（仅 API）
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      data,
    }: {
      sessionId: string;
      data: {
        title?: string | null;
        model?: string | null;
        temperature?: number | null;
        max_tokens?: number | null;
        system_prompt?: string | null;
      };
    }) => apiClient.updateSession(sessionId, data),
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['session', updatedSession.id], updatedSession);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

