import { Drop, drops } from "@/db/schema";
import { calculateExpiresAt, ExpiryDuration } from "./expiry";
import getOrCreateSession from "./session";
import { db } from "@/db";
import { generateCode, isValidCustomCode } from "./code";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { createFileDropInput, createTextDropInput } from "./validations/drop";
import { getPresignedDownloadUrl } from "./r2";

// interface createTextDropInput {
//   code?: string;
//   textContent: string;
//   MaxViews?: number;
//   duration?: ExpiryDuration;
// }

export type CreateDropResult =
  | { success: true; drop: Drop }
  | { success: false; error: string; code?: string };

function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string; cause?: { code?: string } };
  return err.code === "23505" || err.cause?.code === "23505";
}

export async function createTextDrop(
  input: createTextDropInput,
): Promise<CreateDropResult> {
  let textContent = input.textContent.trim();

  if (!textContent) {
    return { success: false, error: "Content cannot be empty." };
  }

  const userId = await getOrCreateSession();

  const expiresAt = calculateExpiresAt(input.duration);

  // TODO: ADD THE CUSTOM CODE RETRY LOGIC

  // 3. Handle custom code vs auto-generated code
  if (input.code && input.code.trim()) {
    const code = input.code.trim();
    const validation = isValidCustomCode(code);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Invalid custom code.",
      };
    }
  }

  try {
    const [newDrop] = await db
      .insert(drops)
      .values({
        code: input.code?.trim() || generateCode(),
        type: "text",
        userId,
        textContent,
        maxViews: input.maxViews || 100,
        expiresAt,
      })
      .returning();
    return { success: true, drop: newDrop };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "this key exists use another key please",
      };
    }
    return { success: false, error: "this should not happen" };
  }
}

export async function createFileDrop(
  input: createFileDropInput,
): Promise<CreateDropResult> {
  const userId = await getOrCreateSession();
  const expiresAt = calculateExpiresAt(input.duration);

  // TODO: ADD THE CUSTOM CODE RETRY LOGIC

  // 3. Handle custom code vs auto-generated code
  if (input.code && input.code.trim()) {
    const code = input.code.trim();
    const validation = isValidCustomCode(code);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || "Invalid custom code.",
      };
    }
  }

  try {
    const [newDrop] = await db
      .insert(drops)
      .values({
        userId,
        code: input.code?.trim() || generateCode(),
        type: input.type,
        fileKey: input.fileKey,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        maxViews: input.maxViews || 100,
        expiresAt,
      })
      .returning();
    return { success: true, drop: newDrop };
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        success: false,
        error: "this key exists use another key please",
      };
    }
    return { success: false, error: "this should not happen" };
  }
}
// getting by code

export type DropWithDownloadUrl = Drop & { downloadUrl?: string };

export async function getDropByCode(
  incomingCode: string,
): Promise<DropWithDownloadUrl | null> {
  if (!isValidCustomCode(incomingCode)) {
    return null;
  }
  try {
    const date = new Date();

    const [drop] = await db
      .select()
      .from(drops)
      .where(
        and(
          eq(drops.code, incomingCode),
          gt(drops.expiresAt, date),
          gt(drops.maxViews, drops.views),
        ),
      );
    if (!drop) {
      return null;
    }
    // if (drop.views > drop.maxViews) return null;

    await db
      .update(drops)
      .set({ views: sql`${drops.views} + 1` })
      .where(eq(drops.id, drop.id));

    let downloadUrl: string | undefined = undefined;
    if (drop.fileKey) {
      downloadUrl = await getPresignedDownloadUrl(
        drop.fileKey,
        drop.fileName ?? undefined,
      );
    }

    return { ...drop, views: drop.views + 1, downloadUrl };
  } catch (error) {
    return null;
  }
}

