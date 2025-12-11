/**
 * Mira Backend API 客户端工具
 * API 文档: https://api-test.mirahr.ai/openapi.json
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-test.mirahr.ai';

// ==================== 类型定义 ====================

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  context_window: number;
  supports_vision: boolean;
  supports_tools: boolean;
  is_default: boolean;
}

export interface ModelsListResponse {
  models: ModelInfo[];
  default_model: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  parts: Array<{ type: 'text'; text: string }>;
}

export interface ChatStreamRequest {
  id: string;
  trigger: string;
  messages: ChatMessage[];
  user_id?: string;
  model?: string;
}

export interface CreateSessionRequest {
  user_id: string;
  model?: string | null;
  temperature?: number;
  max_tokens?: number;
  title?: string | null;
  system_prompt?: string | null;
}

export interface SessionResponse {
  id: string;
  user_id: string;
  title?: string | null;
  model: string;
  temperature: number;
  max_tokens: number;
  message_count: number;
  created_at: string;
  updated_at: string;
  last_message_at?: string | null;
}

export interface SessionSummary {
  id: string;
  title?: string | null;
  model: string;
  message_count: number;
  total_tokens: number;
  last_message_at?: string | null;
  created_at: string;
}

export interface MessageResponse {
  id: string;
  session_id: string;
  user_id: string;
  role: string;
  content: string;
  sequence_number: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  created_at: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string | null;
  preferred_language?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStatsResponse {
  id: string;
  email: string;
  name?: string | null;
  total_messages: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  created_at: string;
}

// ==================== API 客户端类 ====================

class MiraAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * 通用请求方法
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `API 请求失败: ${response.status}`);
    }

    return response.json();
  }

  // ==================== 聊天相关 ====================

  /**
   * 获取支持的模型列表
   */
  async getModels(): Promise<ModelsListResponse> {
    return this.request<ModelsListResponse>('/api/chat/models');
  }

  /**
   * 流式聊天（返回 Response 对象，用于 SSE）
   * 注意：这个方法不解析响应，直接返回 Response 供流式处理
   */
  async streamChat(request: ChatStreamRequest): Promise<Response> {
    const url = `${this.baseURL}/api/chat/stream`;
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  }

  /**
   * 断线重连
   */
  async resumeStream(streamId: string, offset?: number): Promise<Response> {
    const params = new URLSearchParams();
    if (offset !== undefined) {
      params.append('offset', offset.toString());
    }
    
    const url = `${this.baseURL}/api/chat/stream/${streamId}/resume?${params}`;
    return fetch(url);
  }

  // ==================== 会话管理 ====================

  /**
   * 创建新会话
   */
  async createSession(data: CreateSessionRequest): Promise<SessionResponse> {
    return this.request<SessionResponse>('/api/chat/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 获取用户的所有会话列表
   */
  async getUserSessions(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<SessionSummary[]> {
    return this.request<SessionSummary[]>(
      `/api/chat/sessions?user_id=${userId}&limit=${limit}&offset=${offset}`
    );
  }

  /**
   * 获取会话详情
   */
  async getSession(sessionId: string): Promise<SessionResponse> {
    return this.request<SessionResponse>(`/api/chat/sessions/${sessionId}`);
  }

  /**
   * 更新会话信息
   */
  async updateSession(
    sessionId: string,
    data: {
      title?: string | null;
      model?: string | null;
      temperature?: number | null;
      max_tokens?: number | null;
      system_prompt?: string | null;
    }
  ): Promise<SessionResponse> {
    return this.request<SessionResponse>(`/api/chat/sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${this.baseURL}/api/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // ==================== 消息管理 ====================

  /**
   * 获取会话的消息历史
   */
  async getSessionMessages(
    sessionId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<MessageResponse[]> {
    return this.request<MessageResponse[]>(
      `/api/chat/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`
    );
  }

  // ==================== 用户管理 ====================

  /**
   * 创建用户
   */
  async createUser(email: string, name?: string): Promise<UserResponse> {
    const params = new URLSearchParams({ email });
    if (name) params.append('name', name);
    
    return this.request<UserResponse>(`/api/users/?${params}`, {
      method: 'POST',
    });
  }

  /**
   * 获取用户信息
   */
  async getUser(userId: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/api/users/${userId}`);
  }

  /**
   * 更新用户信息
   */
  async updateUser(
    userId: string,
    data: {
      name?: string | null;
      preferred_language?: string | null;
    }
  ): Promise<UserResponse> {
    const params = new URLSearchParams();
    if (data.name !== undefined) params.append('name', data.name || '');
    if (data.preferred_language) params.append('preferred_language', data.preferred_language);
    
    return this.request<UserResponse>(`/api/users/${userId}?${params}`, {
      method: 'PATCH',
    });
  }

  /**
   * 删除用户
   */
  async deleteUser(userId: string): Promise<void> {
    await fetch(`${this.baseURL}/api/users/${userId}`, {
      method: 'DELETE',
    });
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(userId: string): Promise<UserStatsResponse> {
    return this.request<UserStatsResponse>(`/api/users/${userId}/stats`);
  }

  // ==================== 健康检查 ====================

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: boolean;
    timestamp: string;
    version?: string | null;
  }> {
    return this.request('/api/health');
  }
}

// ==================== 导出实例 ====================

/**
 * 默认 API 客户端实例
 */
export const apiClient = new MiraAPIClient();

/**
 * 创建自定义 API 客户端实例
 */
export const createAPIClient = (baseURL: string) => new MiraAPIClient(baseURL);

// ==================== 便捷方法 ====================

/**
 * 创建会话的便捷方法
 */
export async function createSession(
  userId: string,
  options?: {
    model?: string;
    title?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<SessionResponse> {
  return apiClient.createSession({
    user_id: userId,
    model: options?.model,
    title: options?.title,
    temperature: options?.temperature,
    max_tokens: options?.maxTokens,
    system_prompt: options?.systemPrompt,
  });
}

/**
 * 流式聊天的便捷方法（用于客户端组件）
 */
export async function streamChatResponse(
  messages: ChatMessage[],
  options?: {
    sessionId?: string;
    userId?: string;
    model?: string;
  }
): Promise<Response> {
  const request: ChatStreamRequest = {
    id: options?.sessionId || `chat-${Date.now()}`,
    trigger: 'submit-message',
    messages,
    user_id: options?.userId,
    model: options?.model,
  };

  return apiClient.streamChat(request);
}

/**
 * 将简单文本转换为 ChatMessage 格式
 */
export function createTextMessage(
  text: string,
  role: 'user' | 'assistant' | 'system' = 'user',
  id?: string
): ChatMessage {
  return {
    id: id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    parts: [{ type: 'text', text }],
  };
}

