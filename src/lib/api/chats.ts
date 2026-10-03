export type Chat = {
  id: string;
  noteId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchChats(noteId?: string): Promise<Chat[]> {
  const url = noteId ? `/api/chats?noteId=${noteId}` : "/api/chats";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function createChat(noteId?: string): Promise<Chat> {
  const res = await fetch("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ noteId }),
  });
  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function deleteChat(id: string): Promise<void> {
  const res = await fetch(`/api/chats/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete chat");
}
