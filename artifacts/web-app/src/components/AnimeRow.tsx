import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Anime } from "@/lib/storage";
import { AnimeCard } from "./AnimeCard";
import { Button } from "./ui/button";

interface AnimeRowProps {
  title: string;
  animeList: Anime[];
}

export function AnimeRow({ title, animeList }: AnimeRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth * 0.7;
      scrollRef.current.scrollBy({
        left: dir === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (animeList.length === 0) return null;

  return (
    <div className="py-4 md:py-6 group relative">
      <h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-4 sm:px-6 lg:px-8">
        {title}
      </h2>
      
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 h-full w-12 rounded-none bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:text-white transition-all hidden md:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
        
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 lg:px-8 pb-8 pt-2 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 h-full w-12 rounded-none bg-black/50 opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:text-white transition-all hidden md:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
}
