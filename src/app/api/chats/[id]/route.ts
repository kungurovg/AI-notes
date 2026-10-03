import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats, messages as messagesTable } from "@/lib/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Сначала удаляем сообщения чата
  await db.delete(messagesTable).where(eq(messagesTable.chatId, id));

  // Потом сам чат
  const deleted = await db.delete(chats).where(eq(chats.id, id)).returning();

  if (deleted.length === 0) {
    return Response.json({ error: "Chat not found" }, { status: 404 });
  }

  return Response.json({ success: true });
}
