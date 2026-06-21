import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { Navbar } from "@/components/Navbar";
import { getAnime, getEpisodes, FIXED_LANGUAGES, Anime, Episode, EmbedLang } from "@/lib/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdSlot } from "@/components/AdSlot";
import { useSEO } from "@/hooks/use-seo";

type Quality = "360p" | "480p" | "720p" | "1080p";

const QUALITY_SLOTS: { label: Quality; field: keyof EmbedLang }[] = [
  { label: "360p",  field: "url360"  },
  { label: "480p",  field: "url480"  },
  { label: "720p",  field: "url720"  },
  { label: "1080p", field: "url1080" },
];

function getQualityUrl(lang: EmbedLang, q: Quality): string {
  const map: Record<Quality, keyof EmbedLang> = { "360p": "url360", "480p": "url480", "720p": "url720", "1080p": "url1080" };
  return (lang[map[q]] as string | undefined) || lang.url || "";
}

function langHasAnyUrl(lang: EmbedLang): boolean {
  return !!(lang.url360 || lang.url480 || lang.url720 || lang.url1080 || lang.url);
}

function availableQualities(lang: EmbedLang): Quality[] {
  return QUALITY_SLOTS.filter(s => !!(lang[s.field] as string | undefined)).map(s => s.label);
}

function bestQuality(lang: EmbedLang): Quality | null {
  const preferred: Quality[] = ["1080p", "720p", "480p", "360p"];
  return preferred.find(q => getQualityUrl(lang, q)) ?? null;
}

function buildSeoTitle(anime: Anime, ep: Episode | null): string {
  if (ep) return `Watch ${anime.title} Season ${ep.season} Episode ${ep.episodeNumber} - ${ep.title} Free Stream in HD - AN TOONS`;
  return `Watch ${anime.title} Free Stream in HD - AN TOONS`;
}

function buildSeoDescription(anime: Anime): string {
  if (anime.seoDescription) return anime.seoDescription;
  return `Watch ${anime.title} Full Episodes in Hindi Dubbed, Subbed and Dubbed online on AN TOONS. Current status: ${anime.status}. Rating: ${anime.rating}/5.`;
}

function buildSeoKeywords(anime: Anime, ep: Episode | null): string {
  const base = `${anime.title}, watch ${anime.title} online, ${anime.title} hindi dub, ${anime.title} sub, ${anime.title} dub, anime streaming, an toons, streamwish`;
  if (ep) return `${base}, ${anime.title} episode ${ep.episodeNumber} hindi dub, ${anime.title} streamwish, ${anime.title} season ${ep.season} episode ${ep.episodeNumber}`;
  return base;
}

export default function Watch() {
  const { id } = useParams<{ id: string }>();

  const [anime, setAnime]                       = useState<Anime | null>(null);
  const [episodes, setEpisodes]                 = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason]     = useState<number>(1);
  const [currentEpisode, setCurrentEpisode]     = useState<Episode | null>(null);
  const [activeLang, setActiveLang]             = useState<EmbedLang | null>(null);
  const [activeQuality, setActiveQuality]       = useState<Quality | null>(null);

  const playerRef = useRef<HTMLDivElement>(null);

  useSEO({
    title:       anime ? buildSeoTitle(anime, currentEpisode) : "Watch Anime Free in HD - AN TOONS",
    description: anime ? buildSeoDescription(anime) : "Stream premium anime online for free on AN TOONS.",
    keywords:    anime ? buildSeoKeywords(anime, currentEpisode) : "watch anime, an toons, anime streaming",
    ogImage:     anime?.bannerUrl || anime?.posterUrl,
    ogType:      "video.other",
  });

  useEffect(() => {
    if (!id) return;
    const found = getAnime().find(a => a.id === id) ?? null;
    setAnime(found);
    const eps = getEpisodes()
      .filter(e => e.animeId === id)
      .sort((a, b) => a.season !== b.season ? a.season - b.season : a.episodeNumber - b.episodeNumber);
    setEpisodes(eps);
    if (eps.length > 0) setSelectedSeason(eps[0].season);
  }, [id]);

  const selectLang = (lang: EmbedLang) => {
    setActiveLang(lang);
    setActiveQuality(bestQuality(lang));
  };

  const handleSelectEpisode = (ep: Episode) => {
    setCurrentEpisode(ep);
    // Pick first available language in fixed order
    const firstAvail = FIXED_LANGUAGES
      .map(l => ep.embedUrls.find(e => e.lang === l))
      .find(l => l && langHasAnyUrl(l)) ?? ep.embedUrls.find(langHasAnyUrl) ?? null;
    if (firstAvail) {
      selectLang(firstAvail);
    } else {
      setActiveLang(null);
      setActiveQuality(null);
    }
    if (window.innerWidth < 1024) {
      setTimeout(() => playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  if (!anime) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Anime not found.</p>
        </div>
      </div>
    );
  }

  const seasons        = Array.from(new Set(episodes.map(e => e.season))).sort((a, b) => a - b);
  const seasonEpisodes = episodes.filter(e => e.season === selectedSeason);

  // Only show languages that have at least one quality URL, in fixed order
  const visibleLangs: EmbedLang[] = FIXED_LANGUAGES
    .map(l => currentEpisode?.embedUrls.find(e => e.lang === l))
    .filter((l): l is EmbedLang => !!l && langHasAnyUrl(l));

  const qualities = activeLang ? availableQualities(activeLang) : [];
  const iframeUrl = activeLang && activeQuality ? getQualityUrl(activeLang, activeQuality) : "";

  return (
    <div className="min-h-screen bg-background">
      <AdSlot placement="top-banner" className="bg-black/80 border-b border-border/30" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-20">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">

          {/* ── LEFT: Player + controls + info ─────────────────── */}
          <div className="w-full lg:w-3/4 min-w-0">

            {/* 16:9 player */}
            <div
              ref={playerRef}
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
                  title={`${anime.title} S${currentEpisode?.season} E${currentEpisode?.episodeNumber}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={anime.bannerUrl || anime.posterUrl}
                    alt={anime.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                  />
                  <div className="relative z-10 flex flex-col items-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 ring-2 ring-primary/30">
                      <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-primary ml-1" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Ready to watch?</h3>
                    <p className="text-sm text-gray-400">Select an episode to start streaming.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Language + Quality selectors — only rendered when an episode is active */}
            {currentEpisode && visibleLangs.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-0.5 mb-3">

                {/* Language buttons — only the 4 fixed langs that have URLs */}
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

                {/* Quality buttons — only shown if active lang has multiple quality URLs */}
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

            {/* Anime info */}
            <div className="pt-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight">{anime.title}</h1>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">{anime.status}</Badge>
                <div className="text-yellow-400 font-bold text-xs">★ {anime.rating.toFixed(1)}</div>
                {anime.genres.map(g => (
                  <span key={g} className="text-[11px] text-gray-400 bg-secondary px-2 py-0.5 rounded">{g}</span>
                ))}
              </div>
              <p className="text-gray-300 leading-relaxed text-sm">{anime.description}</p>
            </div>
          </div>

          {/* ── RIGHT: Episode list ──────────────────────────────── */}
          <div className="w-full lg:w-1/4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-bold text-white">Episodes</h2>
              {seasons.length > 1 && (
                <Select value={selectedSeason.toString()} onValueChange={v => setSelectedSeason(Number(v))}>
                  <SelectTrigger className="w-[120px] bg-secondary border-none text-white h-8 text-xs" data-testid="select-season">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-white">
                    {seasons.map(s => <SelectItem key={s} value={s.toString()}>Season {s}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Horizontal scroll on mobile, vertical on desktop */}
            <div
              className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[600px] lg:gap-1.5 lg:pr-1"
              style={{ scrollbarWidth: "none" }}
            >
              {seasonEpisodes.length > 0 ? seasonEpisodes.map(ep => {
                const isActive = currentEpisode?.id === ep.id;
                // Which fixed langs have URLs for this episode
                const epLangs = FIXED_LANGUAGES.filter(l => {
                  const found = ep.embedUrls.find(e => e.lang === l);
                  return found && langHasAnyUrl(found);
                });
                return (
                  <button
                    key={ep.id}
                    onClick={() => handleSelectEpisode(ep)}
                    className={`flex-shrink-0 lg:flex-shrink text-left transition-all active:scale-[0.97] flex gap-2.5 items-center w-36 lg:w-full p-2.5 lg:p-3 rounded-lg border-l-4 ${
                      isActive ? "bg-primary/10 border-primary" : "bg-card hover:bg-secondary border-transparent"
                    }`}
                    data-testid={`btn-episode-${ep.id}`}
                  >
                    <div className={`flex-shrink-0 w-9 h-7 rounded flex items-center justify-center text-xs font-black tracking-tight ${
                      isActive ? "bg-primary text-white" : "bg-black/50 text-gray-400"
                    }`}>
                      E{ep.episodeNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate font-medium ${isActive ? "text-primary" : "text-gray-200"}`}>
                        {ep.title}
                      </p>
                      {epLangs.length > 0 && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {epLangs.map(l => (
                            <span key={l} className="text-[9px] text-gray-600 border border-white/10 px-1 rounded leading-tight">{l}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                );
              }) : (
                <div className="text-center py-8 text-gray-500 text-sm w-full">No episodes for this season.</div>
              )}
            </div>
          </div>

        </div>
      </main>

      <AdSlot placement="pop-under" />
    </div>
  );
}
