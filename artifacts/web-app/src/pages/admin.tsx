// @ts-nocheck

import { Navbar } from "@/components/Navbar";
import {
  getAnime,
  saveAnime,
  Anime
} from "../lib/storage";


 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit2, Trash2, Plus, Lock, X, Eye, EyeOff, Megaphone, ToggleLeft, ToggleRight } from "lucide-react";

const SESSION_KEY = "antoons_admin_session";

function useCountdown(unlockAt: number | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!unlockAt) return;
    const tick = () => setRemaining(Math.max(0, unlockAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [unlockAt]);
  return remaining;
}

function formatCountdown(ms: number) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h > 0 ? `${h}h ` : ""}${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [lockInfo, setLockInfo] = useState(getAdminLockoutInfo());
  const remaining = useCountdown(lockInfo.locked ? lockInfo.unlockAt : null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (lockInfo.locked && remaining === 0) {
      setLockInfo(getAdminLockoutInfo());
      setError("");
    }
  }, [remaining, lockInfo.locked]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = checkAdminPassword(password);
    if (result.success) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onSuccess();
    } else if (result.locked) {
      setLockInfo(getAdminLockoutInfo());
      setError("");
    } else {
      setError(
        result.remainingAttempts === 0
          ? "Too many failed attempts. Panel locked for 1 hour."
          : `Wrong password. ${result.remainingAttempts} attempt${result.remainingAttempts !== 1 ? "s" : ""} remaining.`
      );
      setPassword("");
      setLockInfo(getAdminLockoutInfo());
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-xl p-8 shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${lockInfo.locked ? "bg-red-500/10" : "bg-primary/10"}`}>
                <Lock className={`w-6 h-6 ${lockInfo.locked ? "text-red-500" : "text-primary"}`} />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">Admin Panel</h1>
              <p className="text-sm text-gray-400 mt-1">AN TOONS Dashboard</p>
            </div>
            {lockInfo.locked ? (
              <div className="text-center space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 font-semibold text-sm mb-2">Panel Locked</p>
                  <p className="text-gray-400 text-xs mb-3">Too many failed attempts. Try again in:</p>
                  <div className="text-2xl font-black text-red-400 tabular-nums">
                    {remaining > 0 ? formatCountdown(remaining) : "Unlocking..."}
                  </div>
                </div>
                <p className="text-gray-500 text-xs">This lock persists across page refreshes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Password</label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="Enter admin password"
                      className="w-full bg-background border border-border rounded-md px-3 py-2 pr-10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      data-testid="input-admin-password"
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
                {lockInfo.attempts > 0 && !error && (
                  <p className="text-yellow-500/80 text-xs text-center">
                    {3 - lockInfo.attempts} attempt{3 - lockInfo.attempts !== 1 ? "s" : ""} remaining before lockout
                  </p>
                )}
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 font-bold" data-testid="btn-admin-login">
                  Access Dashboard
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
        enabled
          ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
      }`}
      data-testid={`toggle-ad-${enabled ? "on" : "off"}`}
    >
      {enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
      {enabled ? "Active" : "Inactive"}
    </button>
  );
}

function ManageAdsTab() {
  const [config, setConfig] = useState<AdsConfig>(getAdsConfig());

  const updateField = <K extends keyof AdsConfig>(key: K, val: AdsConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = () => {
    saveAdsConfig(config);
    toast.success("Ad configuration saved");
  };

  const adSlots: { key: "topBanner" | "belowPlayer" | "popUnder"; label: string; description: string; enabledKey: keyof AdsConfig; codeKey: keyof AdsConfig }[] = [
    {
      key: "topBanner",
      label: "Top Banner Ad",
      description: "Displayed at the very top of the page, above the navbar. Ideal for header banners (728x90, leaderboard).",
      enabledKey: "topBannerEnabled",
      codeKey: "topBannerCode",
    },
    {
      key: "belowPlayer",
      label: "Below Player Ad",
      description: "Displayed directly underneath the video player on the watch page. Ideal for in-content ads.",
      enabledKey: "belowPlayerEnabled",
      codeKey: "belowPlayerCode",
    },
    {
      key: "popUnder",
      label: "Pop-under / Script Ad",
      description: "Injected as a hidden script container. Paste PopAds, pop-under, or redirect scripts here.",
      enabledKey: "popUnderEnabled",
      codeKey: "popUnderCode",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Ads Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paste ad scripts from Google AdSense, PopAds, or any network. Toggle each slot on/off without deleting the code.</p>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 font-bold" data-testid="btn-save-ads">
          Save All Ads
        </Button>
      </div>

      {adSlots.map(slot => (
        <div key={slot.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white text-base">{slot.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5 max-w-lg">{slot.description}</p>
            </div>
            <AdToggle
              enabled={config[slot.enabledKey] as boolean}
              onToggle={() => updateField(slot.enabledKey, !config[slot.enabledKey] as AdsConfig[typeof slot.enabledKey])}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block uppercase tracking-wider">Ad Script / HTML Embed Code</label>
            <Textarea
              value={config[slot.codeKey] as string}
              onChange={e => updateField(slot.codeKey, e.target.value as AdsConfig[typeof slot.codeKey])}
              placeholder={`<!-- Paste your ${slot.label} code here -->\n<script src="..."></script>\n<!-- or image banner HTML -->`}
              className="bg-background border-border font-mono text-xs h-28 resize-none text-gray-300 placeholder:text-gray-600"
              data-testid={`textarea-ad-${slot.key}`}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className={`w-1.5 h-1.5 rounded-full ${(config[slot.enabledKey] as boolean) && (config[slot.codeKey] as string).trim() ? "bg-green-500" : "bg-gray-600"}`} />
            {(config[slot.enabledKey] as boolean) && (config[slot.codeKey] as string).trim()
              ? "This ad slot is live and will render for visitors."
              : !(config[slot.codeKey] as string).trim()
              ? "No code provided. Paste an ad script to activate."
              : "Slot is disabled. Toggle to Active to go live."}
          </div>
        </div>
      ))}

      <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-300">How it works</p>
        <p>• <span className="text-white">HTML banners</span> (img tags, anchor tags) render directly inside the slot container.</p>
        <p>• <span className="text-white">Script ads</span> (AdSense, PopAds) are extracted and injected into the document head for proper execution.</p>
        <p>• Toggle a slot OFF to pause it without losing your code — useful for A/B testing networks.</p>
        <p>• All settings persist in <span className="text-white font-mono">localStorage</span> across sessions.</p>
      </div>
    </div>
  );
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true"
  );

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showAnimeForm, setShowAnimeForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Partial<Anime> | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<Partial<Episode> | null>(null);
  const blankLangSlots = (): EmbedLang[] =>
    FIXED_LANGUAGES.map(lang => ({ lang, url360: "", url480: "", url720: "", url1080: "" }));

  const [embedLangs, setEmbedLangs] = useState<EmbedLang[]>(blankLangSlots);

  const [movieList, setMovieList]             = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie]       = useState<Partial<Movie> | null>(null);
  const [showMovieForm, setShowMovieForm]     = useState(false);
  const [movieEmbedLangs, setMovieEmbedLangs] = useState<EmbedLang[]>(blankLangSlots);

    useEffect(() => {
    if (isAuthenticated) {
      getAnime().then((data) => {
        setAnimeList(data);
      }).catch(() => {});
    }
  }, [isAuthenticated]);



  if (!isAuthenticated) return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;

   const handleSaveAnime = async () => {
    if (!editingAnime?.title || !editingAnime?.posterUrl) {
      toast.error("Title and Poster URL are required");
      return;
    }

    const newAnime: Anime = {
      id: editingAnime.id || Date.now().toString(),
      title: editingAnime.title,
      posterUrl: editingAnime.posterUrl,
      bannerUrl: editingAnime.bannerUrl || "",
      description: editingAnime.description || "",
      seoDescription: editingAnime.seoDescription || "",
      genres: Array.isArray(editingAnime.genres) ? editingAnime.genres : ["Anime"],
      rating: editingAnime.rating || 0,
      status: editingAnime.status || "Ongoing",
    };

    try {
      // Supabase cloud data connector sync
      await (saveAnime as any)(newAnime);


      
      let updatedList;
      if (editingAnime.id) {
        updatedList = animeList.map(a => a.id === editingAnime.id ? newAnime : a);
        toast.success("Anime updated successfully in Cloud");
      } else {
        updatedList = [...animeList, newAnime];
        toast.success("Anime added successfully to Cloud");
      }
      
      setAnimeList(updatedList);
      setShowAnimeForm(false);
      setEditingAnime(null);
    } catch (error) {
      toast.error("Cloud database synchronization failed");
    }
  };

  const handleDeleteAnime = (id: string) => {
    if (confirm("Delete this anime and all its episodes?")) {
      saveAnime(animeList.filter(a => a.id !== id));
      setAnimeList(prev => prev.filter(a => a.id !== id));
      const updated = episodes.filter(e => e.animeId !== id);
      saveEpisodes(updated);
      setEpisodes(updated);
      toast.success("Anime deleted");
    }
  };

  const openEpisodeForm = (ep?: Episode) => {
    const slots = blankLangSlots().map(blank => {
      const existing = ep?.embedUrls.find(e => e.lang === blank.lang);
      return existing ? { ...blank, ...existing } : blank;
    });
    setEditingEpisode(ep ?? { season: 1, episodeNumber: 1 });
    setEmbedLangs(slots);
    setShowEpisodeForm(true);
  };

  const handleSaveEpisode = () => {
    if (!editingEpisode?.animeId || !editingEpisode?.title) {
      toast.error("Anime and Title are required");
      return;
    }
    const activeLangs = embedLangs.filter(el =>
      el.url360 || el.url480 || el.url720 || el.url1080
    );
    if (activeLangs.length === 0) {
      toast.error("Add at least one quality URL for at least one language");
      return;
    }
    const newEp: Episode = {
      id: editingEpisode.id || Date.now().toString(),
      animeId: editingEpisode.animeId,
      season: editingEpisode.season || 1,
      episodeNumber: editingEpisode.episodeNumber || 1,
      title: editingEpisode.title,
      embedUrls: activeLangs,
    };
    let updatedList;
    if (editingEpisode.id) {
      updatedList = episodes.map(e => e.id === editingEpisode.id ? newEp : e);
      toast.success("Episode updated");
    } else {
      updatedList = [...episodes, newEp];
      toast.success("Episode added");
    }
    saveEpisodes(updatedList);
    setEpisodes(updatedList);
    setShowEpisodeForm(false);
    setEditingEpisode(null);
    setEmbedLangs(blankLangSlots());
  };

  const handleDeleteEpisode = (id: string) => {
    if (confirm("Delete this episode?")) {
      const updated = episodes.filter(e => e.id !== id);
      saveEpisodes(updated);
      setEpisodes(updated);
      toast.success("Episode deleted");
    }
  };

  const updateLangField = (langName: string, field: keyof EmbedLang, val: string) =>
    setEmbedLangs(prev => prev.map(el => el.lang === langName ? { ...el, [field]: val } : el));

  const updateMovieLangField = (langName: string, field: keyof EmbedLang, val: string) =>
    setMovieEmbedLangs(prev => prev.map(el => el.lang === langName ? { ...el, [field]: val } : el));

  const openMovieForm = (movie?: Movie) => {
    const slots = blankLangSlots().map(blank => {
      const existing = movie?.embedUrls.find(e => e.lang === blank.lang);
      return existing ? { ...blank, ...existing } : blank;
    });
    setEditingMovie(movie ?? { status: "Released" });
    setMovieEmbedLangs(slots);
    setShowMovieForm(true);
  };

  const handleSaveMovie = () => {
    if (!editingMovie?.title || !editingMovie?.posterUrl) {
      toast.error("Title and Poster URL are required");
      return;
    }
    const activeLangs = movieEmbedLangs.filter(el =>
      el.url360 || el.url480 || el.url720 || el.url1080
    );
    const newMovie: Movie = {
      id: editingMovie.id || Date.now().toString(),
      title: editingMovie.title,
      posterUrl: editingMovie.posterUrl,
      bannerUrl: editingMovie.bannerUrl || "",
      description: editingMovie.description || "",
      seoDescription: editingMovie.seoDescription || "",
      genres: Array.isArray(editingMovie.genres) ? editingMovie.genres : [],
      rating: editingMovie.rating || 0,
      status: editingMovie.status || "Released",
      embedUrls: activeLangs,
    };
    let updatedList: Movie[];
    if (editingMovie.id) {
      updatedList = movieList.map(m => m.id === editingMovie.id ? newMovie : m);
      toast.success("Movie updated");
    } else {
      updatedList = [...movieList, newMovie];
      toast.success("Movie added");
    }
    saveMovies(updatedList);
    setMovieList(updatedList);
    setShowMovieForm(false);
    setEditingMovie(null);
    setMovieEmbedLangs(blankLangSlots());
  };

  const handleDeleteMovie = (id: string) => {
    if (confirm("Delete this movie?")) {
      const updated = movieList.filter(m => m.id !== id);
      saveMovies(updated);
      setMovieList(updated);
      toast.success("Movie deleted");
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-20">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setIsAuthenticated(false); }}
            className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-md transition-colors"
            data-testid="btn-admin-logout"
          >
            Sign Out
          </button>
        </div>

        <Tabs defaultValue="anime" className="w-full">
          <TabsList className="bg-secondary mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="anime" className="data-[state=active]:bg-primary data-[state=active]:text-white">Anime Management</TabsTrigger>
            <TabsTrigger value="episodes" className="data-[state=active]:bg-primary data-[state=active]:text-white">Episode Management</TabsTrigger>
            <TabsTrigger value="movies" className="data-[state=active]:bg-primary data-[state=active]:text-white">Manage Movies</TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-primary data-[state=active]:text-white flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5" /> Manage Ads
            </TabsTrigger>
          </TabsList>

          {/* ── ANIME TAB ─────────────────────────────────────────── */}
          <TabsContent value="anime" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
              <h2 className="text-xl font-semibold">Anime Catalog</h2>
              <Button onClick={() => { setEditingAnime({ status: "Ongoing" }); setShowAnimeForm(true); }} className="gap-2 bg-primary hover:bg-primary/90" data-testid="btn-add-anime">
                <Plus className="w-4 h-4" /> Add Anime
              </Button>
            </div>

            {showAnimeForm && (
              <div className="bg-card border border-border p-6 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-semibold text-lg">{editingAnime?.id ? "Edit" : "Add"} Anime</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input value={editingAnime?.title || ""} onChange={e => setEditingAnime({ ...editingAnime, title: e.target.value })} className="bg-background border-border" data-testid="input-anime-title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select value={editingAnime?.status || "Ongoing"} onValueChange={v => setEditingAnime({ ...editingAnime, status: v as Anime["status"] })}>
                      <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Poster URL</label>
                    <Input value={editingAnime?.posterUrl || ""} onChange={e => setEditingAnime({ ...editingAnime, posterUrl: e.target.value })} className="bg-background border-border" data-testid="input-anime-poster" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Banner URL</label>
                    <Input value={editingAnime?.bannerUrl || ""} onChange={e => setEditingAnime({ ...editingAnime, bannerUrl: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Rating (0-10)</label>
                    <Input type="number" min="0" max="10" step="0.1" value={editingAnime?.rating || 0} onChange={e => setEditingAnime({ ...editingAnime, rating: parseFloat(e.target.value) })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Genres (comma separated)</label>
                    <Input value={editingAnime?.genres?.join(", ") || ""} onChange={e => setEditingAnime({ ...editingAnime, genres: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="bg-background border-border" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea value={editingAnime?.description || ""} onChange={e => setEditingAnime({ ...editingAnime, description: e.target.value })} className="bg-background border-border h-20" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                      SEO Description
                      <span className="text-[10px] font-normal text-gray-500 bg-secondary px-1.5 py-0.5 rounded">meta description / og:description</span>
                    </label>
                    <Textarea
                      value={editingAnime?.seoDescription || ""}
                      onChange={e => setEditingAnime({ ...editingAnime, seoDescription: e.target.value })}
                      placeholder="Write a keyword-rich SEO description (150-160 chars). Leave blank to use the main description."
                      className="bg-background border-border h-16 text-sm"
                      data-testid="input-anime-seo-description"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      {(editingAnime?.seoDescription || "").length}/160 chars — shown in Google search results and social sharing previews.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => { setShowAnimeForm(false); setEditingAnime(null); }}>Cancel</Button>
                  <Button onClick={handleSaveAnime} className="bg-primary hover:bg-primary/90">Save Anime</Button>
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">SEO</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animeList.map(anime => (
                    <TableRow key={anime.id} className="border-border hover:bg-secondary/30">
                      <TableCell className="font-medium">{anime.title}</TableCell>
                      <TableCell>{anime.status}</TableCell>
                      <TableCell>{anime.rating}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${anime.seoDescription ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-500 border border-white/10"}`}>
                          {anime.seoDescription ? "Custom" : "Auto"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingAnime(anime); setShowAnimeForm(true); }} data-testid={`btn-edit-anime-${anime.id}`}>
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAnime(anime.id)} data-testid={`btn-delete-anime-${anime.id}`}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {animeList.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500">No anime found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── EPISODES TAB ──────────────────────────────────────── */}
          <TabsContent value="episodes" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
              <h2 className="text-xl font-semibold">Episode Catalog</h2>
              <Button onClick={() => openEpisodeForm()} className="gap-2 bg-primary hover:bg-primary/90" data-testid="btn-add-episode">
                <Plus className="w-4 h-4" /> Add Episode
              </Button>
            </div>

            {showEpisodeForm && (
              <div className="bg-card border border-border p-6 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-semibold text-lg">{editingEpisode?.id ? "Edit" : "Add"} Episode</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block">Anime</label>
                    <Select value={editingEpisode?.animeId || ""} onValueChange={v => setEditingEpisode({ ...editingEpisode, animeId: v })}>
                      <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select Anime" /></SelectTrigger>
                      <SelectContent>
                        {animeList.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Season</label>
                    <Input type="number" min="1" value={editingEpisode?.season || 1} onChange={e => setEditingEpisode({ ...editingEpisode, season: parseInt(e.target.value) })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Episode Number</label>
                    <Input type="number" min="1" value={editingEpisode?.episodeNumber || 1} onChange={e => setEditingEpisode({ ...editingEpisode, episodeNumber: parseInt(e.target.value) })} className="bg-background border-border" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block">Episode Title</label>
                    <Input value={editingEpisode?.title || ""} onChange={e => setEditingEpisode({ ...editingEpisode, title: e.target.value })} className="bg-background border-border" data-testid="input-episode-title" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-3 block">Language &amp; Quality Embed URLs</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {FIXED_LANGUAGES.map(langName => {
                        const el = embedLangs.find(e => e.lang === langName) ?? { lang: langName };
                        const hasAny = !!(el.url360 || el.url480 || el.url720 || el.url1080);
                        const QFIELDS: { label: string; field: keyof EmbedLang; color: string }[] = [
                          { label: "360p",  field: "url360",  color: "text-gray-400" },
                          { label: "480p",  field: "url480",  color: "text-gray-400" },
                          { label: "720p",  field: "url720",  color: "text-blue-400" },
                          { label: "1080p", field: "url1080", color: "text-yellow-500" },
                        ];
                        return (
                          <div key={langName} className={`border rounded-lg p-3 space-y-2 transition-colors ${hasAny ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-bold ${hasAny ? "text-primary" : "text-gray-400"}`}>{langName}</span>
                              {hasAny && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">Active</span>}
                            </div>
                            {QFIELDS.map(({ label, field, color }) => (
                              <div key={label} className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold w-10 flex-shrink-0 uppercase tracking-wider ${color}`}>{label}</span>
                                <Input
                                  value={(el[field] as string) || ""}
                                  onChange={e => updateLangField(langName, field, e.target.value)}
                                  placeholder={`${langName} ${label} URL`}
                                  className="bg-secondary border-border text-xs h-7 flex-1"
                                  data-testid={`input-${langName.toLowerCase()}-${label}`}
                                />
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Fill any quality URL to activate a language. Leave all four blank to hide that language from viewers.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => { setShowEpisodeForm(false); setEditingEpisode(null); setEmbedLangs(blankLangSlots()); }}>Cancel</Button>
                  <Button onClick={handleSaveEpisode} className="bg-primary hover:bg-primary/90">Save Episode</Button>
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-gray-300">Anime</TableHead>
                    <TableHead className="text-gray-300">S / E</TableHead>
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Languages</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {episodes.map(ep => {
                    const anime = animeList.find(a => a.id === ep.animeId);
                    return (
                      <TableRow key={ep.id} className="border-border hover:bg-secondary/30">
                        <TableCell className="font-medium">{anime?.title || "Unknown"}</TableCell>
                        <TableCell>S{ep.season} E{ep.episodeNumber}</TableCell>
                        <TableCell>{ep.title}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {ep.embedUrls.map(el => (
                              <span key={el.lang} className="text-[10px] border border-white/15 px-1.5 py-0.5 rounded text-gray-300">{el.lang}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEpisodeForm(ep)} data-testid={`btn-edit-episode-${ep.id}`}>
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEpisode(ep.id)} data-testid={`btn-delete-episode-${ep.id}`}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {episodes.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500">No episodes found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── MOVIES TAB ────────────────────────────────────────── */}
          <TabsContent value="movies" className="space-y-6">
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border border-border">
              <h2 className="text-xl font-semibold">Movie Catalog</h2>
              <Button onClick={() => openMovieForm()} className="gap-2 bg-primary hover:bg-primary/90" data-testid="btn-add-movie">
                <Plus className="w-4 h-4" /> Add Movie
              </Button>
            </div>

            {showMovieForm && (
              <div className="bg-card border border-border p-6 rounded-lg space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="font-semibold text-lg">{editingMovie?.id ? "Edit" : "Add"} Movie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Movie Title</label>
                    <Input value={editingMovie?.title || ""} onChange={e => setEditingMovie({ ...editingMovie, title: e.target.value })} className="bg-background border-border" data-testid="input-movie-title" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <Select value={editingMovie?.status || "Released"} onValueChange={v => setEditingMovie({ ...editingMovie, status: v as Movie["status"] })}>
                      <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Released">Released</SelectItem>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Poster URL</label>
                    <Input value={editingMovie?.posterUrl || ""} onChange={e => setEditingMovie({ ...editingMovie, posterUrl: e.target.value })} className="bg-background border-border" data-testid="input-movie-poster" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Banner URL</label>
                    <Input value={editingMovie?.bannerUrl || ""} onChange={e => setEditingMovie({ ...editingMovie, bannerUrl: e.target.value })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Rating (0-10)</label>
                    <Input type="number" min="0" max="10" step="0.1" value={editingMovie?.rating || 0} onChange={e => setEditingMovie({ ...editingMovie, rating: parseFloat(e.target.value) })} className="bg-background border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Genre (comma separated)</label>
                    <Input value={editingMovie?.genres?.join(", ") || ""} onChange={e => setEditingMovie({ ...editingMovie, genres: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="bg-background border-border" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea value={editingMovie?.description || ""} onChange={e => setEditingMovie({ ...editingMovie, description: e.target.value })} className="bg-background border-border h-20" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-1 block flex items-center gap-2">
                      SEO Description
                      <span className="text-[10px] font-normal text-gray-500 bg-secondary px-1.5 py-0.5 rounded">meta description</span>
                    </label>
                    <Textarea
                      value={editingMovie?.seoDescription || ""}
                      onChange={e => setEditingMovie({ ...editingMovie, seoDescription: e.target.value })}
                      placeholder="Keyword-rich SEO description (150-160 chars). Leave blank to auto-generate."
                      className="bg-background border-border h-16 text-sm"
                    />
                  </div>
                  {/* ── Fixed 4-language quality cards ── */}
                  <div className="col-span-full">
                    <label className="text-sm font-medium mb-3 block">Language &amp; Quality Embed URLs</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {FIXED_LANGUAGES.map(langName => {
                        const el = movieEmbedLangs.find(e => e.lang === langName) ?? { lang: langName };
                        const hasAny = !!(el.url360 || el.url480 || el.url720 || el.url1080);
                        const QFIELDS: { label: string; field: keyof EmbedLang; color: string }[] = [
                          { label: "360p",  field: "url360",  color: "text-gray-400" },
                          { label: "480p",  field: "url480",  color: "text-gray-400" },
                          { label: "720p",  field: "url720",  color: "text-blue-400" },
                          { label: "1080p", field: "url1080", color: "text-yellow-500" },
                        ];
                        return (
                          <div key={langName} className={`border rounded-lg p-3 space-y-2 transition-colors ${hasAny ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-sm font-bold ${hasAny ? "text-primary" : "text-gray-400"}`}>{langName}</span>
                              {hasAny && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">Active</span>}
                            </div>
                            {QFIELDS.map(({ label, field, color }) => (
                              <div key={label} className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold w-10 flex-shrink-0 uppercase tracking-wider ${color}`}>{label}</span>
                                <Input
                                  value={(el[field] as string) || ""}
                                  onChange={e => updateMovieLangField(langName, field, e.target.value)}
                                  placeholder={`${langName} ${label} URL`}
                                  className="bg-secondary border-border text-xs h-7 flex-1"
                                  data-testid={`input-movie-${langName.toLowerCase()}-${label}`}
                                />
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Fill any quality URL to activate a language. Leave all four blank to hide it from viewers.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="ghost" onClick={() => { setShowMovieForm(false); setEditingMovie(null); setMovieEmbedLangs(blankLangSlots()); }}>Cancel</Button>
                  <Button onClick={handleSaveMovie} className="bg-primary hover:bg-primary/90">Save Movie</Button>
                </div>
              </div>
            )}

            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-secondary/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-gray-300">Title</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">Languages</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movieList.map(movie => (
                    <TableRow key={movie.id} className="border-border hover:bg-secondary/30">
                      <TableCell className="font-medium">{movie.title}</TableCell>
                      <TableCell>{movie.status}</TableCell>
                      <TableCell>{movie.rating}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {movie.embedUrls.map(el => (
                            <span key={el.lang} className="text-[10px] border border-white/15 px-1.5 py-0.5 rounded text-gray-300">{el.lang}</span>
                          ))}
                          {movie.embedUrls.length === 0 && <span className="text-[10px] text-gray-600">No links</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openMovieForm(movie)} data-testid={`btn-edit-movie-${movie.id}`}>
                          <Edit2 className="w-4 h-4 text-blue-400" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteMovie(movie.id)} data-testid={`btn-delete-movie-${movie.id}`}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {movieList.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-6 text-gray-500">No movies found. Click "Add Movie" to get started.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ── ADS TAB ───────────────────────────────────────────── */}
          <TabsContent value="ads">
            <ManageAdsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
