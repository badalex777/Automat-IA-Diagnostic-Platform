---
name: Managed database overrides
description: How a legacy Neon URL override affects Replit's managed Development database and existing data.
---

A manually added `DATABASE_URL` pointing to external Neon can make Replit's Database pane report that no managed Development database is found. Replit's supported recovery is to remove that legacy secret in the Secrets pane and refresh Database.

**Why:** Removing the override restored access to the managed Development database, which already contained application tables and records. Switching the connection did not create an empty database or modify the external Neon database.

**How to apply:** When switching from external Neon, confirm the managed database is reachable, inspect table counts before schema changes, and preserve existing rows. Do not assume the managed database is blank or accept a migration prompt that offers to truncate data without explicit confirmation.
