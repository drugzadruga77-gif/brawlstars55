import { Router, type IRouter } from "express";
import {
  GetPlayerParams,
  GetPlayerResponse,
  GetPlayerBattleLogParams,
  GetPlayerBattleLogResponse,
  GetPlayerTodayStatsParams,
  GetPlayerTodayStatsResponse,
} from "@workspace/api-zod";
import {
  BrawlApiError,
  fetchRawBattleLog,
  fetchRawPlayer,
} from "../lib/brawlApi";
import { computeTodayStats, mapBattleLog, mapPlayer } from "../lib/brawlMapper";

const router: IRouter = Router();

router.get("/players/:tag", async (req, res): Promise<void> => {
  const params = GetPlayerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const raw = await fetchRawPlayer(params.data.tag);
    const player = mapPlayer(raw);
    res.json(GetPlayerResponse.parse(player));
  } catch (err) {
    if (err instanceof BrawlApiError) {
      req.log.warn({ err, tag: params.data.tag }, "Brawl API error");
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.get("/players/:tag/battlelog", async (req, res): Promise<void> => {
  const params = GetPlayerBattleLogParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const raw = await fetchRawBattleLog(params.data.tag);
    const battleLog = mapBattleLog(raw);
    res.json(GetPlayerBattleLogResponse.parse(battleLog));
  } catch (err) {
    if (err instanceof BrawlApiError) {
      req.log.warn({ err, tag: params.data.tag }, "Brawl API error");
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }
});

router.get("/players/:tag/today", async (req, res): Promise<void> => {
  const params = GetPlayerTodayStatsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const raw = await fetchRawBattleLog(params.data.tag);
    const todayStats = computeTodayStats(raw, new Date());
    res.json(GetPlayerTodayStatsResponse.parse(todayStats));
  } catch (err) {
    if (err instanceof BrawlApiError) {
      req.log.warn({ err, tag: params.data.tag }, "Brawl API error");
      res.status(err.status).json({ error: err.message });
      return;
    }
    throw err;
  }
});

export default router;
