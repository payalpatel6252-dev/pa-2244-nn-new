import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { getMovies, FIXED_LANGUAGES, Movie, EmbedLang } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { useSEO } from "@/hooks/use-seo";

type Quality = "360p" | "480p" | "720p" | "1080p";

const QUALITY_MAP: Record<Quality, keyof EmbedLang> = {
  "360p":  "url360",
  "480p":  "url480",
  "720p":  "url720",
  "1080p": "url1080",
};

function getQualityUrl(lang: EmbedLang, q: Quality): string {
  return (lang[QUALITY_MAP[q]] as string | undefined) || lang.url || "";
}

function langHasAnyUrl(lang: EmbedLang): boolean {
  return !!(lang.url360 || lang.url480 || lang.url720 || lang.url1080 || lang.url);
}

function availableQualities(lang: EmbedLang): Quality[] {
  return (["360p", "480p", "720p", "1080p"] as Quality[]).filter(q => !!getQualityUrl(lang, q));
}

function bestQuality(lang: EmbedLang): Quality | null {
  return (["1080p", "720p", "480p", "360p"] as Quality[]).find(q => getQualityUrl(lang, q)) ?? null;
}

export default function WatchMovie() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [activeLang, setActiveLang] = useState<EmbedLang | null>(null);
  const [activeQuality, setActiveQuality] = useState<Quality | null>(null);

  useSEO({
    title: movie
      ? `Watch ${movie.title} Full Movie Free in HD - AN TOONS`
      : "Watch Anime Movie Free in HD - AN TOONS",
    description: movie
      ? (movie.seoDescription || `Watch ${movie.title} Full Movie in Hindi Dubbed, Subbed and Dubbed online on AN TOONS. Rating: ${movie.rating}/5.`)
      : "Stream premium anime movies online for free on AN TOONS.",
    keywords: movie
      ? `${movie.title}, watch ${movie.title} online, ${movie.title} hindi dub, ${movie.title} full movie, anime movies, an toons`
      : "watch anime movies, an toons, anime streaming",
    ogImage: movie?.bannerUrl || movie?.posterUrl,
    ogType: "video.other",
  });

  useEffect(() => {
    if (!id) return;
    const found = getMovies().find(m => m.id === id) ?? null;
    setMovie(found);
    if (found) {
      const firstAvail = FIXED_LANGUAGES
        .map(l => found.embedUrls.find(e => e.lang === l))
        .find(l => l && langHasAnyUrl(l)) ?? found.embedUrls.find(langHasAnyUrl) ?? null;
      if (firstAvail) {
        setActiveLang(firstAvail);
        setActiveQuality(bestQuality(firstAvail));
      }
    }
  }, [id]);

  const selectLang = (lang: EmbedLang) => {
    setActiveLang(lang);
    setActiveQuality(bestQuality(lang));
  };

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Movie not found.</p>
        </div>
      </div>
    );
  }

  const visibleLangs: EmbedLang[] = FIXED_LANGUAGES
    .map(l => movie.embedUrls.find(e => e.lang === l))
    .filter((l): l is EmbedLang => !!l && langHasAnyUrl(l));

  const qualities = activeLang ? availableQualities(activeLang) : [];
  const iframeUrl = activeLang && activeQuality ? getQualityUrl(activeLang, activeQuality) : "";

  return (
    <div className="min-h-screen bg-background">
      <AdSlot placement="top-banner" className="bg-black/80 border-b border-border/30" />
      <Navbar />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20">

        {/* 16:9 Player */}
        <div
          className="relative bg-black rounded-lg overflow-hidden shadow-2xl border border-white/10 mb-2"
          style={{ aspectRatio: "16/9" }}
        >
          {iframeUrl ? (
            <iframe
              key={iframeUrl}
              src={iframeUrl}
              allow="autoplay; encrypted-media; fullscreen; picture-in-picture; pointer-lock"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full border-0"
              title={`${movie.title} Full Movie`}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src={movie.bannerUrl || movie.posterUrl}
                alt={movie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
              />
              <div className="relative z-10 flex flex-col items-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-2 ring-primary/30">
                  <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-primary ml-1" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{movie.title}</h3>
                <p className="text-sm text-gray-400">No streaming links added yet.</p>
              </div>
            </div>
          )}
        </div>

        {/* Language + Quality selectors */}
        {visibleLangs.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-0.5 mb-4">
            <div className="flex items-center gap-2 flex-wrap" data-testid="lang-selector">
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Language:</span>
              {visibleLangs.map(lang => (
                <button
                  key={lang.lang}
                  onClick={() => selectLang(lang)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all duration-150 active:scale-95 ${
                    activeLang?.lang === lang.lang
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                      : "border-white/20 text-gray-300 hover:border-primary/50 hover:text-white"
                  }`}
                  data-testid={`btn-lang-${lang.lang}`}
                >
                  {lang.lang}
                </button>
              ))}
            </div>

            {qualities.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap" data-testid="quality-selector">
                <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Quality:</span>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => setActiveQuality(q)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-bold border transition-all duration-150 active:scale-95 ${
                      activeQuality === q
                        ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-400"
                        : "border-white/15 text-gray-400 hover:border-white/30 hover:text-white"
                    }`}
                    data-testid={`btn-quality-${q}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <AdSlot placement="below-player" className="my-3 rounded-lg overflow-hidden" />

        {/* Movie info */}
        <div className="pt-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold border border-blue-500/60 text-blue-400 px-2 py-0.5 rounded bg-blue-500/10">MOVIE</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">{movie.title}</h1>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">{movie.status}</Badge>
            <div className="text-yellow-400 font-bold text-xs">★ {movie.rating.toFixed(1)}</div>
            {movie.genres.map(g => (
              <span key={g} className="text-[11px] text-gray-400 bg-secondary px-2 py-0.5 rounded">{g}</span>
            ))}
          </div>
          <p className="text-gray-300 leading-relaxed text-sm">{movie.description}</p>
        </div>

      </main>

      <AdSlot placement="pop-under" />
    </div>
  );
}
