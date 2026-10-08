import { createTextDrop } from "@/lib/drops";
import { createTextDropSchema } from "@/lib/validations/drop";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = createTextDropSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({
      success: false,
      error: parsedBody.error.issues[0].message,
    });
  }
  const response = await createTextDrop(parsedBody.data);

  // console.log(response);

  return NextResponse.json(response);
}
