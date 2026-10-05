# Concepts

Record durable understanding, not every definition encountered.

## 2026-10-05: Database-Enforced Concurrency (Race Conditions)

- **Learner's explanation:** We can check availability first to lessen DB load, but let the unique constraint manage the collision if a race condition happens.
- **Corrected understanding:** In concurrent systems, application-level checks (like `SELECT` before `INSERT`) leave a race window where two parallel requests can both pass. The database's `UNIQUE` constraint is the atomic source of truth. Relying on atomic `INSERT` and catching the unique violation error (e.g. Postgres error code 23505) guarantees correctness without heavy locking. Pre-checks remain useful for real-time frontend UX feedback.
- **Example:**
  ```ts
  try {
    await db.insert(drops).values({ code, ... });
  } catch (err) {
    if (isUniqueViolation(err)) return { error: "Code taken" };
  }
  ```
- **Related concepts:** Atomic operations, Race conditions, Optimistic concurrency, Postgres error 23505.

## 2026-10-05: Lazy Expiration (Time-To-Live Queries)

- **Learner's explanation:** Check `expires_at > Date.now()` during queries.
- **Corrected understanding:** Relying solely on a periodic background worker (cron) creates a consistency gap between the moment an item expires and the moment the worker purges it. Adding `WHERE expires_at > NOW()` enforces immediate invalidation at the query level (lazy expiration), while the background cron cleans up dead storage later (eager garbage collection).
- **Example:**
  ```sql
  SELECT * FROM drops WHERE code = $1 AND expires_at > NOW();
  ```
- **Related concepts:** TTL (Time to live), Eventual cleanup, Query filtering, Read-time invalidation.

## 2026-10-05: Foreign Key Cascades & Foreign Key Indexing

- **Learner's explanation:** Checking how `references(() => users.id)` behaves and whether it is complete.
- **Corrected understanding:** Defining a foreign key guarantees referential integrity, but defaults to `NO ACTION` (blocking deletion of parent rows if children exist). Setting `{ onDelete: "cascade" }` allows dependent rows to clean up automatically. Crucially, PostgreSQL automatically indexes Primary Keys and Unique constraints, but **never automatically indexes Foreign Keys**. An explicit index on `user_id` is required to avoid full table scans when querying child rows or executing cascading deletes.
- **Example:**
  ```ts
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
  // In table configuration:
  index("drops_user_id_idx").on(table.userId)
  ```
- **Related concepts:** Referential integrity, Cascading deletes, Foreign key indexes, Sequential scans.

