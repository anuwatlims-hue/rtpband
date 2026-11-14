import type { Category, SiteContent } from '../types';
import { facebookPagePluginUrl, filterByCategory } from './media';
import { asset, renderActivities, renderGallery, renderPage } from './render';

export interface App {
  openLightbox(index: number): void;
  closeLightbox(): void;
  step(delta: number): void;
  destroy(): void;
}

export function mount(root: HTMLElement, content: SiteContent): App {
  root.innerHTML = renderPage(content);
  const $ = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const cleanups: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(el: EventTarget, type: K | string, fn: (e: any) => void) => {
    el.addEventListener(type, fn);
    cleanups.push(() => el.removeEventListener(type, fn));
  };

  // Mobile menu
  const toggle = $<HTMLButtonElement>('.menu-toggle');
  const menu = $<HTMLElement>('#menu');
  on(toggle, 'click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
  });
  on(menu, 'click', (e: MouseEvent) => {
    if ((e.target as Element).closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    }
  });

  // Filters
  let photos = content.photos;
  root.querySelectorAll<HTMLElement>('.filters').forEach((group) => {
    on(group, 'click', (e: MouseEvent) => {
      const btn = (e.target as Element).closest<HTMLButtonElement>('[data-filter]');
      if (!btn) return;
      const cat = btn.dataset.filter as Category | 'all';
      group.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (group.dataset.target === 'activities') {
        $('#activity-list').innerHTML = renderActivities(filterByCategory(content.activities, cat));
      } else {
        photos = filterByCategory(content.photos, cat);
        $('#gallery-list').innerHTML = renderGallery(photos);
      }
    });
  });

  // Lightbox
  const lb = $<HTMLElement>('#lightbox');
  const lbImg = lb.querySelector('img')!;
  const lbCap = lb.querySelector('figcaption')!;
  let current = -1;
  let lastFocus: HTMLElement | null = null;
  const show = (i: number) => {
    current = (i + photos.length) % photos.length;
    const p = photos[current];
    lbImg.src = asset(p.src);
    lbImg.alt = p.alt;
    lbCap.textContent = `${p.caption} (${current + 1}/${photos.length})`;
  };
  const app: App = {
    openLightbox(i) {
      if (!photos.length) return;
      lastFocus = document.activeElement as HTMLElement | null;
      show(i);
      lb.hidden = false;
      document.body.classList.add('no-scroll');
      lb.querySelector<HTMLButtonElement>('.lb-close')!.focus();
    },
    closeLightbox() {
      if (lb.hidden) return;
      lb.hidden = true;
      current = -1;
      document.body.classList.remove('no-scroll');
      lastFocus?.focus();
    },
    step(d) {
      if (!lb.hidden) show(current + d);
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      observer?.disconnect();
      root.innerHTML = '';
    },
  };
  on($('#gallery-list'), 'click', (e: MouseEvent) => {
    const t = (e.target as Element).closest<HTMLElement>('[data-index]');
    if (t) app.openLightbox(Number(t.dataset.index));
  });
  on(lb, 'click', (e: MouseEvent) => {
    const t = e.target as Element;
    if (t.closest('.lb-close') || t === lb) app.closeLightbox();
    else if (t.closest('.lb-prev')) app.step(-1);
    else if (t.closest('.lb-next')) app.step(1);
  });
  on(document, 'keydown', (e: KeyboardEvent) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') app.closeLightbox();
    else if (e.key === 'ArrowLeft') app.step(-1);
    else if (e.key === 'ArrowRight') app.step(1);
  });
  let touchX = 0;
  on(lb, 'touchstart', (e: TouchEvent) => (touchX = e.touches[0].clientX));
  on(lb, 'touchend', (e: TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) app.step(dx < 0 ? 1 : -1);
  });

  // Video facades -> iframe on demand
  on($('#video-list'), 'click', (e: MouseEvent) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('button[data-embed]');
    if (!btn) return;
    const iframe = document.createElement('iframe');
    iframe.src = btn.dataset.embed!;
    iframe.title = btn.dataset.title ?? 'วิดีโอ';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.className = 'frame';
    btn.replaceWith(iframe);
  });

  // Facebook Page Plugin, loaded only when the section nears the viewport
  const feed = $<HTMLElement>('#fb-feed');
  const loadFeed = () => {
    if (feed.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.src = facebookPagePluginUrl(content.facebookUrl, feed.clientWidth || 500);
    iframe.title = `Facebook: ${content.name}`;
    iframe.loading = 'lazy';
    iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
    feed.prepend(iframe);
  };
  let observer: IntersectionObserver | undefined;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          loadFeed();
          observer?.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(feed);
  } else {
    loadFeed();
  }

  return app;
}
