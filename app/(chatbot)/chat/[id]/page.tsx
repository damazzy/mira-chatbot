"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from "@/components/ai-elements/message";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { CopyIcon, RefreshCcwIcon } from "lucide-react";
import { ChatInput } from "@/components/chat-input";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/sources";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMessages, useSession } from "@/hooks/use-chat";
import { DefaultChatTransport } from "ai";
import { Skeleton } from "@/components/ui/skeleton";
import type { UIMessage } from "ai";

export default function ChatPage() {
  const t = useTranslations("dashboard");
  const tChatbot = useTranslations("chatbot");
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;

  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] =
    useState(false);
  const [initialWebSearch, setInitialWebSearch] = useState(false);

  // 从 API 获取会话信息和历史消息
  const { data: session, isLoading: isLoadingSession } = useSession(chatId);
  const { data: apiMessages, isLoading: isLoadingMessages } =
    useMessages(chatId);

  const { messages, setMessages, sendMessage, status, regenerate } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: "/api/chat",  // 使用本地 API 路由
    }),
  });

  // 加载历史消息：将 API 消息转换为 AI SDK 格式
  useEffect(() => {
    if (!isLoadingSession && !isLoadingMessages) {
      // 如果会话不存在，跳转到首页
      // if (!session) {
      //   router.push("/dashboard");
      //   return;
      // }

      // 转换 API 消息为 AI SDK 的 UIMessage 格式
      if (apiMessages && apiMessages.length > 0) {
        const convertedMessages: UIMessage[] = apiMessages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          parts: [
            {
              type: "text" as const,
              text: msg.content,
            },
          ],
        }));
        setMessages(convertedMessages);
      }
    }
  }, [
    apiMessages,
    isLoadingMessages,
    isLoadingSession,
    session,
    router,
    setMessages,
  ]);

  // 处理从 dashboard 传来的初始消息
  useEffect(() => {
    if (isLoadingSession || isLoadingMessages || hasProcessedInitialMessage)
      return;

    // 从 sessionStorage 读取初始数据（避免 URL 长度限制）
    const storageKey = `chat-initial-${chatId}`;
    const storedData = sessionStorage.getItem(storageKey);

    if (storedData) {
      try {
        const initialData = JSON.parse(storedData);
        const { initialMessage, model, webSearch, timestamp } = initialData;

        // 验证数据的有效性（5分钟内有效）
        const isValid = Date.now() - timestamp < 5 * 60 * 1000;

        if (initialMessage && model && isValid) {
          setInitialWebSearch(webSearch);

          // 发送初始消息
          sendMessage(
            {
              text: initialMessage,
              files: [],
            },
            {
              body: {
                model: model,
                webSearch: webSearch,
              },
            }
          );

          setHasProcessedInitialMessage(true);
        }

        // 清除 sessionStorage 数据，避免重复发送
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Failed to parse initial data:", error);
        sessionStorage.removeItem(storageKey);
      }
    }
  }, [
    isLoadingSession,
    isLoadingMessages,
    hasProcessedInitialMessage,
    chatId,
    sendMessage,
  ]);

  const handleSubmit = (
    message: PromptInputMessage,
    options: { model: string; webSearch: boolean }
  ) => {
    sendMessage(
      {
        text: message.text || "Sent with attachments",
        files: message.files,
      },
      {
        body: {
          model: options.model,
          webSearch: options.webSearch,
          temperature: 0.7,
          max_tokens: 4096,
        },
      }
    );
  };

  return (
    <div className="flex flex-col h-full  mx-auto w-full">
      <div className="flex flex-col flex-1 min-h-0">
        <Conversation>
          <ConversationContent>
            <div className="max-w-3xl mx-auto w-full">
              {(isLoadingMessages || isLoadingSession) && (
                <div className="space-y-4">
                  {/* 模拟用户消息 */}
                  <div className="flex justify-end">
                    <div className="w-3/4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                  {/* 模拟 AI 回复 */}
                  <div className="flex justify-start">
                    <div className="w-3/4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                  {/* 模拟用户消息 */}
                  <div className="flex justify-end">
                    <div className="w-2/3 space-y-2">
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  {/* 模拟 AI 回复 */}
                  <div className="flex justify-start">
                    <div className="w-3/4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                </div>
              )}
              {!isLoadingMessages &&
                !isLoadingSession &&
                messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">
                        {t("welcome")}
                      </h2>
                      <p className="text-muted-foreground">
                        {tChatbot("placeholder")}
                      </p>
                    </div>
                  </div>
                )}
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "assistant" &&
                    message.parts.filter((part) => part.type === "source-url")
                      .length > 0 && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter(
                              (part) => part.type === "source-url"
                            ).length
                          }
                        />
                        {message.parts
                          .filter((part) => part.type === "source-url")
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source
                                key={`${message.id}-${i}`}
                                href={part.url}
                                title={part.url}
                              />
                            </SourcesContent>
                          ))}
                      </Sources>
                    )}
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Message
                            key={`${message.id}-${i}`}
                            from={message.role}
                          >
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                            {message.role === "assistant" &&
                              i === message.parts.length - 1 && (
                                <MessageActions>
                                  <MessageAction
                                    onClick={() => regenerate()}
                                    label="Retry"
                                  >
                                    <RefreshCcwIcon className="size-3" />
                                  </MessageAction>
                                  <MessageAction
                                    onClick={() =>
                                      navigator.clipboard.writeText(part.text)
                                    }
                                    label="Copy"
                                  >
                                    <CopyIcon className="size-3" />
                                  </MessageAction>
                                </MessageActions>
                              )}
                          </Message>
                        );
                      case "reasoning":
                        return (
                          <Reasoning
                            key={`${message.id}-${i}`}
                            className="w-full"
                            isStreaming={
                              status === "streaming" &&
                              i === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <ChatInput
          onSubmit={handleSubmit}
          className=" max-w-3xl mx-auto pb-4 bg-background shrink-0"
          status={status as any}
          initialWebSearch={initialWebSearch}
        />
      </div>
    </div>
  );
}
