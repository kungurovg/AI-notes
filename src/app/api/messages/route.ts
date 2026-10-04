import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, messages } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { createMessageSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) {
    return fail("chatId обязателен", 400);
  }

  // Проверяем, что чат принадлежит пользователю
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  if (!chat) {
    return fail("Чат не найден", 404);
  }

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);

  return Response.json(chatMessages);
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const body = createMessageSchema.parse(await request.json());

  // Проверяем, что чат принадлежит пользователю
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, body.chatId), eq(chats.userId, userId)));

  if (!chat) {
    return fail("Чат не найден", 404);
  }

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
