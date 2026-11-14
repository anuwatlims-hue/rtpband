import type { Activity, Category, Photo, SiteContent, Video, Work } from '../types';
import { categoryLabels, formatThaiDate, parseVideoUrl, sortByDateDesc } from './media';

export function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Resolve root-relative media paths against the deploy base (e.g. /rtpband/ on GitHub Pages). */
export function asset(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? import.meta.env.BASE_URL + path.slice(1) : path;
}

const corners = '<i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>';

function img(src: string, alt: string): string {
  return `<img src="${esc(asset(src))}" alt="${esc(alt)}" loading="lazy" decoding="async" width="800" height="600">`;
}

function heading(text: string, light = false): string {
  return `<div class="heading${light ? ' light' : ''}"><h2 class="ribbon"><span class="clef" aria-hidden="true">♪</span>${esc(text)}</h2></div>`;
}

export function renderWorks(works: Work[]): string {
  return works
    .map(
      (w) => `<article class="card work">
  <div class="gold-frame">${img(w.image, w.title)}${corners}</div>
  <div class="card-body"><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p></div>
</article>`,
    )
    .join('');
}

export function renderActivities(items: Activity[]): string {
  return sortByDateDesc(items)
    .map(
      (a) => `<article class="card activity" data-category="${a.category}">
  ${
    a.videoUrl
      ? `<a class="gold-frame has-video" href="${esc(a.videoUrl)}" target="_blank" rel="noopener" aria-label="ดูวิดีโอบน YouTube: ${esc(a.title)}">${img(a.image, '')}<span class="play mini" aria-hidden="true"></span>${corners}</a>`
      : `<div class="gold-frame">${img(a.image, '')}${corners}</div>`
  }
  <div class="card-body">
    <p class="meta"><span class="badge">${categoryLabels[a.category]}</span><time datetime="${esc(a.date)}">${formatThaiDate(a.date)}</time></p>
    <h3>${esc(a.title)}</h3>
    <p class="loc">📍 ${esc(a.location)}</p>
    <p>${esc(a.summary)}</p>
    ${a.videoUrl ? `<a class="more" href="${esc(a.videoUrl)}" target="_blank" rel="noopener">ดูวิดีโอบน YouTube →</a>` : ''}
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
      (p, i) => `<li><button type="button" class="thumb gold-frame" data-index="${i}" aria-label="ดูภาพ: ${esc(p.caption)}">
  ${img(p.src, p.alt)}${corners}
</button></li>`,
    )
    .join('');
}

export function renderVideos(videos: Video[], facebookUrl: string): string {
  if (videos.length === 0) {
    return `<div class="empty gold-frame">${corners}
  <p>ชมวิดีโอการแสดงทั้งหมดได้ที่เพจ Facebook ของดุริยางค์ตำรวจ</p>
  <a class="btn" href="${esc(facebookUrl)}videos/" target="_blank" rel="noopener">▶ ดูวิดีโอบน Facebook</a>
</div>`;
  }
  return `<ul class="video-grid">${videos
    .map((v) => {
      const src = parseVideoUrl(v.url);
      const poster = esc(asset(v.poster));
      const date = v.date ? `<time datetime="${esc(v.date)}">${formatThaiDate(v.date)}</time>` : '';
      const title = `<h3>${esc(v.title)}</h3>${date}`;
      if (src.kind === 'file') {
        return `<li class="video"><div class="frame gold-frame"><video controls preload="none" playsinline poster="${poster}"><source src="${esc(asset(src.src))}" type="${src.type}"></video></div>${title}</li>`;
      }
      if (src.kind === 'unknown') {
        return `<li class="video"><a class="frame facade gold-frame" href="${esc(src.href)}" target="_blank" rel="noopener"><img src="${poster}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span>${corners}</a>${title}</li>`;
      }
      // Click-to-load facade: third-party players are only fetched on demand to keep initial load fast.
      return `<li class="video"><button type="button" class="frame facade gold-frame" data-embed="${esc(src.embedUrl)}" data-title="${esc(v.title)}" aria-label="เล่นวิดีโอ: ${esc(v.title)}"><img src="${poster}" alt="" loading="lazy"><span class="play" aria-hidden="true"></span>${corners}</button>${title}</li>`;
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
      <p class="division">${esc(c.division)}<small>${esc(c.divisionEn)}</small></p>
      <h1 class="gold-text">${esc(c.name)}</h1>
      <p class="eyebrow"><span>${esc(c.nameEn)}</span></p>
      <p class="tagline">${esc(c.tagline)}</p>
      <div class="actions"><a class="btn" href="#activities">ชมกิจกรรม</a><a class="btn ghost" href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">ติดตามบน Facebook</a></div>
    </div>
  </section>
  <section id="about" class="section container about">${c.about.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
  <section id="works" class="section container">
    ${heading('ผลงานและวงดนตรี')}
    <div class="grid">${renderWorks(c.works)}</div>
  </section>
  <section id="activities" class="section alt"><div class="container">
    ${heading('กิจกรรม', true)}
    <div class="filters" data-target="activities" role="group" aria-label="กรองกิจกรรม">${renderFilters(categories, 'all')}</div>
    <div class="grid" id="activity-list">${renderActivities(c.activities)}</div>
  </div></section>
  <section id="gallery" class="section container">
    ${heading('ภาพนิ่ง')}
    <div class="filters" data-target="gallery" role="group" aria-label="กรองภาพ">${renderFilters(photoCategories, 'all')}</div>
    <ul class="gallery" id="gallery-list">${renderGallery(c.photos)}</ul>
  </section>
  <section id="videos" class="section alt"><div class="container">
    ${heading('วิดีโอ', true)}
    <div id="video-list">${renderVideos(c.videos, c.facebookUrl)}</div>
  </div></section>
  <section id="feed" class="section container">
    ${heading('ข่าวล่าสุดจาก Facebook')}
    <div class="fb-feed${c.latestFacebookVideo ? ' fb-feed-video' : ''}" id="fb-feed">
      ${c.latestFacebookVideo ? `<div class="fb-video-caption"><h3>${esc(c.latestFacebookVideo.title)}</h3><time datetime="${esc(c.latestFacebookVideo.date)}">${formatThaiDate(c.latestFacebookVideo.date)}</time></div>` : ''}
      <div class="fb-feed-frame" id="fb-feed-frame"></div>
      <div class="fb-feed-help">
        <p id="fb-feed-help">${c.latestFacebookVideo ? 'หากเล่นคลิปไม่ได้ สามารถเปิดชมบน Facebook ได้โดยตรง' : 'หากไม่เห็นโพสต์หรือเห็นเฉพาะชื่อเพจ Facebook อาจจำกัดการแสดงข่าวบนเว็บไซต์นี้ สามารถเปิดอ่านข่าวล่าสุดบนเพจได้โดยตรง'}</p>
        <div class="actions">
          ${c.latestFacebookVideo ? `<a class="btn" href="${esc(c.latestFacebookVideo.url)}" target="_blank" rel="noopener">ชมคลิปบน Facebook</a>` : ''}
          <a class="btn" href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">อ่านข่าวล่าสุดบน Facebook</a>
          <button class="btn" type="button" id="fb-feed-retry">${c.latestFacebookVideo ? 'โหลดคลิปอีกครั้ง' : 'โหลดฟีดอีกครั้ง'}</button>
        </div>
      </div>
    </div>
  </section>
</main>
<footer class="site-footer"><div class="container">
  <div class="footer-mark">
    <p class="en">POLICE MUSIC DIVISION<small>ROYAL THAI POLICE</small></p>
    <p class="motto">“${esc(c.motto)}”<small>${esc(c.mottoEn)}</small></p>
  </div>
  <div class="footer-info">
    <p>${esc(c.address)}</p>
    <p>โทร ${esc(c.phone)} · <a href="${esc(c.facebookUrl)}" target="_blank" rel="noopener">Facebook</a>${
      c.website ? ` · <a href="${esc(c.website)}" target="_blank" rel="noopener">เว็บไซต์</a>` : ''
    }</p>
  </div>
</div></footer>
<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="ภาพขยาย" hidden>
  <button type="button" class="lb-close" aria-label="ปิด">×</button>
  <button type="button" class="lb-prev" aria-label="ภาพก่อนหน้า">‹</button>
  <figure><img alt=""><figcaption></figcaption></figure>
  <button type="button" class="lb-next" aria-label="ภาพถัดไป">›</button>
</div>`;
}
