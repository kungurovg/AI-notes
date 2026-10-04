"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { fetchChats, deleteChat } from "@/lib/api/chats";
import { cn } from "@/lib/utils";

export function ChatsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedChatId = useAppStore((state) => state.selectedChatId);
  const selectChat = useAppStore((state) => state.selectChat);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => fetchChats(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // Если удалили активный чат — уходим на главную
      if (selectedChatId === deletedId) {
        selectChat(null);
        router.push("/");
      }
    },
  });

  const lowerQuery = searchQuery.trim().toLowerCase();
  const isSearching = lowerQuery.length > 0;

  if (isLoading) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
    );
  }

  const filtered = isSearching
    ? chats.filter((chat) => (chat.title || "").toLowerCase().includes(lowerQuery))
    : chats;

  if (filtered.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-xs text-muted-foreground">
        {isSearching ? "Nothing found" : "No chats yet"}
      </p>
    );
  }

  const handleClick = (chatId: string) => {
    selectChat(chatId);
    router.push(`/chat/${chatId}`);
  };

  return (
    <div className="flex flex-col gap-0.5">
      {filtered.map((chat) => (
        <div
          key={chat.id}
          className={cn(
            "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 transition-colors",
            "hover:bg-accent",
            selectedChatId === chat.id && "bg-accent",
          )}
        >
          <button
            onClick={() => handleClick(chat.id)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="w-full truncate text-sm">
              {chat.title || "New chat"}
            </span>
          </button>

          {/* Кнопка удаления — появляется при hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(chat.id);
            }}
            className="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      ))}
    </div>
  );
}

