import type { Activity, Category, Photo, SiteContent, Video, Work } from '../types';
import { categoryLabels, formatThaiDate, parseVideoUrl, sortByDateDesc } from './media';

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function renderWorks(works: Work[]): string {
  return works
    .map(
      (w) => `<article class="card work">
  <img src="${esc(w.image)}" alt="${esc(w.title)}" loading="lazy" decoding="async" width="800" height="600">
  <div class="card-body"><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p></div>
</article>`,
    )
    .join('');
}

export function renderActivities(items: Activity[]): string {
  return sortByDateDesc(items)
    .map(
      (a) => `<article class="card activity" data-category="${a.category}">
  <img src="${esc(a.image)}" alt="" loading="lazy" decoding="async" width="800" height="600">
  <div class="card-body">
    <p class="meta"><span class="badge">${categoryLabels[a.category]}</span><time datetime="${esc(a.date)}">${formatThaiDate(a.date)}</time></p>
    <h3>${esc(a.title)}</h3>
    <p class="loc">📍 ${esc(a.location)}</p>
    <p>${esc(a.summary)}</p>
    ${a.sourceUrl ? `<a class="more" href="${esc(a.sourceUrl)}" target="_blank" rel="noopener">ดูรายละเอียด →</a>` : ''}
  </div>
</article>`,
    )
    .join('');
}

export function renderFilters(categories: Category[], active: Category | 'all'): string {
  const all: (Category | 'all')[] = ['all', ...categories];
  return all
    .map(
      (c) =>
        `<button type="button" class="chip" data-filter="${c}" aria-pressed="${c === active}">${
          c === 'all' ? 'ทั้งหมด' : categoryLabels[c]
        }</button>`,
    )
    .join('');
}

export function renderGallery(photos: Photo[]): string {
  return photos
    .map(
      (p, i) => `<li><button type="button" class="thumb" data-index="${i}" aria-label="ดูภาพ: ${esc(p.caption)}">
  <img src="${esc(p.src)}" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="800" height="600">
</button></li>`,
    )
    .join('');
}

export function renderVideos(videos: Video[], facebookUrl: string): string {
  if (videos.length === 0) {
    return `<div class="empty">
  <p>ชมวิดีโอการแสดงทั้งหมดได้ที่เพจ Facebook ของดุริยางค์ตำรวจ</p>
  <a class="btn" href="${esc(facebookUrl)}videos/" target="_blank" rel="noopener">▶ ดูวิดีโอบน Facebook</a>
</div>`;
  }
  return `<ul class="video-grid">${videos
    .map((v) => {
      const src = parseVideoUrl(v.url);
      const date = v.date ? `<time datetime="${esc(v.date)}">${formatThaiDate(v.date)}</time>` : '';
      if (src.kind === 'file') {
        return `<li class="video"><div class="frame"><video controls preload="none" playsinline poster="${esc(v.poster)}"><source src="${esc(src.src)}" type="${src.type}"></video></div><h3>${esc(v.title)}</h3>${date}</li>`;
      }
      if (src.kind === 'unknown') {
        return `<li class="video"><a class="frame facade" href="${esc(src.href)}" target="_blank" rel="noopener"><img src="${esc(v.poster)}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span></a><h3>${esc(v.title)}</h3>${date}</li>`;
      }
      // Click-to-load facade: third-party players are only fetched on demand to keep initial load fast.
      return `<li class="video"><button type="button" class="frame facade" data-embed="${esc(src.embedUrl)}" data-title="${esc(v.title)}" aria-label="เล่นวิดีโอ: ${esc(v.title)}"><img src="${esc(v.poster)}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span></button><h3>${esc(v.title)}</h3>${date}</li>`;
    })
    .join('')}</ul>`;
}

export function renderPage(c: SiteContent): string {
  const categories = [...new Set(c.activities.map((a) => a.category))];
  const photoCategories = [...new Set(c.photos.map((p) => p.category))];
  return `
<a class="skip" href="#main">ข้ามไปยังเนื้อหา</a>
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="#top"><span class="logo" aria-hidden="true">♫</span><span>${esc(c.name)}<small>${esc(c.nameEn)}</small></span></a>
    <button type="button" class="menu-toggle" aria-expanded="false" aria-controls="menu" aria-label="เมนู"><span></span></button>
    <nav id="menu" class="menu">
      <a href="#works">ผลงาน</a><a href="#activities">กิจกรรม</a><a href="#gallery">ภาพนิ่ง</a><a href="#videos">วิดีโอ</a><a href="#feed">ข่าวล่าสุด</a>
    </nav>
  </div>
</header>
<main id="main">
  <section id="top" class="hero">
    <div class="container">
      <p class="eyebrow">${esc(c.nameEn)}</p>
      <h1>${esc(c.name)}</h1>
      <p class="tagline">${esc(c.tagline)}</p>
      <div class="actions"><a class="btn" href="#activities">ชมกิจกรรม</a><a class="btn ghost" href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">ติดตามบน Facebook</a></div>
    </div>
  </section>
  <section id="about" class="section container about">${c.about.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
  <section id="works" class="section container">
    <h2>ผลงานและวงดนตรี</h2>
    <div class="grid">${renderWorks(c.works)}</div>
  </section>
  <section id="activities" class="section alt"><div class="container">
    <h2>กิจกรรม</h2>
    <div class="filters" data-target="activities" role="group" aria-label="กรองกิจกรรม">${renderFilters(categories, 'all')}</div>
    <div class="grid" id="activity-list">${renderActivities(c.activities)}</div>
  </div></section>
  <section id="gallery" class="section container">
    <h2>ภาพนิ่ง</h2>
    <div class="filters" data-target="gallery" role="group" aria-label="กรองภาพ">${renderFilters(photoCategories, 'all')}</div>
    <ul class="gallery" id="gallery-list">${renderGallery(c.photos)}</ul>
  </section>
  <section id="videos" class="section alt"><div class="container">
    <h2>วิดีโอ</h2>
    <div id="video-list">${renderVideos(c.videos, c.facebookUrl)}</div>
  </div></section>
  <section id="feed" class="section container">
    <h2>ข่าวล่าสุดจาก Facebook</h2>
    <div class="fb-feed" id="fb-feed"><a class="btn" href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">เปิดเพจ Facebook</a></div>
  </section>
</main>
<footer class="site-footer"><div class="container">
  <p><strong>${esc(c.name)}</strong> · ${esc(c.nameEn)}</p>
  <p>${esc(c.address)}</p>
  <p>โทร ${esc(c.phone)} · <a href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">Facebook</a>${
    c.website ? ` · <a href="${esc(c.website)}" target="_blank" rel="noopener">เว็บไซต์</a>` : ''
  }</p>
</div></footer>
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="ภาพขยาย" hidden>
  <button type="button" class="lb-close" aria-label="ปิด">×</button>
  <button type="button" class="lb-prev" aria-label="ภาพก่อนหน้า">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button type="button" class="lb-next" aria-label="ภาพถัดไป">›</button>
</div>`;
}
