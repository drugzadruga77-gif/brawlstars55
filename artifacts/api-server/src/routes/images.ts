import { Router, type IRouter } from "express";

const router: IRouter = Router();

const BRAWLIFY_BASE = "https://cdn.brawlify.com";

/**
 * Proxies Brawlify CDN images through our own server.
 *
 * We proxy rather than hotlink directly from the client because some
 * networks/ISPs block third-party CDNs (including cloudflare-hosted
 * domains) client-side, which made avatars disappear for some users even
 * though the CDN itself is healthy and unrestricted. Fetching server-side
 * avoids that entirely and lets us cache aggressively.
 */
async function proxyImage(
  upstreamPath: string,
  res: import("express").Response,
): Promise<void> {
  try {
    const upstreamRes = await fetch(`${BRAWLIFY_BASE}${upstreamPath}`);

    if (!upstreamRes.ok || !upstreamRes.body) {
      res.status(upstreamRes.status === 404 ? 404 : 502).end();
      return;
    }

    const contentType = upstreamRes.headers.get("content-type") ?? "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");

    const buffer = Buffer.from(await upstreamRes.arrayBuffer());
    res.status(200).end(buffer);
  } catch {
    res.status(502).end();
  }
}

router.get("/images/profile-icon/:iconId", async (req, res): Promise<void> => {
  const iconId = Number(req.params.iconId);
  if (!Number.isInteger(iconId) || iconId <= 0) {
    res.status(400).end();
    return;
  }
  await proxyImage(`/profile-icons/regular/${iconId}.png`, res);
});

router.get("/images/brawler/:brawlerId", async (req, res): Promise<void> => {
  const brawlerId = Number(req.params.brawlerId);
  if (!Number.isInteger(brawlerId) || brawlerId <= 0) {
    res.status(400).end();
    return;
  }
  await proxyImage(`/brawlers/borderless/${brawlerId}.png`, res);
});

export default router;
