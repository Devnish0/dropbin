import { db } from "@/db";
import { drops } from "@/db/schema";
import { deleteR2ObjectsBatch } from "@/lib/r2";
import { eq, gte, inArray, lte, or } from "drizzle-orm";
import { FileKey } from "lucide-react";
import { NextResponse } from "next/server";
import { string, success } from "zod";

export async function GET() {
  const expiredDrops = await db
    .select({
      id: drops.id,
      FileKey: drops.fileKey,
    })
    .from(drops)
    .where(
      or(lte(drops.expiresAt, new Date()), gte(drops.maxViews, drops.views)),
    );

  if (expiredDrops.length === 0) {
    return NextResponse.json({ cleanedCound: 0, filesDeleted: 0 });
  }

  const fileKeys = expiredDrops
    .map((d) => d.FileKey)
    .filter((key): key is string => Boolean(key));

  if (fileKeys.length > 0) {
    await deleteR2ObjectsBatch(fileKeys);
  }
  const deletedDropsId = expiredDrops.map((d) => d.id);
  await db.delete(drops).where(inArray(drops.id, deletedDropsId));

  return NextResponse.json({
    cleanedCount: expiredDrops.length,
    filesDeleted: fileKeys.length,
  });
}
