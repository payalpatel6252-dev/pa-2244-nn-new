// @ts-nocheck

import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { AnimeRow } from "@/components/AnimeRow";
import { getAnime, Anime } from "../lib/storage";

import { AnimeCard } from "@/components/AnimeCard";
import { AdSlot } from "@/components/AdSlot";
import { useSEO } from "@/hooks/use-seo";

export default function Home() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useSEO({
    title: "AN TOONS - Stream Premium Anime in Hindi, Sub & Dub",
    description: "Watch the latest anime online for free in Hindi Dub, English Sub, and English Dub. Stream Solo Leveling, Demon Slayer, Attack on Titan, One Piece and more on AN TOONS.",
    keywords: "watch anime, anime hindi dub, streamwish, an toons, anime online, solo leveling, demon slayer, attack on titan, jujutsu kaisen, one piece, anime sub dub",
    ogImage: "https://i.ytimg.com/vi/j5x3BCdnFiQ/maxresdefault.jpg",
    ogType: "website",
  });
  useEffect(() => {
    getAnime().then((data) => {
      setAnimeList(data || []);
    }).catch(() => {});
  }, []);


  const filteredAnime = animeList.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <AdSlot placement="top-banner" className="bg-black/80 border-b border-border/30" />
      <Navbar onSearch={setSearchQuery} />

      {searchQuery ? (
        <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
          <h2 className="text-2xl font-bold text-white mb-6">Search Results for "{searchQuery}"</h2>
          <div className="flex flex-wrap gap-4">
            {filteredAnime.map(anime => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
          {filteredAnime.length === 0 && (
            <p className="text-gray-400 mt-8 text-center text-lg">No anime found matching your search.</p>
          )}
        </div>
      ) : (
        <>
          <HeroSection animeList={animeList} />

          <div className="-mt-32 relative z-20 pb-20">
            <AnimeRow title="Trending Now" animeList={animeList.filter(a => a.rating > 9)} />
            <AnimeRow title="Latest Anime Releases" animeList={animeList.slice().reverse()} />
            <AnimeRow title="Action & Adventure" animeList={animeList.filter(a => a.genres.includes("Action"))} />
          </div>
        </>
      )}
    </div>
  );
}
