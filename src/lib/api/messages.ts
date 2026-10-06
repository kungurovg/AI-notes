export type Message = {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export async function fetchMessages(chatId: string): Promise<Message[]> {
  const res = await fetch(`/api/messages?chatId=${chatId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export async function saveMessage(
  chatId: string,
  content: string,
): Promise<Message> {
  const res = await fetch("/api/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId, content }),
  });
  if (!res.ok) throw new Error("Failed to save message");
  return res.json();
}
