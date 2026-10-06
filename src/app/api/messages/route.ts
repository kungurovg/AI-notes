import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { messages, chats } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { createMessageSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const userCheck = await requireUser();
  if (userCheck instanceof Response) return userCheck;
  const userId = userCheck;

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");

  if (!chatId) return fail("chatId обязателен", 400);

  // Проверяем, что чат принадлежит пользователю
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, chatId), eq(chats.userId, userId)));

  if (!chat) return fail("Чат не найден", 404);

  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId));

  return Response.json(chatMessages);
}

export async function POST(request: Request) {
  const userCheck = await requireUser();
  if (userCheck instanceof Response) return userCheck;
  const userId = userCheck;

  const body = await request.json();
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) return fail("Неверные данные", 400);

  // Проверяем владельца чата
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, parsed.data.chatId), eq(chats.userId, userId)));

  if (!chat) return fail("Чат не найден", 404);

  // Роль всегда 'user' — клиент не может подделать
  const newMessage = {
    id: crypto.randomUUID(),
    chatId: parsed.data.chatId,
    role: "user" as const,
    content: parsed.data.content,
    createdAt: new Date().toISOString(),
  };

  await db.insert(messages).values(newMessage);
  return Response.json(newMessage, { status: 201 });
}
