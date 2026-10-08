import z from "zod";
import { EXPIRY_DURATIONS, ExpiryDuration } from "../expiry";

const durationKeys = Object.keys(EXPIRY_DURATIONS) as [
  ExpiryDuration,
  ...ExpiryDuration[],
];
export const createTextDropSchema = z.object({
  textContent: z
    .string()
    .trim()
    .min(1, "Drop content cannot be empty")
    .max(500_000, "Content cannot exceed 500,000 characters."),
  code: z.string().trim().optional(),
  duration: z.enum(durationKeys).default("30m"),
  maxViews: z
    .number()
    .int()
    .min(1, "Max views must be at least 1.")
    .max(10_000, "Max views cannot exceed 10,000")
    .default(10),
});

export type createTextDropInput = z.infer<typeof createTextDropSchema>;
