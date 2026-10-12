# Mistakes

Record meaningful bugs or recurring misconceptions. Preserve the original reasoning.

## 2026-10-05: Docker Compose Volume Syntax & Declaration

- **Problem:** Running `docker compose up` resulted in `service volume services.postgres.volumes.[0] is missing a mount target`.
- **Mistake:** Added a space after the colon in `- postgres_data: /var/lib/postgresql/data` and omitted the top-level `volumes:` section.
- **Original mental model:** A colon followed by a space represents a key-value pair in YAML, so applying that pattern inside list items felt natural.
- **Correct mental model:** In Docker short-form syntax, `<source>:<target>` is an atomic string without whitespace (`postgres_data:/var/lib/postgresql/data`). A space converts it into an incomplete YAML dictionary object. Additionally, named volumes must be declared in the root `volumes:` block so Compose knows they are managed volumes rather than host directory paths.
- **Category:** Configuration / Syntax trap.
- **Prevention:** Remember that Docker short-form port and volume mappings (`source:target`) are strings without internal spaces. Always check that named volumes appear in the root `volumes:` block.
- **Follow-up exercise:** Inspect `docker volume ls` after container startup to verify where Docker created `dropbin_postgres_data`.

## 2026-10-08: Drizzle ORM Error Wrapper & Cause Property

- **Problem:** When inserting duplicate codes, Postgres error code `23505` was not caught by `isUniqueViolation(error)`, returning an unexpected fallback error (`"this should not happen"`).
- **Mistake:** Checked `(error as any).code === "23505"` directly on the caught exception.
- **Original mental model:** Believed that Node.js database exceptions directly expose driver error codes at the top-level `error.code`.
- **Correct mental model:** Drizzle ORM wraps underlying database driver errors inside a custom `DrizzleQueryError`. The top-level `error.code` is `undefined`, while the native driver's error object (with `code: "23505"`) is placed inside `error.cause`. Catch handlers must inspect `err.code === "23505" || err.cause?.code === "23505"`.
- **Category:** ORM Abstraction Trap / Exception Handling.
- **Prevention:** Always inspect `err.cause` when handling underlying driver-specific codes in modern ORMs (Drizzle, Prisma, etc.), and log unfamiliar caught errors to avoid silent fall-throughs.
- **Follow-up exercise:** Test handling other driver error codes (such as foreign key violations `23503`) through `err.cause`.

## 2026-10-13: Presigned URL Upload vs Drop DB Creation Validation Coupling

- **Problem:** When uploading files or images from the UI, the client received `Invalid option: expected one of "image"|"file"` during Step 1 (requesting the presigned upload URL).
- **Mistake:** Replaced `fileUploadSchema` with `createFileDropSchema` in `/api/upload/presigned-url` and called `createFileDrop` before the file was uploaded to R2.
- **Original mental model:** Believed that all file-related requests should validate against the single `createFileDropSchema`.
- **Correct mental model:** A two-phase direct object storage upload decouples upload authorization from database record registration:
  1. Step 1 (`/api/upload/presigned-url`) only validates `{ fileName, contentType, fileSize }` using `fileUploadSchema` and returns `{ uploadUrl, fileKey }`. At this point, the client does not possess a `fileKey` nor is the drop registered in the database.
  2. Step 2 (Browser direct PUT) uploads bytes to R2.
  3. Step 3 (`/api/drop`) receives `{ type, fileKey, fileName, fileSize, mimeType, ... }` and persists the record into PostgreSQL using `createFileDropSchema`.
- **Category:** Architecture / Multi-phase API Contract Trap.
- **Prevention:** Do not validate intermediate phase payloads with final entity schemas. Ensure each step in a multi-phase flow validates only the data relevant to its stage.
