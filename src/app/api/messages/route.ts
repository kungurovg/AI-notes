import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return Response.json({ error: "chatId required" }, { status: 400 });
  }

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));

  return Response.json(chatMessages);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newMessage = {
    id: crypto.randomUUID(),
    chatId: body.chatId,
    role: body.role,
    content: body.content,
    createdAt: new Date().toISOString(),
  };

  await db.insert(messages).values(newMessage);
  return Response.json(newMessage, { status: 201 });
}
