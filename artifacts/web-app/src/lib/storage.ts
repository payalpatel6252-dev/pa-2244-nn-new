import { createClient } from '@supabase/supabase-js';

// Supabase Connection (Clean configuration)
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Anime {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
  description: string;
  seoDescription?: string;
  genres: string[];
  rating: number;
  status: "Ongoing" | "Completed" | "Upcoming";
}

export interface AdsConfig {
  topBannerCode: string;
  topBannerEnabled: boolean;
  belowPlayerCode: string;
  belowPlayerEnabled: boolean;
  popUnderCode: string;
  popUnderEnabled: boolean;
}

const ADS_KEY = "antoons_ads_config";

const DEFAULT_ADS_CONFIG: AdsConfig = {
  topBannerCode: "",
  topBannerEnabled: false,
  belowPlayerCode: "",
  belowPlayerEnabled: false,
  popUnderCode: "",
  popUnderEnabled: false,
};

// ADS CONFIG FUNCTIONS (Cloud Setup)
export async function getAdsConfig(): Promise<AdsConfig> {
  const { data, error } = await supabase.from('config').select('value').eq('key', ADS_KEY).single();
  if (error || !data) return DEFAULT_ADS_CONFIG;
  return { ...DEFAULT_ADS_CONFIG, ...JSON.parse(data.value) };
}

export async function saveAdsConfig(config: AdsConfig): Promise<void> {
  await supabase.from('config').upsert({ key: ADS_KEY, value: JSON.stringify(config) }, { onConflict: 'key' });
}

// ANIME FUNCTIONS (Asli Supabase Database Connectors)
export async function getAnimeList(): Promise<Anime[]> {
  const { data, error } = await supabase.from('movies').select('*');
  if (error || !data) return [];
  return (data as any[]).map((item: any) => ({
    id: item.id ? String(item.id) : String(item.id_num || Date.now()),
    title: item.title || "Untitled",
    posterUrl: item.posterUrl || "",
    bannerUrl: item.posterUrl || "", 
    description: "Anime series",
    genres: ["Anime"],
    rating: 8.5,
    status: "Ongoing"
  }));
}

export async function saveAnime(anime: Anime): Promise<void> {
  await supabase.from('movies').insert([{
    title: anime.title,
    posterUrl: anime.posterUrl,
    videoUrl: (anime as any).videoUrl || ""
  }]);
}

// Compatibility placeholders (taaki purane functions crash na hon)
export async function getAnime() { return getAnimeList(); }
export async function getMovies() { return getAnimeList(); }
export async function saveMovies(anime: any) { return saveAnime(anime); }
export async function getEpisodes() { return []; }
export async function saveEpisodes() { }
export function checkAdminPassword(p: string) { return p === "admin123"; } 
export function getAdminLockoutInfo() { return null; }
s