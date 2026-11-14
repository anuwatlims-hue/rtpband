import { describe, expect, it } from 'vitest';
import { facebookPagePluginUrl, filterByCategory, formatThaiDate, parseVideoUrl, sortByDateDesc } from '../src/lib/media';

describe('parseVideoUrl', () => {
  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://m.youtube.com/embed/dQw4w9WgXcQ',
  ])('detects YouTube %s', (url) => {
    const r = parseVideoUrl(url);
    expect(r.kind).toBe('youtube');
    if (r.kind === 'youtube') {
      expect(r.id).toBe('dQw4w9WgXcQ');
      expect(r.embedUrl).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
    }
  });

  it.each([
    'https://www.facebook.com/ThaiPoliceBand/videos/1234567890/',
    'https://www.facebook.com/watch/?v=1234567890',
    'https://www.facebook.com/reel/1234567890',
    'https://fb.watch/abcDEF/',
  ])('detects Facebook video %s', (url) => {
    const r = parseVideoUrl(url);
    expect(r.kind).toBe('facebook');
    if (r.kind === 'facebook') expect(r.embedUrl).toContain(`href=${encodeURIComponent(url)}`);
  });

  it('detects direct files', () => {
    expect(parseVideoUrl('/media/show.MP4')).toEqual({ kind: 'file', src: '/media/show.MP4', type: 'video/mp4' });
    expect(parseVideoUrl('https://cdn.example.com/a.webm')).toMatchObject({ kind: 'file', type: 'video/webm' });
  });

  it('falls back to unknown for non-video links', () => {
    expect(parseVideoUrl('https://www.facebook.com/ThaiPoliceBand/')).toEqual({
      kind: 'unknown',
      href: 'https://www.facebook.com/ThaiPoliceBand/',
    });
    expect(parseVideoUrl('https://youtube.com/watch?v=bad').kind).toBe('unknown');
  });
});

describe('helpers', () => {
  const items = [
    { category: 'concert' as const, date: '2020-01-01' },
    { category: 'ceremony' as const, date: '2024-05-01' },
  ];
  it('filters by category', () => {
    expect(filterByCategory(items, 'all')).toHaveLength(2);
    expect(filterByCategory(items, 'concert')).toEqual([items[0]]);
  });
  it('sorts newest first without mutating', () => {
    expect(sortByDateDesc(items).map((i) => i.date)).toEqual(['2024-05-01', '2020-01-01']);
    expect(items[0].date).toBe('2020-01-01');
  });
  it('formats Thai Buddhist-era dates', () => {
    expect(formatThaiDate('2026-10-21')).toBe('21 ตุลาคม 2569');
    expect(formatThaiDate('not-a-date')).toBe('not-a-date');
  });
  it('builds a clamped page plugin URL', () => {
    const u = new URL(facebookPagePluginUrl('https://www.facebook.com/ThaiPoliceBand/', 1200));
    expect(u.searchParams.get('href')).toBe('https://www.facebook.com/ThaiPoliceBand/');
    expect(u.searchParams.get('width')).toBe('500');
    expect(u.searchParams.get('tabs')).toBe('timeline');
  });
});
