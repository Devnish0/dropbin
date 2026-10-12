import { createFileDrop, createTextDrop } from "@/lib/drops";
import {
  createFileDropSchema,
  createTextDropSchema,
} from "@/lib/validations/drop";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  console.log("--> API /api/drop received body:", body);

  if (body.type === "image" || body.type === "file") {
    const parsedBody = createFileDropSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({
        success: false,
        error: parsedBody.error.issues[0].message,
      });
    }
    const response = await createFileDrop(parsedBody.data);
    return NextResponse.json(response);
  }

  const parsedBody = createTextDropSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json({
      success: false,
      error: parsedBody.error.issues[0].message,
    });
  }

  const response = await createTextDrop(parsedBody.data);
  return NextResponse.json(response);
}
