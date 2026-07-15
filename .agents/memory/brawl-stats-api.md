---
name: Brawl Stars API quirks
description: Non-obvious behaviors of the official Brawl Stars API that affect this project's backend integration.
---

- API keys are IP-locked at generation time (bound to the Replit outbound IP). If the key stops working with 403s after infra changes/redeploys, the fix is usually to regenerate the key at developer.brawlstars.com against the current outbound IP, not a code bug.
  **Why:** the API rejects otherwise-valid keys with 403 when the calling IP doesn't match what was registered.
  **How to apply:** if `/players/:tag` etc. return 502 with "ключ или IP-адрес не подходят", check whether the outbound IP changed before debugging the key/token logic itself.

- Player tags must be URL-encoded with `%23` in place of `#`, uppercased, and with the letter `O` normalized to the digit `0` (a common user typo since Brawl Stars tags never contain the letter O).
  **How to apply:** always run user-supplied tags through this normalization before calling the upstream API.

- Battle timestamps come back in a compact non-ISO format: `YYYYMMDDTHHmmss.SSSZ` (no dashes/colons). Must be reformatted to standard ISO-8601 before parsing with `Date`/Zod `coerce.date()`.

- The battle log endpoint only exposes roughly the last ~25 battles total (not per-day) — there is no way to fetch a complete "today" history from the API. Any "today's stats" feature is therefore a best-effort estimate bounded by however many of those ~25 battles happened today, not a true daily total.

- Optional-by-brawler fields (`gadgets`, `starPowers`, `gears`, `hypercharges`) are absent from the raw API response until a brawler has actually unlocked at least one — treat all of them as possibly-missing/empty arrays, not required fields.
