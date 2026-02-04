const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 7860;
const BEARER_TOKEN = process.env.X_BEARER_TOKEN;

if (!BEARER_TOKEN) {
    console.error('❌ X_BEARER_TOKEN environment variable not set!');
    process.exit(1);
}

const server = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check
    if (req.url === '/' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            usage: '/feed/<username>',
            example: '/feed/karpathy'
        }));
        return;
    }

    // Feed endpoint: /feed/username
    const match = req.url.match(/^\/feed\/([a-zA-Z0-9_]+)$/);
    if (match) {
        const username = match[1];
        console.log(`📡 Fetching tweets for @${username}`);

        try {
            const tweets = await fetchTweets(username);
            const rss = generateRSS(username, tweets);

            res.writeHead(200, {
                'Content-Type': 'application/rss+xml; charset=utf-8',
                'Cache-Control': 'max-age=300' // 5 min cache
            });
            res.end(rss);
            console.log(`✅ @${username}: ${tweets.length} tweets`);
        } catch (err) {
            console.error(`❌ @${username}: ${err.message}`);
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message, username }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use /feed/<username>' }));
});

async function fetchTweets(username) {
    // First get user ID
    const user = await xApiRequest(`/2/users/by/username/${username}?user.fields=profile_image_url,description`);
    if (!user.data) throw new Error(`User @${username} not found`);

    const userId = user.data.id;
    const userInfo = user.data;

    // Then get tweets
    const tweets = await xApiRequest(
        `/2/users/${userId}/tweets?max_results=20&tweet.fields=created_at,text,public_metrics&expansions=attachments.media_keys&media.fields=url,preview_image_url`
    );

    if (!tweets.data) return [];

    return tweets.data.map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        url: `https://x.com/${username}/status/${tweet.id}`,
        metrics: tweet.public_metrics,
        userInfo
    }));
}

function xApiRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.x.com',
            path: endpoint,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BEARER_TOKEN}`,
                'User-Agent': 'X-RSS-Feed/1.0'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`X API ${res.statusCode}: ${data}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Invalid JSON from X API'));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('X API timeout'));
        });
        req.end();
    });
}

function generateRSS(username, tweets) {
    const userInfo = tweets[0]?.userInfo || {};
    const escaped = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const items = tweets.map(tweet => `
    <item>
      <title>${escaped(tweet.text.slice(0, 100))}${tweet.text.length > 100 ? '...' : ''}</title>
      <link>${tweet.url}</link>
      <guid>${tweet.url}</guid>
      <pubDate>${new Date(tweet.created_at).toUTCString()}</pubDate>
      <description><![CDATA[${tweet.text}${tweet.metrics ? `<br/><br/>❤️ ${tweet.metrics.like_count} 🔁 ${tweet.metrics.retweet_count} 💬 ${tweet.metrics.reply_count}` : ''}]]></description>
    </item>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>@${username} on X</title>
    <link>https://x.com/${username}</link>
    <description>${escaped(userInfo.description || `Tweets from @${username}`)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ╔════════════════════════════════════════╗');
    console.log('  ║  🐦 X → RSS Feed Generator             ║');
    console.log('  ╚════════════════════════════════════════╝');
    console.log(`\n  🚀 Running on port ${PORT}`);
    console.log('  📡 Usage: /feed/<username>\n');
});
