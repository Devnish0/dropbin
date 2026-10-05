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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });
  // In table configuration:
  index("drops_user_id_idx").on(table.userId);
  ```
- **Related concepts:** Referential integrity, Cascading deletes, Foreign key indexes, Sequential scans.

## 2026-10-05: Lazy Session Creation & Next.js Request Scope

- **Learner's explanation:** How to manage anonymous user creation on arrival, and running files directly with `bun`.
- **Corrected understanding:** Eagerly creating user sessions on initial page load causes client-side request waterfalls, creates race conditions before session completion, and clutters the database with ghost rows from web crawlers. Instead, the lazy creation pattern provisions user records only on the first state-mutating action (e.g. creating a drop). In Next.js App Router, `cookies()` relies on AsyncLocalStorage request context and cannot be executed in standalone CLI scripts outside an incoming HTTP request; furthermore, setting cookies is restricted to Route Handlers, Server Actions, and Middleware (Server Components are read-only).
- **Example:**

  ```ts
  const cookieStore = await cookies();
  const existing = cookieStore.get(cookieName)?.value;
  if (existing) return existing;

  const [{ id }] = await db
    .insert(users)
    .values({})
    .returning({ id: users.id });
  cookieStore.set(cookieName, id, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return id;
  ```

- **Related concepts:** Lazy provisioning, Request waterfall avoidance, AsyncLocalStorage, Next.js cookie restrictions, Ghost entity bloat.

## 2026-10-05: Unambiguous Alphabet & Collision Retry Strategy

- **Learner's explanation:** Generating 4–6 character codes for drops without adding bloated third-party dependencies.
- **Corrected understanding:** Public shareable slugs are often read by humans on one device (e.g. laptop) and manually typed on another (e.g. phone). Removing visually ambiguous characters (`0`, `O`, `1`, `I`, `l`) prevents user input errors while preserving a massive space (56^6 ≈ 30.8 billion permutations). Pairing native cryptographic randomness with an optimistic insert and bounded retry loop handles any theoretical collisions without locking or pre-checking.
- **Example:**
  ```ts
  const ALPHABET = "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  // Bounded retry loop for auto-generated codes
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await db.insert(drops).values({ code: generateCode(), ... });
    } catch (err) {
      if (isUniqueViolation(err) && attempt < MAX_RETRIES) continue;
      throw err;
    }
  }
  ```
- **Related concepts:** Cryptographic PRNG, Base56 encoding, Human-centered identifier design, Collision retry loop, Postgres error 23505.
