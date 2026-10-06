"use client";

import { useRouter } from "next/navigation";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { createChat } from "@/lib/api/chats";

export function CreateChatButton() {
  const router = useRouter();
  const selectedNoteId = useAppStore((state) => state.selectedNoteId);
  const selectChat = useAppStore((state) => state.selectChat);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => createChat(selectedNoteId ?? undefined),
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      selectChat(newChat.id);
      router.push(`/chat/${newChat.id}`);
    },
  });

  return (
    <Button
      className="w-full justify-start gap-2 px-2 text-sm font-normal text-muted-foreground hover:text-foreground"
      variant="ghost"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      <MessageSquarePlus className="h-4 w-4" />
      {mutation.isPending ? "Creating..." : "New chat"}
    </Button>
  );
}
