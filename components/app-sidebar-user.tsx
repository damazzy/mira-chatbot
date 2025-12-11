"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenu,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { SidebarMenuButton, SidebarMenuItem, SidebarMenu } from "@/components/animate-ui/components/radix/sidebar";
import {
  ChevronsUpDown,
  LogOutIcon,
  Languages,
} from "lucide-react";
import { i18n, localeNames, type Locale } from "@/i18n/config";
import { useTranslations } from "next-intl";
import { Suspense, useCallback, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// 用户类型定义
type BasicUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export function AppSidebarUserInner() {
  const t = useTranslations("Layout");
  
  // Mock 用户数据
  const MOCK_USER: BasicUser = {
    id: "mock-user-id",
    name: t("mockUserName"),
    email: "test@example.com",
    image: null,
  };
  
  const user = MOCK_USER;

  const logout = () => {
    // 清除登录状态并跳转到登录页
    window.location.href = "/sign-in";
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-input/30 border"
              size={"lg"}
              data-testid="sidebar-user-button"
            >
              <Avatar className="rounded-full size-8 border">
                <AvatarImage
                  className="object-cover"
                  src={user.image || ""}
                  alt={user.name}
                />
                <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <span className="truncate" data-testid="sidebar-user-email">
                {user.email}
              </span>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="bg-background w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-lg"
            align="center"
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg">
                    {user.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span
                    className="truncate font-medium"
                    data-testid="sidebar-user-name"
                  >
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <SelectLanguage />
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={logout} className="cursor-pointer">
              <LogOutIcon className="size-4 text-foreground" />
              <span>{t("signOut")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function SelectLanguage() {
  const t = useTranslations("Layout");
  const [currentLocale, setCurrentLocale] = useState<Locale>(i18n.defaultLocale);

  // 从 cookie 中读取当前语言
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const localeCookie = cookies.find((row) =>
      row.startsWith(`${i18n.cookieName}=`)
    );
    if (localeCookie) {
      const locale = localeCookie.split("=")[1] as Locale;
      if (i18n.locales.includes(locale)) {
        setCurrentLocale(locale);
      }
    }
  }, []);

  const handleOnChange = useCallback((locale: Locale) => {
    document.cookie = `${i18n.cookieName}=${locale}; path=/;`;
    window.location.reload();
  }, []);

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="mr-2 size-4" />
        <span>{t("language")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="w-48 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="text-muted-foreground">
            {t("language")}
          </DropdownMenuLabel>
          {i18n.locales.map((locale) => (
            <DropdownMenuCheckboxItem
              key={locale}
              checked={locale === currentLocale}
              onCheckedChange={() =>
                locale !== currentLocale && handleOnChange(locale)
              }
            >
              {localeNames[locale]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

export function AppSidebarUserSkeleton() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground bg-input/30 border"
          size={"lg"}
          data-testid="sidebar-user-button"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AppSidebarUser() {
  return (
    <Suspense fallback={<AppSidebarUserSkeleton />}>
      <AppSidebarUserInner />
    </Suspense>
  );
}
