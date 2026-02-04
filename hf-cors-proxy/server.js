const http = require('http');
const https = require('https');
const { URL } = require('url');

const PORT = process.env.PORT || 7860;

// Stats tracking
const stats = {
    requests: 0,
    success: 0,
    failed: 0,
    totalTime: 0,
    startTime: Date.now()
};

const victories = [
    "🏆 VICTORY!",
    "💪 CRUSHED IT!",
    "🔥 ON FIRE!",
    "⚡ LIGHTNING FAST!",
    "🚀 ZOOOOOM!",
    "👑 KING PROXY!",
    "🎯 BULLSEYE!",
];

const defeats = [
    "💀 RIP",
    "😵 WASTED",
    "🤢 CHOKED",
    "💔 BROKEN",
    "🌑 DARKNESS",
];

const log = (emoji, msg, ms = null) => {
    const time = new Date().toISOString().split('T')[1].slice(0, 8);
    const msStr = ms !== null ? ` (${ms}ms)` : '';
    console.log(`[${time}] ${emoji} ${msg}${msStr}`);
};

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check with stats
    if (req.url === '/' || req.url === '/health') {
        const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
        const avgTime = stats.success > 0 ? Math.round(stats.totalTime / stats.success) : 0;
        const winRate = stats.requests > 0 ? Math.round((stats.success / stats.requests) * 100) : 0;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: '🔥 DOMINATING',
            uptime: `${uptime}s`,
            requests: stats.requests,
            success: stats.success,
            failed: stats.failed,
            winRate: `${winRate}%`,
            avgTime: `${avgTime}ms`,
            usage: '/proxy?url=<encoded-url>'
        }, null, 2));
        return;
    }

    // Proxy endpoint
    if (req.url.startsWith('/proxy')) {
        const urlParams = new URL(req.url, `http://localhost:${PORT}`);
        const targetUrl = urlParams.searchParams.get('url');

        if (!targetUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
        }

        stats.requests++;
        const start = Date.now();
        const shortUrl = targetUrl.replace(/^https?:\/\//, '').slice(0, 40);

        try {
            const data = await fetchUrl(targetUrl);
            const ms = Date.now() - start;
            stats.success++;
            stats.totalTime += ms;

            const victory = victories[Math.floor(Math.random() * victories.length)];
            log(victory, shortUrl, ms);

            res.writeHead(200, {
                'Content-Type': 'application/xml; charset=utf-8',
                'X-Proxied-Url': targetUrl,
                'X-Fetch-Time': `${ms}ms`
            });
            res.end(data);
        } catch (err) {
            const ms = Date.now() - start;
            stats.failed++;

            const defeat = defeats[Math.floor(Math.random() * defeats.length)];
            log(defeat, `${shortUrl} - ${err.message}`, ms);

            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message, url: targetUrl }));
        }
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

function fetchUrl(url, redirects = 5) {
    return new Promise((resolve, reject) => {
        if (redirects <= 0) {
            reject(new Error('Too many redirects'));
            return;
        }

        const protocol = url.startsWith('https') ? https : http;
        let req;
        const timeout = setTimeout(() => {
            if (req) req.destroy();
            reject(new Error('Timeout'));
        }, 15000);

        req = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; RSSProxy/1.0)',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
        }, (res) => {
            clearTimeout(timeout);

            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                let redirectUrl = res.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    const base = new URL(url);
                    redirectUrl = new URL(redirectUrl, base).toString();
                }
                fetchUrl(redirectUrl, redirects - 1).then(resolve).catch(reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            res.on('error', reject);
        });

        req.on('error', (err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
}

server.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('  ╔════════════════════════════════════════╗');
    console.log('  ║  🔥 RSS CORS PROXY - CHAMPION EDITION  ║');
    console.log('  ║  96% WIN RATE - FEAR THE PROXY         ║');
    console.log('  ╚════════════════════════════════════════╝');
    console.log(`\n  🚀 Running on port ${PORT}`);
    console.log('  📡 Ready to dominate!\n');
});
