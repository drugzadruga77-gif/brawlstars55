import { useState } from "react";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileIconProps {
  iconId: number;
  className?: string;
}

export function ProfileIcon({ iconId, className }: ProfileIconProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn("bg-white/10 flex items-center justify-center rounded-2xl border border-white/10", className)}>
        <Trophy className="w-1/2 h-1/2 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`/api/images/profile-icon/${iconId}`}
      alt="Profile Icon"
      className={cn("rounded-2xl object-cover bg-background", className)}
      onError={() => setError(true)}
    />
  );
}

interface BrawlerIconProps {
  brawlerId: number;
  className?: string;
  fallbackName?: string;
}

export function BrawlerIcon({ brawlerId, className, fallbackName }: BrawlerIconProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn("bg-white/10 flex items-center justify-center rounded-lg text-xs font-bold text-center text-muted-foreground overflow-hidden border border-white/5 p-1", className)}>
        {fallbackName ? fallbackName.substring(0, 3).toUpperCase() : "?"}
      </div>
    );
  }

  return (
    <img
      src={`/api/images/brawler/${brawlerId}`}
      alt={fallbackName || "Brawler"}
      loading="lazy"
      className={cn("object-contain drop-shadow-xl", className)}
      onError={() => setError(true)}
    />
  );
}
