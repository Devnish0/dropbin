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

