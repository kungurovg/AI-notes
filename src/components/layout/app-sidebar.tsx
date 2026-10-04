"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/app-store";
import { CreateChatButton } from "../chat/create-chat-button";
import { ChatsList } from "../chat/chats-list";
import { NotesList } from "../notes/notes-list";
import { SidebarCollapsible } from "./sidebar-collapsible";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";
import { FileText, Home, LogOut, MessageSquare, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "../ui/button";

function getInitials(name?: string, email?: string): string {
  const source = name || email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function AppSidebar() {
  const searchQuery = useAppStore((state) => state.searchQuery);
  const setSearchQuery = useAppStore((state) => state.setSearchQuery);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const email = user?.email;
  const initials = getInitials(user?.name, email);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/sign-in");
    router.refresh();
  };

  return (
    <Sidebar collapsible="none">
      {/* Кнопка закрытия + поиск */}
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-sm font-semibold">AI-Notes</span>
          <ThemeToggle />
        </div>
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes & chats..."
              className="pl-8 h-8 text-sm border-none bg-accent/50 focus-visible:ring-0"
            />
          </div>
        </div>
      </SidebarHeader>

      {/* Заметки и Чаты */}
      <SidebarContent>
        {/* Быстрая навигация */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/" />}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/notes" />}>
                <FileText className="h-4 w-4" />
                <span>All Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Сворачиваемый список заметок */}
        <SidebarCollapsible label="Notes" icon={<FileText className="h-4 w-4 text-muted-foreground" />}>
          <div className="px-2">
            <NotesList />
          </div>
        </SidebarCollapsible>

        {/* Сворачиваемый список чатов */}
        <SidebarCollapsible label="Chats" icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}>
          <div className="flex flex-col gap-2 px-2">
            <CreateChatButton />
            <ChatsList />
          </div>
        </SidebarCollapsible>
      </SidebarContent>

      {/* Пользователь */}
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <div className="flex min-w-0 items-center gap-2">
            {/* Аватар с инициалами вместо generic-иконки */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm leading-tight">
                {user?.name ?? "Guest"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
          <Button
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

