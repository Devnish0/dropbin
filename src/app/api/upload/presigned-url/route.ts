import { db } from "@/db";
import { CreateDropResult, createFileDrop } from "@/lib/drops";
import { getPresignedUploadUrl } from "@/lib/r2";
import { createFileDropSchema } from "@/lib/validations/drop";
// import { fileUploadSchema } from "@/lib/validations/upload";
import { NextResponse } from "next/server";
import { success } from "zod";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = createFileDropSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({
      success: false,
      error: parsedBody.error.issues[0].message,
    });
  }

  const fileKey = `uploads/${crypto.randomUUID()}-${parsedBody.data.fileName}`;
  //   console.log(fileKey);
  const dbEntry: CreateDropResult = await createFileDrop(parsedBody.data);
  if (!dbEntry.success) {
    return NextResponse.json({
      success: false,
      message: "there is an error in making the db entry",
    });
  }

  const uploadUrl = await getPresignedUploadUrl(
    fileKey,
    parsedBody.data.mimeType,
  );
  return NextResponse.json({ uploadUrl, fileKey }, { status: 200 });
}
