import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetPlayer, 
  useGetPlayerTodayStats, 
  useGetPlayerBattleLog,
  getGetPlayerQueryKey 
} from "@workspace/api-client-react";
import { formatTag, cn } from "@/lib/utils";
import {
  Trophy, Star, Swords, Users, Clock, ShieldAlert,
  Zap, ChevronLeft, RefreshCw, Info, Medal, Award, Search
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { ProfileIcon, BrawlerIcon } from "@/components/brawl-images";

export default function Player() {
  const params = useParams();
  const rawTag = params.tag || "";
  const tag = formatTag(rawTag);

  const [activeTab, setActiveTab] = useState<'profile' | 'brawlers' | 'battles'>('profile');
  const [brawlerSearch, setBrawlerSearch] = useState('');

  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
    refetch: refetchPlayer,
  } = useGetPlayer(tag, {
    query: { enabled: !!tag, queryKey: getGetPlayerQueryKey(tag) },
  });

  const {
    data: todayStats,
    isLoading: isTodayStatsLoading,
    refetch: refetchTodayStats,
  } = useGetPlayerTodayStats(tag, {
    query: { enabled: !!tag, queryKey: ["todayStats", tag] },
  });

  const {
    data: battleLog,
    isLoading: isBattleLogLoading,
    refetch: refetchBattleLog,
  } = useGetPlayerBattleLog(tag, {
    query: { enabled: !!tag, queryKey: ["battleLog", tag] },
  });

  const isLoading = isPlayerLoading || isTodayStatsLoading || isBattleLogLoading;
  const isError = playerError;

  const handleRefresh = () => {
    refetchPlayer();
    refetchTodayStats();
    refetchBattleLog();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Загрузка профиля
        </h2>
      </div>
    );
  }

  if (isError) {
    // @ts-ignore
    const status = playerError?.status;
    const is404 = status === 404;
    const is502 = status === 502;

    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md w-full p-8 glass-card">
          <div className="flex justify-center text-destructive">
            <ShieldAlert className="w-16 h-16" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">
            {is404 ? "Не найден" : is502 ? "Сервер упал" : "Ошибка"}
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            {is404
              ? `Игрок #${tag} не найден в базе.`
              : is502
              ? "Сервера Brawl Stars сейчас недоступны или перегружены."
              : "Что-то пошло не так при загрузке данных."}
          </p>
          <div className="pt-6 flex flex-col gap-3">
            <Link href="/" className="glass-button bg-primary text-primary-foreground py-3 w-full hover:bg-primary/90">
              Попробовать другой тег
            </Link>
            {!is404 && (
              <button onClick={handleRefresh} className="glass-button bg-white/10 text-white py-3 w-full">
                Повторить попытку
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!player) return null;

  const hexColor = player.nameColor ? `#${player.nameColor.replace(/^0x/, "").replace(/^ff/, "")}` : "inherit";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500 max-w-5xl mx-auto">

      {/* PAGE HERO */}
      <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 rounded-2xl border border-primary/40 bg-primary/5 shadow-[0_0_40px_rgba(251,191,36,0.35)] flex items-center justify-center">
          <Trophy className="w-10 h-10 text-primary" strokeWidth={2} />
        </div>
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
          Статистика<br />игрока
        </h1>
      </div>

      {/* HEADER SECTION */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden mb-8">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <ProfileIcon iconId={player.iconId} className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-white/10 shadow-2xl shrink-0" />
          
          <div className="flex-1 text-center md:text-left space-y-4 md:mt-2">
            <div>
              <h1 
                className="text-4xl md:text-5xl font-black uppercase tracking-tight break-all"
                style={{ color: hexColor !== "inherit" ? hexColor : "white" }}
              >
                {player.name}
              </h1>
              <p className="text-lg font-medium text-muted-foreground mt-1">{player.tag.startsWith("#") ? player.tag : `#${player.tag}`}</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {player.clubName && (
                <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm backdrop-blur-sm">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="font-semibold text-sm">{player.clubName}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 shadow-sm backdrop-blur-sm" translate="no">
                <Star className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Уровень {player.expLevel}</span>
              </div>
            </div>
          </div>
          
          <div className="shrink-0 flex flex-col items-center justify-center bg-white/5 px-8 py-5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm w-full md:w-auto mt-2 md:mt-0">
            <Trophy className="w-8 h-8 text-primary mb-2" fill="currentColor" />
            <div className="text-3xl font-black text-white">{player.trophies.toLocaleString()}</div>
            <div className="text-xs font-semibold text-muted-foreground uppercase mt-1">
              Рекорд: {player.highestTrophies.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* TABS & ACTIONS */}
      <div className="sticky top-2 z-50 flex items-center justify-between gap-2 bg-background/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn("px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap", activeTab === 'profile' ? "bg-white text-background shadow-md" : "text-muted-foreground hover:bg-white/10 hover:text-white")}
          >
            Профиль
          </button>
          <button 
            onClick={() => setActiveTab('brawlers')}
            className={cn("px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap flex items-center gap-2", activeTab === 'brawlers' ? "bg-white text-background shadow-md" : "text-muted-foreground hover:bg-white/10 hover:text-white")}
          >
            Бойцы <span className="opacity-60 text-xs font-bold">({player.brawlers.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('battles')}
            className={cn("px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap", activeTab === 'battles' ? "bg-white text-background shadow-md" : "text-muted-foreground hover:bg-white/10 hover:text-white")}
          >
            Бои
          </button>
        </div>
        <div className="hidden md:flex items-center gap-2 pr-1">
           <Link href="/" className="p-2.5 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-white transition-all bg-white/5 border border-white/10">
             <ChevronLeft className="w-4 h-4" />
           </Link>
           <button onClick={handleRefresh} className="p-2.5 rounded-xl text-primary hover:bg-primary/20 transition-all bg-primary/10 border border-primary/20 group">
             <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
           </button>
        </div>
      </div>
      
      {/* Mobile top actions (below tabs on mobile) */}
      <div className="flex md:hidden items-center justify-between gap-2 pt-2 pb-4">
           <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-white/10 hover:text-white transition-all bg-white/5 border border-white/10 text-sm font-medium">
             <ChevronLeft className="w-4 h-4" /> Назад
           </Link>
           <button onClick={handleRefresh} className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary hover:bg-primary/20 transition-all bg-primary/10 border border-primary/20 text-sm font-medium group">
             <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" /> Обновить
           </button>
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           
           {/* Victories */}
           <div className="glass-card p-6 flex flex-col gap-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                 <Medal className="w-5 h-5 text-primary" /> Победы
              </h2>
              <div className="space-y-4">
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                   <span className="font-semibold text-muted-foreground">3 на 3</span>
                   <span className="font-black text-xl text-white">{player.trioVictories.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                   <span className="font-semibold text-muted-foreground">Соло</span>
                   <span className="font-black text-xl text-white">{player.soloVictories.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                   <span className="font-semibold text-muted-foreground">Дуо</span>
                   <span className="font-black text-xl text-white">{player.duoVictories.toLocaleString()}</span>
                 </div>
              </div>
           </div>
           
           {/* Collection Summary */}
           {(() => {
              const maxGadgetsAndStarPowers = player.brawlers.length * 2;
              const totalGadgets = player.brawlers.reduce((acc, b) => acc + b.gadgets.length, 0);
              const totalStarPowers = player.brawlers.reduce((acc, b) => acc + b.starPowers.length, 0);
              const totalGears = player.brawlers.reduce((acc, b) => acc + b.gears.length, 0);
              const totalHypercharges = player.brawlers.reduce((acc, b) => acc + b.hypercharges.length, 0);
              
              return (
                <div className="glass-card p-6 flex flex-col gap-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                     <Zap className="w-5 h-5 text-accent" /> Коллекция
                  </h2>
                  <div className="grid grid-cols-2 gap-4 flex-1">
                     <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                        <span className="text-sm font-semibold text-muted-foreground mb-1">Гаджеты</span>
                        <span className="text-2xl font-black text-white">{totalGadgets} <span className="text-sm text-muted-foreground/50 font-semibold">/ {maxGadgetsAndStarPowers}</span></span>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                        <span className="text-sm font-semibold text-muted-foreground mb-1">Звёздные силы</span>
                        <span className="text-2xl font-black text-white">{totalStarPowers} <span className="text-sm text-muted-foreground/50 font-semibold">/ {maxGadgetsAndStarPowers}</span></span>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                        <span className="text-sm font-semibold text-muted-foreground mb-1">Снаряжение</span>
                        <span className="text-2xl font-black text-white">{totalGears}</span>
                     </div>
                     <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col justify-center items-center text-center">
                        <span className="text-sm font-semibold text-muted-foreground mb-1">Гиперзаряды</span>
                        <span className="text-2xl font-black text-accent">{totalHypercharges}</span>
                     </div>
                  </div>
                </div>
              );
           })()}

           {/* Today Stats */}
           {todayStats && (
             <div className="glass-card p-6 flex flex-col gap-6 lg:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-secondary/5 pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                     <Clock className="w-5 h-5 text-secondary" /> За сегодня
                  </h2>
                  <div className="text-xs font-medium bg-background/50 backdrop-blur-sm px-3 py-1.5 rounded-lg text-muted-foreground inline-flex items-center gap-1.5 border border-white/5">
                     <Info className="w-3.5 h-3.5" /> Оценка по последним {battleLog?.items.length || 25} боям
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Сыграно</span>
                    <span className="text-2xl font-black text-white">{todayStats.gamesPlayed}</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-xs font-semibold uppercase text-muted-foreground mb-1">Трофеи</span>
                    <span className={`text-2xl font-black ${todayStats.trophyChange > 0 ? "text-victory" : todayStats.trophyChange < 0 ? "text-defeat" : "text-white"}`}>
                      {todayStats.trophyChange > 0 ? "+" : ""}{todayStats.trophyChange}
                    </span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center col-span-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground mb-2">Результаты</span>
                    <div className="flex w-full h-3 bg-background rounded-full overflow-hidden mb-2">
                       {todayStats.gamesPlayed > 0 ? (
                         <>
                           <div style={{ width: `${(todayStats.wins / todayStats.gamesPlayed) * 100}%` }} className="bg-victory h-full" />
                           <div style={{ width: `${(todayStats.draws / todayStats.gamesPlayed) * 100}%` }} className="bg-draw h-full" />
                           <div style={{ width: `${(todayStats.losses / todayStats.gamesPlayed) * 100}%` }} className="bg-defeat h-full" />
                         </>
                       ) : (
                         <div className="w-full bg-white/10 h-full" />
                       )}
                    </div>
                    <div className="flex justify-between w-full text-xs font-bold">
                       <span className="text-victory">{todayStats.wins} В</span>
                       <span className="text-draw">{todayStats.draws} Н</span>
                       <span className="text-defeat">{todayStats.losses} П</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center font-medium text-sm text-muted-foreground mt-2 relative z-10">
                  Примерное время в игре: <span className="text-white font-bold">{Math.floor(todayStats.timePlayedMinutes / 60)}ч {todayStats.timePlayedMinutes % 60}м</span>
                </div>
             </div>
           )}
        </div>
      )}

      {/* TAB CONTENT: BRAWLERS */}
      {activeTab === 'brawlers' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="relative max-w-md mx-auto md:mx-0">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Поиск бойца..." 
               value={brawlerSearch}
               onChange={(e) => setBrawlerSearch(e.target.value)}
               className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
             />
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {player.brawlers
               .filter(b => b.name.toLowerCase().includes(brawlerSearch.toLowerCase()))
               .sort((a, b) => b.trophies - a.trophies)
               .map(brawler => (
                 <div key={brawler.id} className="glass-card flex flex-col group hover:border-primary/30 transition-all duration-300 relative">
                    <div className="bg-white/5 pt-4 px-4 pb-0 flex justify-center items-end relative h-28 rounded-t-2xl">
                       <BrawlerIcon brawlerId={brawler.id} className="h-28 w-auto transform group-hover:scale-110 transition-transform duration-300 origin-bottom" fallbackName={brawler.name} />
                       <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10 shadow-sm" translate="no">
                         Ур. {brawler.power}
                       </div>
                    </div>
                    <div className="p-4 border-t border-white/5 flex-1 flex flex-col">
                       <h3 className="font-bold text-base text-white uppercase tracking-tight truncate">{brawler.name}</h3>
                       
                       <div className="flex justify-between items-center mt-1.5">
                         <div className="flex items-center gap-1.5 text-primary">
                           <Trophy className="w-3.5 h-3.5" fill="currentColor" />
                           <span className="font-bold text-sm text-white">{brawler.trophies}</span>
                         </div>
                         <div className="text-[10px] font-bold text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                           Ранг {brawler.rank}
                         </div>
                       </div>
                       
                       <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-4 gap-1 text-center">
                          <div className="flex flex-col items-center opacity-70">
                             <div className={`w-1.5 h-1.5 rounded-full mb-1 ${brawler.gadgets.length > 0 ? "bg-green-400" : "bg-white/20"}`} />
                             <span className="text-[9px] font-bold uppercase text-muted-foreground">{brawler.gadgets.length}</span>
                          </div>
                          <div className="flex flex-col items-center opacity-70">
                             <div className={`w-1.5 h-1.5 rounded-full mb-1 ${brawler.starPowers.length > 0 ? "bg-yellow-400" : "bg-white/20"}`} />
                             <span className="text-[9px] font-bold uppercase text-muted-foreground">{brawler.starPowers.length}</span>
                          </div>
                          <div className="flex flex-col items-center opacity-70">
                             <div className={`w-1.5 h-1.5 rounded-full mb-1 ${brawler.gears.length > 0 ? "bg-blue-400" : "bg-white/20"}`} />
                             <span className="text-[9px] font-bold uppercase text-muted-foreground">{brawler.gears.length}</span>
                          </div>
                          <div className="flex flex-col items-center opacity-70">
                             <div className={`w-1.5 h-1.5 rounded-full mb-1 ${brawler.hypercharges.length > 0 ? "bg-accent shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "bg-white/20"}`} />
                             <span className="text-[9px] font-bold uppercase text-muted-foreground">{brawler.hypercharges.length}</span>
                          </div>
                       </div>
                    </div>
                 </div>
             ))}
           </div>
           
           {player.brawlers.filter(b => b.name.toLowerCase().includes(brawlerSearch.toLowerCase())).length === 0 && (
             <div className="text-center py-16 text-muted-foreground glass-card">
               <Zap className="w-12 h-12 mx-auto mb-3 opacity-20" />
               <p className="font-medium">Бойцы не найдены</p>
             </div>
           )}
        </div>
      )}

      {/* TAB CONTENT: BATTLES */}
      {activeTab === 'battles' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
          {battleLog && battleLog.items.length > 0 ? (
            battleLog.items.map((battle, i) => {
              const isVictory = battle.result === "victory";
              const isDefeat = battle.result === "defeat";
              const isDraw = battle.result === "draw";
              
              const resultColor = isVictory ? "text-victory" : isDefeat ? "text-defeat" : isDraw ? "text-draw" : "text-muted-foreground";
              const resultBg = isVictory ? "from-victory/10" : isDefeat ? "from-defeat/10" : isDraw ? "from-draw/10" : "from-muted/10";
              const resultLabel = isVictory ? "Победа" : isDefeat ? "Поражение" : isDraw ? "Ничья" : "Завершено";

              return (
                <div key={i} className="glass-card overflow-hidden flex flex-col">
                  {/* Battle Header */}
                  <div className={`p-4 border-b border-white/5 flex justify-between items-center bg-gradient-to-r ${resultBg} to-transparent`}>
                    <div className="flex flex-col">
                       <span className={cn("font-bold uppercase tracking-wide text-sm", resultColor)}>{resultLabel}</span>
                       <span className="text-xs text-muted-foreground font-medium mt-0.5">{battle.mode} {battle.map && `• ${battle.map}`}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       {battle.trophyChange != null && (
                         <span className={cn("font-black text-lg flex items-center gap-1", battle.trophyChange > 0 ? "text-victory" : battle.trophyChange < 0 ? "text-defeat" : "text-white")}>
                           {battle.trophyChange > 0 ? "+" : ""}{battle.trophyChange}
                           <Trophy className="w-4 h-4 text-primary" fill="currentColor" />
                         </span>
                       )}
                       <span className="text-xs font-semibold text-muted-foreground/60 bg-white/5 px-2 py-1 rounded">
                         {format(parseISO(battle.battleTime), "HH:mm", { locale: ru })}
                       </span>
                    </div>
                  </div>
                  
                  {/* Teams */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {battle.teams.length > 1 && <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px bg-white/5 -translate-x-1/2" />}
                    
                    {battle.teams.map((team, tIndex) => (
                      <div key={tIndex} className="space-y-2">
                        {team.map((playerInMatch, pIndex) => {
                          const isMe = playerInMatch.tag === `#${tag}`;
                          const isMVP = battle.starPlayerTag === playerInMatch.tag;
                          
                          return (
                            <div 
                              key={pIndex} 
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg transition-colors",
                                isMe ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 hover:bg-white/10"
                              )}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="relative shrink-0">
                                  <BrawlerIcon brawlerId={playerInMatch.brawlerId} className="w-8 h-8 drop-shadow-none" fallbackName={playerInMatch.brawlerName} />
                                  {isMVP && (
                                    <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 ring-1 ring-white/10">
                                      <Award className="w-3 h-3 text-primary" fill="currentColor" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                  <span className={cn("font-semibold text-sm truncate max-w-[120px]", isMe ? "text-white" : "text-muted-foreground")} title={playerInMatch.name}>
                                    {playerInMatch.name}
                                  </span>
                                  <span className="text-[10px] font-medium text-muted-foreground/70 uppercase truncate">{playerInMatch.brawlerName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 bg-background/50 px-2 py-1 rounded-md border border-white/5">
                                <Trophy className="w-3 h-3 text-primary" />
                                <span className="font-bold text-xs text-white w-8 text-right">{playerInMatch.brawlerTrophies}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center">
              <Swords className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <h3 className="text-lg font-bold text-white mb-1">Нет данных</h3>
              <p className="text-sm text-muted-foreground">Не удалось загрузить последние бои</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
