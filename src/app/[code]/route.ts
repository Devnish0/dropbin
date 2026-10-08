import { getDropByCode } from "@/lib/drops";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const drop = await getDropByCode(code);
  if (!drop) {
    return NextResponse.json({
      success: false,
      message: "cannot find your code",
    });
  }
  console.log(drop);
  return NextResponse.json({ success: true, ...drop });
}
