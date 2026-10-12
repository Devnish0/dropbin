import z from "zod";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1).max(255),
  contentType: z.string(),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(100 * 1024 * 1024),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;
