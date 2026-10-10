import z from "zod";
//
// const ValidcontentType = z.enum([
//   "image/jpeg",
//   "image.png",
//   "image/webp",
//   "application/pdf",
//   "text/plain",
// ]);

export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string(),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024),
});
