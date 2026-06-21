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

export function getAdsConfig(): AdsConfig {
  const data = localStorage.getItem(ADS_KEY);
  return data ? { ...DEFAULT_ADS_CONFIG, ...JSON.parse(data) } : { ...DEFAULT_ADS_CONFIG };
}

export function saveAdsConfig(config: AdsConfig): void {
  localStorage.setItem(ADS_KEY, JSON.stringify(config));
}

export const FIXED_LANGUAGES = ["Hindi", "English", "Tamil", "Japanese"] as const;
export type FixedLanguage = typeof FIXED_LANGUAGES[number];

export interface EmbedLang {
  lang: string;
  url?: string;
  url360?: string;
  url480?: string;
  url720?: string;
  url1080?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  season: number;
  episodeNumber: number;
  title: string;
  embedUrls: EmbedLang[];
}

const ANIME_KEY = "antoons_anime";
const EPISODES_KEY = "antoons_episodes";
const EPISODES_VERSION_KEY = "antoons_episodes_v2";

export function getAnime(): Anime[] {
  const data = localStorage.getItem(ANIME_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveAnime(list: Anime[]): void {
  localStorage.setItem(ANIME_KEY, JSON.stringify(list));
}

export function getEpisodes(): Episode[] {
  const data = localStorage.getItem(EPISODES_KEY);
  if (!data) return [];
  const parsed = JSON.parse(data);
  return parsed.map((ep: Episode & { embedUrl?: string }) => {
    if (!ep.embedUrls) {
      return {
        ...ep,
        embedUrls: ep.embedUrl ? [{ lang: "SUB", url: ep.embedUrl }] : [],
      };
    }
    return ep;
  });
}

export function saveEpisodes(list: Episode[]): void {
  localStorage.setItem(EPISODES_KEY, JSON.stringify(list));
}

export function seedDefaultData(): void {
  const hasAnime = localStorage.getItem(ANIME_KEY);
  const hasEpisodesV2 = localStorage.getItem(EPISODES_VERSION_KEY);

  if (!hasAnime || JSON.parse(hasAnime).length === 0) {
    const defaultAnime: Anime[] = [
      { id: "1", title: "Solo Leveling", posterUrl: "https://m.media-amazon.com/images/M/MV5BMzIzMjY1MmMtMmIwZS00NGU4LWJjYTItNmIwNWJiNmZkYjcxXkEyXkFqcGc@._V1_.jpg", bannerUrl: "https://i.ytimg.com/vi/j5x3BCdnFiQ/maxresdefault.jpg", description: "A weak hunter rises to become the world's strongest after receiving a mysterious power. Follow Sung Jin-Woo's incredible journey from the weakest E-rank hunter to a player beyond any ranking.", genres: ["Action", "Fantasy", "Adventure"], rating: 9.2, status: "Ongoing" },
      { id: "2", title: "Demon Slayer", posterUrl: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGc@._V1_.jpg", bannerUrl: "https://wallpaperaccess.com/full/1751290.jpg", description: "A young boy becomes a demon slayer after his family is slaughtered and his sister is turned into a demon. A breathtaking journey of brotherhood, willpower, and visual artistry.", genres: ["Action", "Drama", "Supernatural"], rating: 9.0, status: "Ongoing" },
      { id: "3", title: "Attack on Titan", posterUrl: "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OGQ4LWE3OGYtNDJiZTI2ZThhMzQ3XkEyXkFqcGc@._V1_.jpg", bannerUrl: "https://wallpaperaccess.com/full/1029672.jpg", description: "Humanity fights for survival against giant humanoid Titans behind enormous walls. A masterpiece of storytelling, strategy, and shocking revelations that will leave you breathless.", genres: ["Action", "Drama", "Mystery"], rating: 9.5, status: "Completed" },
      { id: "4", title: "Jujutsu Kaisen", posterUrl: "https://m.media-amazon.com/images/M/MV5BNjE5OWE2ZGItM2I3Yi00NDU3LTk3MDktZGVhZjYwMjg5OWI0XkEyXkFqcGc@._V1_.jpg", bannerUrl: "https://wallpaperaccess.com/full/3604070.jpg", description: "A boy swallows a cursed talisman and joins a secret organization of Jujutsu Sorcerers to kill the curses and hunt down the pieces of the talisman.", genres: ["Action", "Horror", "Supernatural"], rating: 8.8, status: "Ongoing" },
      { id: "5", title: "One Piece", posterUrl: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxODYxNmY3XkEyXkFqcGc@._V1_.jpg", bannerUrl: "https://wallpaperaccess.com/full/317501.jpg", description: "Monkey D. Luffy sails with his crew of pirates to find the ultimate treasure known as the One Piece and become the King of the Pirates.", genres: ["Adventure", "Comedy", "Fantasy"], rating: 9.1, status: "Ongoing" }
    ];
    saveAnime(defaultAnime);
  }

  if (!hasEpisodesV2) {
    const defaultEpisodes: Episode[] = [
      { id: "101", animeId: "1", season: 1, episodeNumber: 1, title: "The World's Weakest Hunter", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/example1-hi" }, { lang: "SUB", url: "https://streamwish.com/e/example1" }, { lang: "DUB", url: "https://streamwish.com/e/example1-dub" }] },
      { id: "102", animeId: "1", season: 1, episodeNumber: 2, title: "If I Had One More Chance", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/example2-hi" }, { lang: "SUB", url: "https://streamwish.com/e/example2" }, { lang: "DUB", url: "https://streamwish.com/e/example2-dub" }] },
      { id: "103", animeId: "1", season: 1, episodeNumber: 3, title: "It's Like a Game", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/example3-hi" }, { lang: "SUB", url: "https://streamwish.com/e/example3" }] },
      { id: "104", animeId: "1", season: 2, episodeNumber: 1, title: "Arise", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/example4-hi" }, { lang: "SUB", url: "https://streamwish.com/e/example4" }, { lang: "DUB", url: "https://streamwish.com/e/example4-dub" }] },
      { id: "105", animeId: "1", season: 2, episodeNumber: 2, title: "The Shadow Monarch", embedUrls: [{ lang: "SUB", url: "https://streamwish.com/e/example5" }, { lang: "DUB", url: "https://streamwish.com/e/example5-dub" }] },
      { id: "106", animeId: "2", season: 1, episodeNumber: 1, title: "Cruelty", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/ds1-hi" }, { lang: "SUB", url: "https://streamwish.com/e/ds1" }] },
      { id: "107", animeId: "2", season: 1, episodeNumber: 2, title: "Trainer Sakonji Urokodaki", embedUrls: [{ lang: "SUB", url: "https://streamwish.com/e/ds2" }, { lang: "DUB", url: "https://streamwish.com/e/ds2-dub" }] },
      { id: "108", animeId: "3", season: 1, episodeNumber: 1, title: "To You, in 2000 Years", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/aot1-hi" }, { lang: "SUB", url: "https://streamwish.com/e/aot1" }, { lang: "DUB", url: "https://streamwish.com/e/aot1-dub" }] },
      { id: "109", animeId: "3", season: 1, episodeNumber: 2, title: "That Day", embedUrls: [{ lang: "SUB", url: "https://streamwish.com/e/aot2" }, { lang: "DUB", url: "https://streamwish.com/e/aot2-dub" }] },
      { id: "110", animeId: "4", season: 1, episodeNumber: 1, title: "Ryomen Sukuna", embedUrls: [{ lang: "Hindi", url: "https://streamwish.com/e/jjk1-hi" }, { lang: "SUB", url: "https://streamwish.com/e/jjk1" }] },
      { id: "111", animeId: "5", season: 1, episodeNumber: 1, title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", embedUrls: [{ lang: "SUB", url: "https://streamwish.com/e/op1" }, { lang: "DUB", url: "https://streamwish.com/e/op1-dub" }] }
    ];
    saveEpisodes(defaultEpisodes);
    localStorage.setItem(EPISODES_VERSION_KEY, "1");
  }
}

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
  description: string;
  seoDescription?: string;
  genres: string[];
  rating: number;
  status: "Released" | "Upcoming";
  embedUrls: EmbedLang[];
}

const MOVIES_KEY = "antoons_movies";

export function getMovies(): Movie[] {
  const data = localStorage.getItem(MOVIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveMovies(list: Movie[]): void {
  localStorage.setItem(MOVIES_KEY, JSON.stringify(list));
}

const ADMIN_ATTEMPTS_KEY = "antoons_admin_attempts";
const ADMIN_LOCKOUT_KEY = "antoons_admin_lockout";
const ADMIN_PASSWORD = "admin123";

export function getAdminLockoutInfo(): { locked: boolean; unlockAt: number | null; attempts: number } {
  const lockoutRaw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
  const attemptsRaw = localStorage.getItem(ADMIN_ATTEMPTS_KEY);
  const attempts = attemptsRaw ? parseInt(attemptsRaw, 10) : 0;
  const unlockAt = lockoutRaw ? parseInt(lockoutRaw, 10) : null;
  const locked = unlockAt !== null && Date.now() < unlockAt;
  if (unlockAt !== null && !locked) {
    localStorage.removeItem(ADMIN_LOCKOUT_KEY);
    localStorage.removeItem(ADMIN_ATTEMPTS_KEY);
  }
  return { locked, unlockAt, attempts };
}

export function checkAdminPassword(password: string): { success: boolean; remainingAttempts: number; locked: boolean } {
  const { locked, attempts } = getAdminLockoutInfo();
  if (locked) return { success: false, remainingAttempts: 0, locked: true };

  if (password === ADMIN_PASSWORD) {
    localStorage.removeItem(ADMIN_ATTEMPTS_KEY);
    localStorage.removeItem(ADMIN_LOCKOUT_KEY);
    return { success: true, remainingAttempts: 3, locked: false };
  }

  const newAttempts = attempts + 1;
  localStorage.setItem(ADMIN_ATTEMPTS_KEY, newAttempts.toString());

  if (newAttempts >= 3) {
    const unlockAt = Date.now() + 60 * 60 * 1000;
    localStorage.setItem(ADMIN_LOCKOUT_KEY, unlockAt.toString());
    return { success: false, remainingAttempts: 0, locked: true };
  }

  return { success: false, remainingAttempts: 3 - newAttempts, locked: false };
}
