import { writeFile } from 'node:fs/promises';

const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
if (!token) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is missing in GitHub Secrets');
const url = new URL('https://graph.facebook.com/v27.0/93857536197/posts');
url.searchParams.set('fields', 'id,message,created_time,permalink_url,full_picture,attachments{media_type,type,target,url}');
url.searchParams.set('limit', '50');
let response;
try {
  response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
} catch {
  throw new Error('Facebook connection failed; keeping the currently deployed website');
}
const result = await response.json();
if (!response.ok || result.error) {
  // Never log the response body, token, or request headers.
  throw new Error(`Facebook API rejected access (code ${Number(result.error?.code) || response.status}, subcode ${Number(result.error?.error_subcode) || 0}). Check Page Token permissions and expiration.`);
}
if (!Array.isArray(result.data) || !result.data.length) throw new Error('Facebook returned no posts; keeping the currently deployed website');
const posts = result.data.filter(p => typeof p.permalink_url === 'string' && /^https:\/\/(www\.)?facebook\.com\//.test(p.permalink_url) && Number.isFinite(Date.parse(p.created_time)))
  .sort((a, b) => Date.parse(b.created_time) - Date.parse(a.created_time))
  .slice(0, 9).map(p => ({
  id: String(p.id), message: String(p.message || 'ข่าวจากฝ่ายดนตรี'), date: String(p.created_time).slice(0, 10),
  url: p.permalink_url, image: typeof p.full_picture === 'string' && p.full_picture.startsWith('https://') ? p.full_picture : null,
}));
if (!posts.length) throw new Error('Facebook returned no valid public post links');
const candidates = result.data.filter(p => p.attachments?.data?.some(a => a.media_type === 'video' || String(a.type).includes('video'))).map(p => {
  const attachment = p.attachments.data.find(a => a.media_type === 'video' || String(a.type).includes('video'));
  return { title: String(p.message || 'วิดีโอล่าสุดจากฝ่ายดนตรี').split('\n')[0], date: String(p.created_time).slice(0, 10), createdTime: p.created_time,
    url: attachment.target?.id ? `https://www.facebook.com/watch/?v=${attachment.target.id}` : p.permalink_url,
    poster: p.full_picture || null };
});
try {
  const videosUrl = new URL('https://graph.facebook.com/v27.0/93857536197/videos');
  videosUrl.searchParams.set('fields', 'id,title,description,created_time,picture');
  videosUrl.searchParams.set('limit', '1');
  const videosResponse = await fetch(videosUrl, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30000) });
  const videos = await videosResponse.json();
  if (videosResponse.ok && !videos.error) for (const v of videos.data || []) candidates.push({
    title: String(v.title || v.description || 'วิดีโอล่าสุดจากฝ่ายดนตรี').split('\n')[0], date: String(v.created_time).slice(0, 10), createdTime: v.created_time,
    url: `https://www.facebook.com/watch/?v=${v.id}`, poster: v.picture || null,
  });
} catch { console.log('Video endpoint unavailable; checking video posts instead.'); }
const latestVideo = candidates.sort((a, b) => String(b.createdTime).localeCompare(String(a.createdTime)))[0] || null;
await writeFile(new URL('../src/data/facebook-feed.json', import.meta.url), JSON.stringify({ updatedAt: new Date().toISOString(), posts, latestVideo }, null, 2));
console.log(`Latest video: ${latestVideo ? 'found' : 'not available'}`);
console.log(`Facebook feed refreshed: ${posts.length} posts. No credentials are included in the generated file.`);
