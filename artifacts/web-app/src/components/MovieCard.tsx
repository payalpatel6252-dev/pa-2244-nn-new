import { Link } from "wouter";
import { Play, Film } from "lucide-react";
import { Movie } from "@/lib/storage";

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group block relative rounded-md overflow-hidden bg-card flex-shrink-0 transition-all duration-300 hover:scale-110 hover:z-10"
      style={{ width: "150px", aspectRatio: "2/3" }}
      data-testid={`card-movie-${movie.id}`}
    >
      {movie.posterUrl ? (
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <Film className="w-10 h-10 text-gray-600" />
        </div>
      )}

      <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
        <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
          ★ {movie.rating.toFixed(1)}
        </span>
        <span className="bg-blue-600/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
          MOVIE
        </span>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2.5">
        <h3 className="text-white font-bold text-xs line-clamp-2 mb-1 leading-tight">{movie.title}</h3>
        <div className="flex flex-wrap gap-0.5 mb-2">
          {movie.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="text-[9px] text-gray-300">{genre}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-white text-[10px] font-semibold bg-primary rounded-full py-1 px-2.5 w-max">
          <Play className="w-2.5 h-2.5 fill-current" /> Watch
        </div>
      </div>
    </Link>
  );
}
