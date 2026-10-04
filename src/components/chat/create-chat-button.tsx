"use client";

import { useAppStore } from "@/store/app-store";
import { Button } from "../ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createChat } from "@/lib/api/chats";
import { MessageSquarePlus } from "lucide-react";

export function CreateChatButton() {
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const selectChat = useAppStore((state) => state.selectChat);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createChat(selectedNoteId!),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats", selectedNoteId] });
      selectChat(newChat.id);
    },
  });

  return (
    <Button
      className="w-full justify-start gap-2 px-2 text-sm font-normal text-muted-foreground hover:text-foreground"
      variant="ghost"
      onClick={() => mutation.mutate()}
      disabled={!selectedNoteId || mutation.isPending}
    >
      <MessageSquarePlus className="h-4 w-4" />
      {mutation.isPending ? "Create" : "New chat"}
    </Button>
  );
}
