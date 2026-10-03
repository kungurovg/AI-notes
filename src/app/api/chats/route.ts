import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get("noteId");

  const allChats = noteId
    ? await db.select().from(chats).where(eq(chats.noteId, noteId))
    : await db.select().from(chats);

  return Response.json(allChats);
}

export async function POST(request: Request) {
  const body = await request.json();
  const now = new Date().toISOString();

  const newChat = {
    id: crypto.randomUUID(),
    noteId: body.noteId ?? "general",
    title: body.title ?? "New chat",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(chats).values(newChat);
  return Response.json(newChat, { status: 201 });
}
