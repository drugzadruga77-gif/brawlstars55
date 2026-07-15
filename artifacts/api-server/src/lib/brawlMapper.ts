import type {
  RawBattleLog,
  RawBattlePlayer,
  RawBrawler,
  RawPlayer,
} from "./brawlApi";

/**
 * The official Brawl Stars API returns battle timestamps in the compact
 * form `YYYYMMDDTHHmmss.SSSZ`. Convert to a standard ISO-8601 string so
 * it round-trips through `Date` / Zod `coerce.date()` correctly.
 */
export function parseBrawlTime(raw: string): string {
  const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/.exec(
    raw,
  );
  if (!match) {
    // Already ISO-ish or unrecognized; let Date() do its best.
    return raw;
  }
  const [, year, month, day, hour, minute, second, ms] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}Z`;
}

export function mapBrawler(raw: RawBrawler) {
  return {
    id: raw.id,
    name: raw.name,
    power: raw.power,
    rank: raw.rank,
    trophies: raw.trophies,
    highestTrophies: raw.highestTrophies,
    gadgets: (raw.gadgets ?? []).map((g) => ({ id: g.id, name: g.name })),
    starPowers: (raw.starPowers ?? []).map((s) => ({
      id: s.id,
      name: s.name,
    })),
    gears: (raw.gears ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      level: g.level ?? 1,
    })),
    hypercharges: (raw.hypercharges ?? []).map((h) => ({
      id: h.id,
      name: h.name,
    })),
  };
}

export function mapPlayer(raw: RawPlayer) {
  return {
    tag: raw.tag,
    name: raw.name,
    nameColor: raw.nameColor ?? null,
    iconId: raw.icon?.id ?? 0,
    trophies: raw.trophies,
    highestTrophies: raw.highestTrophies,
    expLevel: raw.expLevel,
    expPoints: raw.expPoints,
    soloVictories: raw.soloVictories,
    duoVictories: raw.duoVictories,
    trioVictories: raw["3vs3Victories"],
    clubTag: raw.club?.tag ?? null,
    clubName: raw.club?.name ?? null,
    clubRole: raw.club?.role ?? null,
    brawlers: raw.brawlers.map(mapBrawler),
  };
}

function mapBattlePlayer(raw: RawBattlePlayer) {
  return {
    tag: raw.tag,
    name: raw.name,
    brawlerId: raw.brawler.id,
    brawlerName: raw.brawler.name,
    brawlerPower: raw.brawler.power,
    brawlerTrophies: raw.brawler.trophies,
  };
}

export function mapBattleLog(raw: RawBattleLog) {
  const items = raw.items.map((entry) => {
    const teams: ReturnType<typeof mapBattlePlayer>[][] = entry.battle.teams
      ? entry.battle.teams.map((team) => team.map(mapBattlePlayer))
      : entry.battle.players
        ? [entry.battle.players.map(mapBattlePlayer)]
        : [];

    return {
      battleTime: parseBrawlTime(entry.battleTime),
      mode: entry.battle.mode ?? entry.event?.mode ?? "unknown",
      map: entry.event?.map ?? null,
      type: entry.battle.type ?? "unknown",
      result: entry.battle.result ?? null,
      duration: entry.battle.duration ?? null,
      trophyChange: entry.battle.trophyChange ?? null,
      starPlayerTag: entry.battle.starPlayer?.tag ?? null,
      teams,
    };
  });

  return { items };
}

export interface TodayStats {
  date: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  timePlayedMinutes: number;
  trophyChange: number;
}

/**
 * Aggregates today's battles from the raw battle log. The official API
 * only exposes roughly the last 25 battles, so this is a best-effort
 * estimate of "today" rather than a complete daily total.
 */
export function computeTodayStats(raw: RawBattleLog, now: Date): TodayStats {
  const todayKey = now.toISOString().slice(0, 10);

  let gamesPlayed = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let timePlayedSeconds = 0;
  let trophyChange = 0;

  for (const entry of raw.items) {
    const iso = parseBrawlTime(entry.battleTime);
    const entryDate = new Date(iso);
    if (Number.isNaN(entryDate.getTime())) continue;
    if (iso.slice(0, 10) !== todayKey) continue;

    gamesPlayed += 1;
    timePlayedSeconds += entry.battle.duration ?? 0;
    trophyChange += entry.battle.trophyChange ?? 0;

    const result = entry.battle.result;
    if (result === "victory") wins += 1;
    else if (result === "defeat") losses += 1;
    else if (result === "draw") draws += 1;
  }

  return {
    date: todayKey,
    gamesPlayed,
    wins,
    losses,
    draws,
    timePlayedMinutes: Math.round((timePlayedSeconds / 60) * 10) / 10,
    trophyChange,
  };
}
