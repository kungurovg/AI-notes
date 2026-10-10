"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MessageSquare, Trash2, Pencil } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { fetchChats, deleteChat, updateChat } from "@/lib/api/chats";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function ChatsList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchQuery = useAppStore((state) => state.searchQuery);
  const selectedChatId = useAppStore((state) => state.selectedChatId);
  const selectChat = useAppStore((state) => state.selectChat);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: chats = [], isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => fetchChats(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.removeQueries({ queryKey: ["messages", deletedId] });
      if (selectedChatId === deletedId) {
        selectChat(null);
        router.push("/");
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      updateChat(id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditValue(currentTitle);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      updateMutation.mutate({ id: editingId, title: trimmed });
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const lowerQuery = searchQuery.trim().toLowerCase();
  const isSearching = lowerQuery.length > 0;

  if (isLoading) {
    return (
      <p className="px-2 py-1 text-xs text-muted-foreground">Loading...</p>
    );
  }

  const filtered = isSearching
    ? chats.filter((chat) =>
        (chat.title || "").toLowerCase().includes(lowerQuery),
      )
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
          {editingId === chat.id ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className="h-6 flex-1 border-none bg-transparent px-1 text-sm shadow-none focus-visible:ring-1"
            />
          ) : (
            <>
              <button
                onClick={() => handleClick(chat.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="w-full truncate text-sm">
                  {chat.title || "New chat"}
                </span>
              </button>

              {/* Кнопки действий — при hover */}
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEdit(chat.id, chat.title || "");
                  }}
                  className="rounded p-1 hover:bg-accent"
                  title="Переименовать"
                >
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(chat.id);
                  }}
                  className="rounded p-1 hover:bg-destructive/10"
                  title="Удалить"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
