"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/animate-ui/components/radix/sidebar";
import {
  MessageSquareIcon,
  PlusIcon,
  BotIcon,
  Trash2Icon,
  Loader2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebarUser } from "./app-sidebar-user";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useChatHistory } from "@/hooks/use-chat";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("chatbot");
  
  // 使用会话历史 hook（使用默认用户 ID）
  const {
    chats,
    isLoading,
    deleteChat: handleDeleteChatApi,
    isDeleting,
  } = useChatHistory();

  const handleNewChat = () => {
    // 跳转到 dashboard 页面
    router.push("/dashboard");
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await handleDeleteChatApi(chatId);
      
      // 如果删除的是当前会话，跳转到 dashboard
      if (pathname.includes(chatId)) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return t("today");
    } else if (diffInHours < 48) {
      return t("yesterday");
    } else if (diffInHours < 168) {
      return t("thisWeek");
    } else {
      return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <BotIcon className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-lg">Mira Chatbot</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleNewChat}
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>{t("newChat")}</span>
                  </Button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="flex-1 min-h-0">
          <SidebarGroupLabel>
            <div className="flex items-center justify-between w-full">
              <span>{t("history")}</span>
              {isLoading && (
                <Loader2Icon className="h-3 w-3 animate-spin" />
              )}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <SidebarMenu>
                {isLoading ? (
                  // 加载骨架屏
                  <div className="px-2 space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : chats.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                    {t("noHistory")}
                  </div>
                ) : (
                  chats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname.includes(chat.id)}
                      >
                        <a
                          href={`/chat/${chat.id}`}
                          className="flex items-center gap-2 group"
                        >
                          <MessageSquareIcon className="h-4 w-4 shrink-0" />
                          <div className="flex-1 min-w-0 flex flex-col">
                            <span className="truncate text-sm">
                              {chat.title}
                            </span>
                            {/* <span className="text-xs text-muted-foreground">
                              {formatDate(chat.updatedAt)}
                            </span> */}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2Icon className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2Icon className="h-3 w-3" />
                            )}
                          </Button>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <AppSidebarUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
