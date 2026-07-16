import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

/**
 * Transparent proxy to the official Brawl Stars API.
 *
 * Route: GET /api/brawl-proxy/*
 *
 * The production deployment runs on a different outbound IP than the one
 * whitelisted in the API key. To work around that, the production server
 * sets BRAWL_API_BASE to point at this endpoint on the dev server
 * (which has the whitelisted IP 34.14.171.190). Requests flow:
 *   production → dev proxy (34.14.171.190) → api.brawlstars.com
 */

const router: IRouter = Router();

router.get("/brawl-proxy/*path", async (req, res) => {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    res.status(502).json({ error: "Ключ API не настроен на прокси-сервере." });
    return;
  }

  const subPath = Array.isArray(req.params.path)
    ? req.params.path.join("/")
    : (req.params.path ?? "");
  const search = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `https://api.brawlstars.com/v1/${subPath}${search}`;

  try {
    const upstream = await fetch(target, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const body = await upstream.text();
    res.status(upstream.status).type("application/json").send(body);
  } catch (err) {
    logger.error({ err, target }, "Brawl proxy upstream error");
    res.status(502).json({ error: "Ошибка соединения с Brawl Stars API." });
  }
});

export default router;
