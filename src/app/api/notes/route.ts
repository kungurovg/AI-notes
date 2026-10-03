import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";

export async function GET() {
  const allNotes = await db.select().from(notes);
  return Response.json(allNotes);
}

export async function POST(request: Request) {
  const body = await request.json();

  const now = new Date().toISOString();
  const newNote = {
    id: crypto.randomUUID(),
    title: body.title ?? "Untitled",
    content: body.content ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(notes).values(newNote);

  return Response.json(newNote, { status: 201 });
}
