"use client";

import { Search } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { CreateChatButton } from "../chat/create-chat-button";
import { ChatsList } from "../chat/chats-list";
import Link from "next/link";
import { FileText } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppSidebar() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Sidebar>
      {/* Поиск */}
      <SidebarHeader>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-8 h-8 text-sm border-none bg-accent/50 focus-visible:ring-0"
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Заметки и Чаты */}
      <SidebarContent>
        <SidebarTrigger>
          <div className="flex flex-col gap-2 p-2">
            <SidebarMenuButton render={<Link href="/notes" />}>
              <FileText className="h-4 w-4" />
              <span>All Notes</span>
            </SidebarMenuButton>
          </div>
        </SidebarTrigger>

        <SidebarGroup>
          <div className="flex flex-col gap-2 p-2">
            <CreateChatButton />
            <ChatsList />
          </div>
        </SidebarGroup>
      </SidebarContent>

      {/* Пользователь */}
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent">
              <User className="h-4 w-4" />
            </div>
            <span className="truncate text-sm">
              {session?.user.name ?? "Guest"}
            </span>
          </div>
          <Button
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
