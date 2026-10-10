import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, messages as messagesTable } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { updateChatSchema } from "@/lib/validations";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { id } = await params;
  const body = updateChatSchema.parse(await request.json());

  const updated = await db
    .update(chats)
    .set({ ...body, updatedAt: new Date().toISOString() })
    .where(and(eq(chats.id, id), eq(chats.userId, userId)))
    .returning();

  if (updated.length === 0) {
    return fail("Чат не найден", 404);
  }

  return Response.json(updated[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { id } = await params;

  // Сначала убеждаемся, что чат принадлежит пользователю
  const [chat] = await db
    .select()
    .from(chats)
    .where(and(eq(chats.id, id), eq(chats.userId, userId)));

  if (!chat) {
    return fail("Чат не найден", 404);
  }

  // Удаляем сообщения чата, затем сам чат — в одной транзакции
  await db.transaction(async (tx) => {
    await tx.delete(messagesTable).where(eq(messagesTable.chatId, id));
    await tx.delete(chats).where(eq(chats.id, id));
  });

  return Response.json({ success: true });
}
