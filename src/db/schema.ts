import { sql } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("type", ["text", "image", "file"]);

export const users = pgTable("users", {
  // Saved in cookies / session
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const drops = pgTable(
  "drops",
  {
    // The internal unique ID for the drop
    id: uuid("id").defaultRandom().primaryKey(),

    // Created by user (cascades delete if user is removed)
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Identifier code (used in public URL / code lookup)
    code: varchar("code", { length: 64 }).notNull().unique(),

    // Type of data: discriminator
    type: typeEnum("type").default("text").notNull(),

    // For text content
    textContent: text("text_content"),

    // For file / image types (stored in Cloudflare R2)
    fileKey: varchar("file_key", { length: 512 }),
    fileName: varchar("file_name", { length: 255 }),
    fileSize: integer("file_size"),
    mimeType: varchar("mime_type", { length: 128 }),

    // Security & view management
    views: integer("views").default(0).notNull(),
    maxViews: integer("max_views").default(100).notNull(),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true })
      .default(sql`now() + interval '30 minutes'`)
      .notNull(),
  },
  (table) => [
    // Foreign key index for querying "my drops" or cascading deletes efficiently
    index("drops_user_id_idx").on(table.userId),
    // Expiration index for fast TTL queries and cron sweeps
    index("drops_expires_at_idx").on(table.expiresAt),
  ]
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Drop = typeof drops.$inferSelect;
export type NewDrop = typeof drops.$inferInsert;