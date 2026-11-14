import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { content } from '../src/data/content';
import { mount, type App } from '../src/lib/app';
import { asset, esc, renderVideos } from '../src/lib/render';
import type { SiteContent } from '../src/types';

let root: HTMLElement;
let app: App | undefined;
const setup = (c: SiteContent = content) => {
  root = document.createElement('div');
  document.body.append(root);
  app = mount(root, c);
};
const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;

afterEach(() => {
  app?.destroy();
  app = undefined;
  root?.remove();
  vi.unstubAllGlobals();
});

describe('content', () => {
  it('has unique ids, valid dates and alt text', () => {
    for (const list of [content.works, content.activities, content.photos, content.videos]) {
      const ids = list.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
    for (const a of content.activities) expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const p of content.photos) expect(p.alt.length).toBeGreaterThan(0);
  });
});

describe('page', () => {
  beforeEach(() => setup({ ...content, latestFacebookVideo: undefined }));

  it('renders every section and item with lazy images', () => {
    for (const id of ['works', 'activities', 'gallery', 'videos', 'feed']) expect(q(`#${id}`)).toBeTruthy();
    expect(root.querySelectorAll('.work')).toHaveLength(content.works.length);
    expect(root.querySelectorAll('.activity')).toHaveLength(content.activities.length);
    expect(root.querySelectorAll('.thumb')).toHaveLength(content.photos.length);
    // Only the lightbox image is eager (it has no src until opened)
    expect(root.querySelectorAll('img:not([loading="lazy"])')).toHaveLength(1);
  });

  it('links video activities from the image and the call-to-action', () => {
    const withVideo = content.activities.filter((a) => a.videoUrl);
    expect(withVideo.length).toBeGreaterThanOrEqual(2);
    for (const a of withVideo) {
      const links = [...root.querySelectorAll<HTMLAnchorElement>(`a[href="${a.videoUrl}"]`)];
      expect(links.some((l) => l.classList.contains('gold-frame'))).toBe(true);
      expect(links.some((l) => l.classList.contains('more'))).toBe(true);
      links.forEach((l) => expect(l.rel).toContain('noopener'));
    }
  });

  it('lists activities newest first', () => {
    const dates = [...root.querySelectorAll('.activity time')].map((t) => t.getAttribute('datetime')!);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('toggles the mobile menu', () => {
    const toggle = q<HTMLButtonElement>('.menu-toggle');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(q('#menu').classList.contains('open')).toBe(true);
    q<HTMLAnchorElement>('#menu a').click();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('filters activities and photos', () => {
    q<HTMLButtonElement>('[data-target="activities"] [data-filter="concert"]').click();
    const shown = root.querySelectorAll<HTMLElement>('#activity-list .activity');
    expect(shown.length).toBe(content.activities.filter((a) => a.category === 'concert').length);
    shown.forEach((el) => expect(el.dataset.category).toBe('concert'));
    expect(q('[data-target="activities"] [data-filter="concert"]').getAttribute('aria-pressed')).toBe('true');

    q<HTMLButtonElement>('[data-target="gallery"] [data-filter="education"]').click();
    expect(root.querySelectorAll('#gallery-list .thumb')).toHaveLength(
      content.photos.filter((p) => p.category === 'education').length,
    );
  });

  it('opens, navigates and closes the lightbox', () => {
    const lb = q('#lightbox');
    const img = lb.querySelector('img')!;
    q<HTMLButtonElement>('#gallery-list .thumb').click();
    expect(lb.hidden).toBe(false);
    expect(document.body.classList.contains('no-scroll')).toBe(true);
    expect(img.getAttribute('src')).toBe(content.photos[0].src);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(img.getAttribute('src')).toBe(content.photos[1].src);
    q<HTMLButtonElement>('.lb-prev').click();
    q<HTMLButtonElement>('.lb-prev').click();
    expect(img.getAttribute('src')).toBe(content.photos.at(-1)!.src);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(lb.hidden).toBe(true);
    expect(document.body.classList.contains('no-scroll')).toBe(false);
  });

  it('loads the Facebook page plugin when IntersectionObserver is unavailable', () => {
    expect(q('#fb-feed iframe').getAttribute('src')).toContain('facebook.com/plugins/page.php');
  });

  it('keeps a direct news link visible and replaces the frame on retry', () => {
    const link = q<HTMLAnchorElement>('#fb-feed-help + .actions a');
    expect(link.href).toBe(content.facebookUrl);
    const frame = q('#fb-feed iframe');
    frame.dispatchEvent(new Event('load'));
    expect(q('#fb-feed-help').textContent).toContain('หากไม่เห็นโพสต์');
    q<HTMLButtonElement>('#fb-feed-retry').click();
    expect(root.querySelectorAll('#fb-feed iframe')).toHaveLength(1);
    expect(q('#fb-feed iframe')).not.toBe(frame);
  });
});

it('defers the feed until visible, avoids duplicates, and disconnects on destroy', () => {
  let notify: IntersectionObserverCallback;
  const observe = vi.fn();
  const disconnect = vi.fn();
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  setup({ ...content, latestFacebookVideo: undefined });
  expect(observe).toHaveBeenCalledWith(q('#fb-feed'));
  expect(root.querySelector('#fb-feed iframe')).toBeNull();
  const intersect = () => notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
  intersect();
  intersect();
  expect(root.querySelectorAll('#fb-feed iframe')).toHaveLength(1);
  expect(q('#fb-feed iframe').getAttribute('loading')).not.toBe('lazy');
  app!.destroy();
  app = undefined;
  expect(disconnect).toHaveBeenCalled();
});

describe('selected Facebook news video', () => {
  it('embeds the supplied clip directly without autoplay and keeps its source link', () => {
    setup();
    const video = content.latestFacebookVideo!;
    const frame = q<HTMLIFrameElement>('#fb-feed iframe');
    const src = new URL(frame.src);
    expect(src.pathname).toBe('/plugins/video.php');
    expect(src.searchParams.get('href')).toBe('https://www.facebook.com/reel/1613223503936214/');
    expect(src.searchParams.get('autoplay')).toBe('false');
    expect(frame.title).toBe(video.title);
    expect(frame.allowFullscreen).toBe(true);
    expect(q('#fb-feed h3').textContent).toBe(video.title);
    expect(q('#fb-feed time').getAttribute('datetime')).toBe(video.date);
    expect(q<HTMLAnchorElement>(`#fb-feed a[href="${video.url}"]`).textContent).toBe('ชมคลิปบน Facebook');
    expect(root.querySelector('#fb-feed iframe[src*="/plugins/page.php"]')).toBeNull();
    frame.dispatchEvent(new Event('error'));
    expect(q('#fb-feed-help').textContent).toContain('หากเล่นคลิปไม่ได้');
    q<HTMLButtonElement>('#fb-feed-retry').click();
    expect(root.querySelectorAll('#fb-feed iframe')).toHaveLength(1);
    expect(q<HTMLIFrameElement>('#fb-feed iframe').src).toBe(frame.src);
    expect(q('#fb-feed iframe')).not.toBe(frame);
  });
});

describe('videos', () => {
  const withVideos: SiteContent = {
    ...content,
    videos: [
      { id: 'yt', title: 'คอนเสิร์ต', url: 'https://youtu.be/dQw4w9WgXcQ', poster: '/media/concert.svg', date: '2026-10-21' },
      { id: 'fb', title: 'พาเหรด', url: 'https://www.facebook.com/ThaiPoliceBand/videos/123/', poster: '/media/parade.svg' },
      { id: 'mp4', title: 'ซ้อม', url: '/media/rehearsal.mp4', poster: '/media/orchestra.svg' },
    ],
  };

  it('shows a Facebook call-to-action when empty', () => {
    expect(renderVideos([], content.facebookUrl)).toContain('https://www.facebook.com/ThaiPoliceBand/videos/');
  });

  it('defers embeds until clicked', () => {
    setup(withVideos);
    expect(root.querySelectorAll('#video-list iframe')).toHaveLength(0);
    expect(q('#video-list video').getAttribute('preload')).toBe('none');
    const facades = root.querySelectorAll<HTMLButtonElement>('button[data-embed]');
    expect(facades).toHaveLength(2);
    facades[0].click();
    const iframe = q<HTMLIFrameElement>('#video-list iframe');
    expect(iframe.src).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(iframe.title).toBe('คอนเสิร์ต');
  });
});

it('escapes HTML in content', () => {
  expect(esc('<img onerror="x">&\'')).toBe('&#60;img onerror=&#34;x&#34;&#62;&#38;&#39;');
});

it('resolves media paths against the deploy base only for root-relative paths', () => {
  expect(asset('/media/a.svg')).toBe(`${import.meta.env.BASE_URL}media/a.svg`);
  expect(asset('https://cdn.example.com/a.jpg')).toBe('https://cdn.example.com/a.jpg');
  expect(asset('//cdn.example.com/a.jpg')).toBe('//cdn.example.com/a.jpg');
});
