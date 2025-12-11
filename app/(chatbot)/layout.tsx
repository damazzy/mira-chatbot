import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/animate-ui/components/radix/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          {/* 顶部导航栏 */}
          <header className="flex items-center justify-between p-4 border-b bg-background sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
          </header>
          {/* 主内容区域 */}
          <div className="relative flex-1 overflow-hidden">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
