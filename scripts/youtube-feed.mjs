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
console.log(`Resolved YouTube channel: ${channelId}`);
let xml = '';
try { xml = await get(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`); }
catch { console.log('YouTube RSS unavailable; checking the channel videos tab.'); }
const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
let videos = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(([,entry]) => {
  const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
  const title = decode(entry.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'วิดีโอจากฝ่ายดนตรี');
  const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] || '';
  return { id, title, published, date: published.slice(0,10), url: `https://www.youtube.com/watch?v=${id}`, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
}).filter(v => v.id && Number.isFinite(Date.parse(v.published))).sort((a,b) => Date.parse(b.published)-Date.parse(a.published)).slice(0,3);
if (videos.length < 3) {
  const videosHtml = await get(`${channelUrl}/videos`);
  const dataText = videosHtml.match(/(?:var\s+)?ytInitialData\s*=\s*({.*?});<\/script>/s)?.[1];
  if (!dataText) throw new Error('Cannot read the YouTube videos tab');
  const data = JSON.parse(dataText);
  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const tab = tabs.map(t=>t.tabRenderer).find(t=>t?.selected) || tabs.map(t=>t.tabRenderer).find(t=>t?.content);
  const items = [];
  const visit = node => {
    if (!node || typeof node !== 'object') return;
    if (node.videoRenderer?.videoId) items.push(node.videoRenderer);
    if (node.lockupViewModel?.contentId && node.lockupViewModel.contentType === 'LOCKUP_CONTENT_TYPE_VIDEO') {
      const v = node.lockupViewModel;
      items.push({ videoId:v.contentId, title:{simpleText:v.metadata?.lockupMetadataViewModel?.title?.content} });
    }
    for (const v of Object.values(node)) if (v && typeof v === 'object') Array.isArray(v) ? v.forEach(visit) : visit(v);
  };
  visit(tab?.content);
  console.log(`YouTube videos tab: ${items.length} video entries`);
  if (!items.length) console.log('YouTube public tab structure:', JSON.stringify(tab?.content || data.contents).slice(0,9000));
  videos = [...new Map(items.map(v=>[v.videoId,v])).values()].slice(0,3).map(v=>({
    id:v.videoId,title:v.title?.runs?.map(r=>r.text).join('') || v.title?.simpleText || 'วิดีโอจากฝ่ายดนตรี',
    url:`https://www.youtube.com/watch?v=${v.videoId}`,poster:`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
  }));
}
if (videos.length !== 3) throw new Error('YouTube did not return three public videos');
await writeFile(new URL('../src/data/youtube-feed.json',import.meta.url),JSON.stringify({channelUrl,channelId,updatedAt:new Date().toISOString(),videos},null,2));
console.log(`YouTube refreshed: ${videos.length} latest videos from ${channelId}`);
