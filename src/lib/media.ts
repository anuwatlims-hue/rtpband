import type { Category } from '../types';

export type VideoSource =
  | { kind: 'youtube'; id: string; embedUrl: string }
  | { kind: 'facebook'; embedUrl: string }
  | { kind: 'file'; src: string; type: string }
  | { kind: 'unknown'; href: string };

const YT_ID = /^[\w-]{11}$/;

export function parseVideoUrl(raw: string): VideoSource {
  let url: URL;
  try {
    url = new URL(raw, 'https://local.invalid');
  } catch {
    return { kind: 'unknown', href: raw };
  }
  const host = url.hostname.replace(/^www\.|^m\./, '');
  const path = url.pathname;

  if (/\.(mp4|webm|ogg)$/i.test(path)) {
    const ext = path.split('.').pop()!.toLowerCase();
    return { kind: 'file', src: raw, type: `video/${ext}` };
  }

  let ytId: string | null = null;
  if (host === 'youtu.be') ytId = path.slice(1).split('/')[0];
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    ytId = url.searchParams.get('v') ?? path.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1] ?? null;
  }
  if (ytId && YT_ID.test(ytId)) {
    return {
      kind: 'youtube',
      id: ytId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`,
    };
  }

  if (host === 'facebook.com' || host === 'fb.watch') {
    const isVideo = host === 'fb.watch' || /\/(videos|reel|watch)\b/.test(path) || url.searchParams.has('v');
    if (isVideo) {
      const href = encodeURIComponent(raw);
      return {
        kind: 'facebook',
        embedUrl: `https://www.facebook.com/plugins/video.php?href=${href}&show_text=false&autoplay=true&allowfullscreen=true`,
      };
    }
  }
  return { kind: 'unknown', href: raw };
}

export const categoryLabels: Record<Category, string> = {
  ceremony: 'พิธีการ',
  concert: 'คอนเสิร์ต',
  community: 'กิจกรรมสังคม',
  education: 'การศึกษา',
};

export function filterByCategory<T extends { category: Category }>(items: T[], category: Category | 'all'): T[] {
  return category === 'all' ? items : items.filter((i) => i.category === category);
}

export function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date));
}

export function formatThaiDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function facebookPagePluginUrl(pageUrl: string, width: number): string {
  const params = new URLSearchParams({
    href: pageUrl,
    tabs: 'timeline',
    width: String(Math.round(Math.min(500, Math.max(180, width)))),
    height: '640',
    small_header: 'false',
    adapt_container_width: 'true',
    hide_cover: 'false',
    show_facepile: 'false',
  });
  return `https://www.facebook.com/plugins/page.php?${params}`;
}

/** A direct public video embed, without autoplay. */
export function facebookVideoPluginUrl(videoUrl: string, width: number): string {
  const params = new URLSearchParams({
    href: videoUrl,
    width: String(Math.round(Math.min(500, Math.max(180, width)))),
    show_text: 'false',
    autoplay: 'false',
  });
  return `https://www.facebook.com/plugins/video.php?${params}`;
}
