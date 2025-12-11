"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChatInput } from "@/components/chat-input";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useCreateSession, DEFAULT_USER_ID } from "@/hooks/use-chat";

export default function Dashboard() {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const tChatbot = useTranslations("chatbot");
  const createSession = useCreateSession();

  const handleSubmit = async (
    message: PromptInputMessage,
    options: { model: string; webSearch: boolean }
  ) => {
    if (!message.text) return;
    
    try {
      // 1. 创建新会话（使用 API）
      const newSession = await createSession.mutateAsync({
        // title: "新对话",
        model: options.model,
        user_id: DEFAULT_USER_ID,
      });

      // 2. 使用 sessionStorage 存储初始消息和配置（避免 URL 长度限制）
      const initialData = {
        initialMessage: message.text,
        model: options.model,
        webSearch: options.webSearch,
        timestamp: Date.now(), // 添加时间戳用于验证
      };
      sessionStorage.setItem(
        `chat-initial-${newSession.id}`,
        JSON.stringify(initialData)
      );

      // 3. 跳转到新会话页面
      router.push(`/chat/${newSession.id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center max-w-3xl mx-auto w-full p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">{t("welcome")}</h1>
        {/* <p className="text-lg text-muted-foreground">
          {tChatbot("placeholder")}
        </p> */}
      </div>
      
      <div className="w-full max-w-2xl">
        <ChatInput
          onSubmit={handleSubmit}
          textareaClassName="min-h-80px]"
          status={createSession.isPending ? "submitted" : "ready"}
        />
      </div>
    </div>
  );
}
