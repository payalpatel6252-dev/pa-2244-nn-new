import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Movie } from "@/lib/storage";
import { Button } from "./ui/button";

interface MovieHeroSectionProps {
  movies: Movie[];
}

const SLIDE_INTERVAL = 4500;

export function MovieHeroSection({ movies }: MovieHeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const slides = (movies ?? []).slice(0, 5);

  const goTo = useCallback((index: number) => {
    setFading(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setFading(false);
    }, 400);
  }, []);

  const next = useCallback(() => goTo((currentIndex + 1) % slides.length), [currentIndex, slides.length, goTo]);
  const prev = useCallback(() => goTo((currentIndex - 1 + slides.length) % slides.length), [currentIndex, slides.length, goTo]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center bg-black/80">
        <div className="text-center">
          <p className="text-4xl mb-4">🎬</p>
          <h2 className="text-2xl font-bold text-white mb-2">No Movies Yet</h2>
          <p className="text-gray-400">Add movies from the Admin panel to see them here.</p>
        </div>
      </div>
    );
  }

  const movie = slides[currentIndex];

  return (
    <div className="relative w-full h-[85vh] min-h-[600px] flex items-center text-white overflow-hidden">
      <div
        className="absolute inset-0 z-0 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <img
          key={movie.id}
          src={movie.bannerUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
      </div>

      <div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 transition-opacity duration-500"
        style={{ opacity: fading ? 0 : 1 }}
      >
        <div className="max-w-2xl">
          <div className="flex gap-2 mb-2">
            <span className="text-xs font-bold border border-blue-500/60 text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">MOVIE</span>
            {movie.genres.map(g => (
              <span key={g} className="text-xs font-semibold border border-white/30 px-2 py-0.5 rounded text-gray-300">{g}</span>
            ))}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-lg">{movie.title}</h1>
          <div className="flex items-center gap-4 text-sm font-semibold mb-5">
            <span className="text-green-400">★ {movie.rating.toFixed(1)}</span>
            <span className="border border-white/40 px-2 py-0.5 rounded text-xs text-gray-300">{movie.status}</span>
          </div>
          <p className="text-base text-gray-200 mb-8 line-clamp-3 leading-relaxed max-w-xl">{movie.description}</p>
          <div className="flex items-center gap-4">
            <Link href={`/movie/${movie.id}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold px-8 text-base rounded-md h-12 gap-2" data-testid="btn-movie-play-hero">
                <Play className="w-5 h-5 fill-current" /> Watch Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-all" data-testid="btn-movie-hero-prev">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center transition-all" data-testid="btn-movie-hero-next">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8 bg-primary" : "w-3 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
