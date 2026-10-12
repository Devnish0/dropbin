import { getPresignedUploadUrl } from "@/lib/r2";
import { fileUploadSchema } from "@/lib/validations/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsedBody = fileUploadSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json({
      success: false,
      error: parsedBody.error.issues[0].message,
    });
  }

  const fileKey = `uploads/${crypto.randomUUID()}-${parsedBody.data.fileName}`;
  const uploadUrl = await getPresignedUploadUrl(
    fileKey,
    parsedBody.data.contentType,
  );
  return NextResponse.json({ uploadUrl, fileKey }, { status: 200 });
}
