import { Link } from "wouter";
import { Skull } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md w-full p-8 arcade-card bg-destructive text-destructive-foreground">
        <div className="flex justify-center">
          <Skull className="w-32 h-32 animate-bounce" strokeWidth={1.5} />
        </div>
        <h1 className="text-6xl font-black text-stroke-2 text-white drop-shadow-[4px_4px_0_var(--color-border)] uppercase tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold uppercase">
          Зона не найдена
        </h2>
        <p className="text-lg font-medium opacity-90">
          Похоже, этот игрок спрятался в кустах, или такой страницы просто не существует.
        </p>
        <div className="pt-4">
          <Link href="/" className="arcade-button bg-primary text-primary-foreground w-full">
            Вернуться в лобби
          </Link>
        </div>
      </div>
    </div>
  );
}
