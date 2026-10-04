import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { createNoteSchema } from "@/lib/validations";

export async function GET() {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const allNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, userId));

  return Response.json(allNotes);
}

export async function POST(request: Request) {
  const userId = await requireUser();
  if (userId instanceof Response) return userId;

  const body = createNoteSchema.parse(await request.json());
  const now = new Date().toISOString();
  const newNote = {
    id: crypto.randomUUID(),
    userId,
    title: body.title ?? "Untitled",
    content: body.content ?? "",
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(notes).values(newNote);

  return Response.json(newNote, { status: 201 });
}
