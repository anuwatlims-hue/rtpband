export type Category = 'ceremony' | 'concert' | 'community' | 'education';

export interface Work {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface Activity {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  location: string;
  category: Category;
  summary: string;
  image: string;
  /** Link to the original Facebook post or news source */
  sourceUrl?: string;
}

export interface Photo {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: Category;
}

export interface Video {
  id: string;
  title: string;
  /** YouTube, Facebook video URL, or a direct .mp4/.webm file */
  url: string;
  poster: string;
  date?: string;
}

export interface SiteContent {
  name: string;
  nameEn: string;
  tagline: string;
  about: string[];
  facebookUrl: string;
  website?: string;
  address: string;
  phone: string;
  works: Work[];
  activities: Activity[];
  photos: Photo[];
  videos: Video[];
}
