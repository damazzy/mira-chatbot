/**
 * 会话存储管理工具
 * 使用浏览器 localStorage 存储会话数据
 */

import type { UIMessage } from "ai";

export interface Chat {
  id: string;
  title: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "mira-chats";

/**
 * 获取所有会话
 */
export function getAllChats(): Chat[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load chats:", error);
    return [];
  }
}

/**
 * 获取单个会话
 */
export function getChat(id: string): Chat | null {
  const chats = getAllChats();
  return chats.find((chat) => chat.id === id) || null;
}

/**
 * 创建新会话
 */
export function createChat(title?: string): Chat {
  const now = Date.now();
  const newChat: Chat = {
    id: generateId(),
    title: title || "新对话",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  const chats = getAllChats();
  chats.unshift(newChat);
  saveChats(chats);
  
  return newChat;
}

/**
 * 更新会话
 */
export function updateChat(id: string, updates: Partial<Chat>): void {
  const chats = getAllChats();
  const index = chats.findIndex((chat) => chat.id === id);
  
  if (index === -1) return;
  
  chats[index] = {
    ...chats[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  saveChats(chats);
}

/**
 * 删除会话
 */
export function deleteChat(id: string): void {
  const chats = getAllChats();
  const filteredChats = chats.filter((chat) => chat.id !== id);
  saveChats(filteredChats);
}

/**
 * 保存所有会话到 localStorage
 */
function saveChats(chats: Chat[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error("Failed to save chats:", error);
  }
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

