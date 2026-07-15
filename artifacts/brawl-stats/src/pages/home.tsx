import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { searchSchema, SearchValues, formatTag } from "@/lib/utils";
import { Search, History, Trophy, Swords, Zap } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [recentSearch, setRecentSearch] = useState<string | null>(null);

  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { tag: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem("brawl_recent_tag");
    if (saved) setRecentSearch(saved);
  }, []);

  const onSubmit = (data: SearchValues) => {
    const formatted = formatTag(data.tag);
    localStorage.setItem("brawl_recent_tag", formatted);
    setLocation(`/player/${formatted}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-3xl mx-auto w-full gap-12">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-2 ring-1 ring-primary/30 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
          <Trophy className="w-10 h-10 text-primary" strokeWidth={2} />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60 tracking-tight">
          BRAWL STATS
        </h1>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both"
      >
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="text-2xl font-bold text-muted-foreground/50">#</span>
          </div>
          <input
            {...form.register("tag")}
            type="text"
            placeholder="2Q0GYU2QU"
            className="w-full h-16 pl-12 pr-16 text-2xl font-bold uppercase tracking-wider bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-muted-foreground/30 text-white shadow-lg"
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Search className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
        {form.formState.errors.tag && (
          <p className="text-destructive font-medium text-center text-sm animate-in fade-in slide-in-from-top-2">
            {form.formState.errors.tag.message}
          </p>
        )}
      </form>

      {recentSearch && (
        <div className="animate-in fade-in duration-1000 delay-500 fill-mode-both">
          <button
            onClick={() => {
              form.setValue("tag", recentSearch);
              form.handleSubmit(onSubmit)();
            }}
            className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-full transition-all cursor-pointer group shadow-sm backdrop-blur-sm"
          >
            <History className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            <span className="font-medium text-sm text-muted-foreground group-hover:text-white transition-colors">Последний поиск: #{recentSearch}</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both">
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-primary/30 transition-colors">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-white">Трофеи</h3>
          <p className="text-sm text-muted-foreground">Отслеживай прогресс кубков в реальном времени</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-secondary/30 transition-colors">
          <div className="p-3 bg-secondary/10 rounded-xl">
            <Swords className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-white">Бои</h3>
          <p className="text-sm text-muted-foreground">Анализируй последние катки и свою эффективность</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:border-accent/30 transition-colors">
          <div className="p-3 bg-accent/10 rounded-xl">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-lg font-bold text-white">Бойцы</h3>
          <p className="text-sm text-muted-foreground">Прокачка, гаджеты и гиперзаряды всей коллекции</p>
        </div>
      </div>
    </div>
  );
}
