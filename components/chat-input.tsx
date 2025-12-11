"use client";

import { useState } from "react";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { useTranslations } from "next-intl";
import { GlobeIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatStatus } from "ai";
import { useModels, useSelectedModel } from "@/hooks/use-models";

// 降级模型列表（API 请求失败时使用）
const fallbackModels = [
  {
    name: "Deepseek R1",
    value: "deepseek/deepseek-r1",
  },
];

interface ChatInputProps {
  onSubmit: (message: PromptInputMessage, options: { model: string; webSearch: boolean }) => void;
  className?: string;
  textareaClassName?: string;
  status?: ChatStatus;
  initialWebSearch?: boolean;
}

export function ChatInput({
  onSubmit,
  className,
  textareaClassName,
  status = "ready",
  initialWebSearch = false,
}: ChatInputProps) {
  const tChatbot = useTranslations("chatbot");
  const { data: modelsData, isLoading: isLoadingModels } = useModels();
  const { selectedModel, setSelectedModel } = useSelectedModel();
  
  const [input, setInput] = useState("");
  const [webSearch, setWebSearch] = useState(initialWebSearch);

  // 使用 API 数据或降级到默认模型
  const availableModels = modelsData?.models.map(m => ({
    name: m.name,
    value: m.id,
  })) || fallbackModels;

  // 当前选中的模型（使用全局状态或降级模型）
  const currentModel = selectedModel || fallbackModels[0].value;

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    onSubmit(message, { model: currentModel, webSearch });
    setInput("");
  };

  return (
    <PromptInput
      onSubmit={handleSubmit}
      className={className}
      globalDrop
      multiple
    >
      <PromptInputHeader>
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>
      </PromptInputHeader>
      <PromptInputBody>
        <PromptInputTextarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder={tChatbot("placeholder")}
          className={textareaClassName}
        />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputActionMenu>
            <PromptInputActionMenuTrigger />
            <PromptInputActionMenuContent>
              <PromptInputActionAddAttachments />
            </PromptInputActionMenuContent>
          </PromptInputActionMenu>
          <PromptInputButton
            variant={webSearch ? "default" : "ghost"}
            onClick={() => setWebSearch(!webSearch)}
          >
            <GlobeIcon size={16} />
            <span>Search</span>
          </PromptInputButton>
          <PromptInputSelect
            onValueChange={setSelectedModel}
            value={currentModel}
            disabled={isLoadingModels}
          >
            <PromptInputSelectTrigger>
              {isLoadingModels ? (
                <div className="flex items-center gap-2">
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                  <span>加载中...</span>
                </div>
              ) : (
                <PromptInputSelectValue />
              )}
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              {availableModels.map((model) => (
                <PromptInputSelectItem
                  key={model.value}
                  value={model.value}
                >
                  {model.name}
                </PromptInputSelectItem>
              ))}
            </PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!input && status !== "streaming"} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}

