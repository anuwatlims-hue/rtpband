import { writeFile } from 'node:fs/promises';

const channelUrl = 'https://www.youtube.com/@' + encodeURIComponent('ฝ่ายดนตรีกองสวัสดิการ');
const get = async (url) => {
  const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error(`YouTube returned HTTP ${r.status}`);
  return r.text();
};
const html = await get(channelUrl);
const channelId = html.match(/"externalId":"(UC[\w-]{22})"/)?.[1]
  || html.match(/"channelId":"(UC[\w-]{22})"/)?.[1]
  || html.match(/channel_id=(UC[\w-]{22})/)?.[1];
if (!channelId) throw new Error('Cannot resolve the YouTube channel ID');
const xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
const videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([,entry]) => {
  const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
  const title = decode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'วิดีโอจากฝ่ายดนตรี');
  const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
  return { id, title, published, date: published.slice(0,10), url: `https://www.youtube.com/watch?v=${id}`, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}).filter(v => v.id && Number.isFinite(Date.parse(v.published))).sort((a,b) => Date.parse(b.published)-Date.parse(a.published)).slice(0,3);
if (videos.length !== 3) throw new Error('YouTube did not return three public videos');
await writeFile(new URL('../src/data/youtube-feed.json',import.meta.url),JSON.stringify({channelUrl,channelId,updatedAt:new Date().toISOString(),videos},null,2));
console.log(`YouTube refreshed: ${videos.length} latest videos from ${channelId}`);
