import { createClient } from '@supabase/supabase-js';

// Asli Real-time Database Link aur Keys
const supabaseUrl = 'https://fmbbokjtgxscjowwzvzq.supabase.co';

const supabaseAnonKey = 'sb_publishable_9eEWaatZYtF8dGflNacSXQ_k1vgd3Ud'; 

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

const DEFAULT_MOVIES: Anime[] = [];

export async function getAnimeList(): Promise<Anime[]> {
  try {
    // Direct raw network pipeline bypass to avoid browser caching
    const response = await fetch(`${supabaseUrl}/rest/v1/movies?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    if (!data || data.length === 0 || data.error) return DEFAULT_MOVIES;
    
    return data.map((item: any) => ({
      id: item.id ? String(item.id) : String(item.id_num || Date.now()),
      title: item.title || "Untitled Anime",
      posterUrl: item.posterUrl || "", 
      bannerUrl: item.posterUrl || "", 
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
  try {
    await fetch(`${supabaseUrl}/rest/v1/movies`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        title: anime.title,
        posterUrl: anime.posterUrl,
        videoUrl: (anime as any).videoUrl || ""
      })
    });
  } catch (e) {}
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
