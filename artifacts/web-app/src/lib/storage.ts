import { createClient } from '@supabase/supabase-js';

// Direct Database Configuration (No more variable dependencies)
const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'sb_publishable_8edbca9ec0670868f00db1019ffcd90d40237e13'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Anime {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
  videoUrl?: string;
  description: string;
  genres: string[];
  rating: number;
  status: "Ongoing" | "Completed" | "Upcoming";
}

// DEFAULT INITIAL CARDS (Fallback systems)
const DEFAULT_MOVIES: Anime[] = [
  { id: "1", title: "Solo Leveling", posterUrl: "https://tmdb.org", bannerUrl: "https://tmdb.org", description: "Action Anime", genres: ["Action"], rating: 8.9, status: "Ongoing" },
  { id: "2", title: "Attack on Titan", posterUrl: "https://tmdb.org", bannerUrl: "https://tmdb.org", description: "Thriller Anime", genres: ["Thriller"], rating: 9.1, status: "Completed" },
  { id: "3", title: "One Piece", posterUrl: "https://tmdb.org", bannerUrl: "https://tmdb.org", description: "Adventure Anime", genres: ["Adventure"], rating: 8.8, status: "Ongoing" }
];

export async function getAnimeList(): Promise<Anime[]> {
  try {
    const { data, error } = await supabase.from('movies').select('*');
    if (error || !data || data.length === 0) return DEFAULT_MOVIES;
    
    return data.map((item: any) => ({
      id: item.id ? String(item.id) : String(item.id_num || Date.now()),
      title: item.title || "Untitled Anime",
      posterUrl: item.posterUrl || "https://tmdb.org", 
      bannerUrl: item.posterUrl || "https://tmdb.org", 
      videoUrl: item.videoUrl || "",
      description: "Cloud Streamed Anime Series",
      genres: ["Anime"],
      rating: 8.5,
      status: "Ongoing"
    }));
  } catch (e) {
    return DEFAULT_MOVIES;
  }
}

export async function saveAnime(anime: Anime): Promise<void> {
  await supabase.from('movies').insert([{
    title: anime.title,
    posterUrl: anime.posterUrl,
    videoUrl: (anime as any).videoUrl || ""
  }]);
}

export async function getAdsConfig() { return null; }
export async function saveAdsConfig() { }
export async function getAnime() { return getAnimeList(); }
export async function getMovies() { return getAnimeList(); }
export async function saveMovies(anime: any) { return saveAnime(anime); }
export async function getEpisodes() { return []; }
export async function saveEpisodes() { }
export function checkAdminPassword(p: string) { return p === "admin123"; } 
export function getAdminLockoutInfo() { return null; }
