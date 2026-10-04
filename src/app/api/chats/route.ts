import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { requireUser, fail } from "@/lib/session";
import { createChatSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  const allChats = noteId
    ? await db
        .select()
        .from(chats)
        .where(and(eq(chats.userId, userId), eq(chats.noteId, noteId)))
    : await db.select().from(chats).where(eq(chats.userId, userId));

  return Response.json(allChats);
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const body = createChatSchema.parse(await request.json());
  const now = new Date().toISOString();

  const newChat = {
    id: crypto.randomUUID(),
    userId,
    noteId: body.noteId ?? "general",
    title: body.title ?? "New chat",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(chats).values(newChat);
  return Response.json(newChat, { status: 201 });
}
