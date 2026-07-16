import { logger } from "./logger";

const BRAWL_API_BASE = "https://api.brawlstars.com/v1";

export class BrawlApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "BrawlApiError";
  }
}

/**
 * Normalizes a user-supplied Brawl Stars tag into the raw form the
 * official API expects when URL-encoded (leading '#', uppercase,
 * common look-alike character substitution for O -> 0).
 */
export function normalizeTag(rawTag: string): string {
  const trimmed = rawTag.trim().toUpperCase();
  const withoutHash = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  return withoutHash.replace(/O/g, "0");
}

async function brawlFetch<T>(path: string): Promise<T> {
  const apiKey = process.env.BRAWL_STARS_API_KEY;
  if (!apiKey) {
    throw new BrawlApiError(
      502,
      "Сервер ещё не настроен: отсутствует ключ Brawl Stars API.",
    );
  }

  const url = `${BRAWL_API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
  } catch (err) {
    logger.error({ err, url }, "Network error calling Brawl Stars API");
    throw new BrawlApiError(502, "Не удалось связаться с сервером Brawl Stars.");
  }

  if (response.status === 404) {
    throw new BrawlApiError(404, "Игрок не найден. Проверьте тег.");
  }

  if (response.status === 403) {
    logger.error(
      { url, status: response.status },
      "Brawl Stars API rejected the request (IP not allow-listed or invalid key)",
    );
    throw new BrawlApiError(
      502,
      "Brawl Stars API отклонил запрос (ключ или IP-адрес не подходят).",
    );
  }

  if (response.status === 429) {
    throw new BrawlApiError(502, "Превышен лимит запросов к Brawl Stars API. Попробуйте позже.");
  }

  if (!response.ok) {
    logger.error(
      { url, status: response.status },
      "Unexpected Brawl Stars API error",
    );
    throw new BrawlApiError(502, "Brawl Stars API временно недоступен.");
  }

  let body: T;
  try {
    body = (await response.json()) as T;
  } catch {
    logger.error({ url }, "Brawl Stars API returned non-JSON body");
    throw new BrawlApiError(502, "Brawl Stars API вернул некорректный ответ.");
  }
  return body;
}

export function fetchRawPlayer(tag: string): Promise<RawPlayer> {
  return brawlFetch<RawPlayer>(`/players/%23${normalizeTag(tag)}`);
}

export function fetchRawBattleLog(tag: string): Promise<RawBattleLog> {
  return brawlFetch<RawBattleLog>(`/players/%23${normalizeTag(tag)}/battlelog`);
}

// --- Raw shapes returned by the official Brawl Stars API ---
// Only the fields we use are declared; the real payload has more.

export interface RawNamedItem {
  id: number;
  name: string;
}

export interface RawGear extends RawNamedItem {
  level?: number;
}

export interface RawBrawler {
  id: number;
  name: string;
  power: number;
  rank: number;
  trophies: number;
  highestTrophies: number;
  gadgets?: RawNamedItem[];
  starPowers?: RawNamedItem[];
  gears?: RawGear[];
  hypercharges?: RawNamedItem[];
}

export interface RawPlayer {
  tag: string;
  name: string;
  nameColor?: string | null;
  icon?: { id: number };
  trophies: number;
  highestTrophies: number;
  expLevel: number;
  expPoints: number;
  soloVictories: number;
  duoVictories: number;
  "3vs3Victories": number;
  club?: { tag: string; name: string; role?: string } | null;
  brawlers: RawBrawler[];
}

export interface RawBattlePlayer {
  tag: string;
  name: string;
  brawler: {
    id: number;
    name: string;
    power: number;
    trophies: number;
  };
}

export interface RawBattle {
  mode?: string;
  type?: string;
  result?: string;
  duration?: number;
  trophyChange?: number;
  starPlayer?: { tag: string };
  teams?: RawBattlePlayer[][];
  players?: RawBattlePlayer[];
}

export interface RawBattleLogItem {
  battleTime: string;
  event?: { id: number; mode?: string; map?: string | null };
  battle: RawBattle;
}

export interface RawBattleLog {
  items: RawBattleLogItem[];
}
