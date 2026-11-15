import { writeFile } from 'node:fs/promises';

const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
if (!token) throw new Error('FACEBOOK_PAGE_ACCESS_TOKEN is missing in GitHub Secrets');
const url = new URL('https://graph.facebook.com/v27.0/93857536197/posts');
url.searchParams.set('fields', 'id,message,created_time,permalink_url,full_picture');
url.searchParams.set('limit', '8');
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
const posts = result.data.filter(p => typeof p.permalink_url === 'string' && /^https:\/\/(www\.)?facebook\.com\//.test(p.permalink_url)).map(p => ({
  id: String(p.id), message: String(p.message || 'ข่าวจากฝ่ายดนตรี'), date: String(p.created_time).slice(0, 10),
  url: p.permalink_url, image: typeof p.full_picture === 'string' && p.full_picture.startsWith('https://') ? p.full_picture : null,
}));
if (!posts.length) throw new Error('Facebook returned no valid public post links');
await writeFile(new URL('../src/data/facebook-feed.json', import.meta.url), JSON.stringify({ updatedAt: new Date().toISOString(), posts }, null, 2));
console.log(`Facebook feed refreshed: ${posts.length} posts. No credentials are included in the generated file.`);
