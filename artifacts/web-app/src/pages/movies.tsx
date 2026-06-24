// @ts-nocheck

import { Navbar } from "@/components/Navbar";
import { MovieHeroSection } from "@/components/MovieHeroSection";
import { MovieRow } from "@/components/MovieRow";
import { MovieCard } from "@/components/MovieCard";
import { AdSlot } from "@/components/AdSlot";
import { useSEO } from "@/hooks/use-seo";
import { getAnimeList as getMovies, Anime as Movie } from "../lib/storage";



export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "Movies - Watch Anime Movies Free in HD | AN TOONS",
    description: "Watch the latest anime movies online for free in Hindi Dub, English Sub, and Dubbed. Stream premium anime movies in HD on AN TOONS.",
    keywords: "anime movies, watch anime movies online, anime movies hindi dub, anime movies sub dub, an toons movies, anime films",
    ogType: "website",
  });
    useEffect(() => {
    // Cloud database fetch connector for movies page
    getMovies().then((data) => {
      setMovies(data || []);
    }).catch(() => {});
  }, []);



  const filtered = movies.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const trending   = movies.filter(m => m.rating >= 8.5);
  const popular    = movies.slice().sort((a, b) => b.rating - a.rating);
  const latest     = movies.slice().reverse();

  return (
    <div className="min-h-screen bg-background">
      <AdSlot placement="top-banner" className="bg-black/80 border-b border-border/30" />
      <Navbar onSearch={setSearchQuery} />

      {searchQuery ? (
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
          <h2 className="text-2xl font-bold text-white mb-6">Search Results for "{searchQuery}"</h2>
          <div className="flex flex-wrap gap-4">
            {filtered.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
          {filtered.length === 0 && (
            <p className="text-gray-400 mt-8 text-center text-lg">No movies found matching your search.</p>
          )}
        </div>
      ) : (
        <>
          <MovieHeroSection movies={movies} />
          <div className="-mt-32 relative z-20 pb-20">
            <MovieRow title="Trending Movies" movies={trending} />
            <MovieRow title="Popular Movies" movies={popular} />
            <MovieRow title="Latest Movie Releases" movies={latest} />
            {movies.length === 0 && (
              <div className="text-center py-24 text-gray-500">
                <p className="text-5xl mb-4">🎬</p>
                <h3 className="text-xl font-semibold text-white mb-2">No Movies Added Yet</h3>
                <p className="text-gray-400">Visit the <a href="/admin" className="text-primary hover:underline">Admin Panel</a> to add your first movie.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
