const https = require('https');
const http = require('http');

const FEEDS = [
    // Tech / Startups
    { name: "TechMeme", url: "https://www.techmeme.com/feed.xml", category: "Tech News" },
    { name: "The Register", url: "https://www.theregister.com/headlines.atom", category: "Tech News" },
    { name: "Hacker Noon", url: "https://hackernoon.com/feed", category: "Tech News" },
    { name: "Product Hunt", url: "https://www.producthunt.com/feed", category: "Tech News" },
    { name: "InfoQ", url: "https://feed.infoq.com/", category: "Tech News" },

    // AI / ML
    { name: "MIT AI News", url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", category: "AI & ML" },
    { name: "Distill.pub", url: "https://distill.pub/rss.xml", category: "AI & ML" },
    { name: "The Gradient", url: "https://thegradient.pub/rss/", category: "AI & ML" },
    { name: "AI Weirdness", url: "https://www.aiweirdness.com/rss/", category: "AI & ML" },
    { name: "Weights & Biases", url: "https://wandb.ai/fully-connected/rss.xml", category: "AI & ML" },

    // Programming blogs
    { name: "The Go Blog", url: "https://go.dev/blog/feed.atom", category: "Programming" },
    { name: "Rust Blog", url: "https://blog.rust-lang.org/feed.xml", category: "Programming" },
    { name: "Python Insider", url: "https://blog.python.org/feeds/posts/default", category: "Programming" },
    { name: "Netflix Tech Blog", url: "https://netflixtechblog.com/feed", category: "Programming" },
    { name: "Uber Engineering", url: "https://eng.uber.com/feed/", category: "Programming" },
    { name: "Dropbox Tech", url: "https://dropbox.tech/feed", category: "Programming" },
    { name: "GitHub Blog", url: "https://github.blog/feed/", category: "Programming" },
    { name: "Slack Engineering", url: "https://slack.engineering/feed/", category: "Programming" },
    { name: "Stripe Blog", url: "https://stripe.com/blog/feed.rss", category: "Programming" },
    { name: "Discord Blog", url: "https://discord.com/blog/rss.xml", category: "Programming" },
    { name: "Linear Blog", url: "https://linear.app/blog/rss.xml", category: "Programming" },
    { name: "Vercel Blog", url: "https://vercel.com/atom", category: "Programming" },
    { name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/", category: "Programming" },
    { name: "Fly.io Blog", url: "https://fly.io/blog/feed.xml", category: "Programming" },

    // Science
    { name: "Ars Science", url: "https://feeds.arstechnica.com/arstechnica/science", category: "Science" },
    { name: "Live Science", url: "https://www.livescience.com/feeds/all", category: "Science" },
    { name: "ScienceAlert", url: "https://www.sciencealert.com/feed", category: "Science" },
    { name: "Smithsonian", url: "https://www.smithsonianmag.com/rss/science-nature/", category: "Science" },

    // News / World
    { name: "The Intercept", url: "https://theintercept.com/feed/?rss", category: "News" },
    { name: "ProPublica", url: "https://www.propublica.org/feeds/propublica/main", category: "News" },
    { name: "FiveThirtyEight", url: "https://fivethirtyeight.com/features/feed/", category: "News" },
    { name: "Axios", url: "https://api.axios.com/feed/", category: "News" },
    { name: "Rest of World", url: "https://restofworld.org/feed/", category: "News" },

    // Business
    { name: "Benedict Evans", url: "https://www.ben-evans.com/benedictevans?format=rss", category: "Business & Finance" },
    { name: "Matt Levine (Bloomberg)", url: "https://newsletterhunt.com/feeds/matt-levine-money-stuff", category: "Business & Finance" },
    { name: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/feed", category: "Business & Finance" },

    // Design
    { name: "Dribbble Blog", url: "https://dribbble.com/stories.rss", category: "Design" },
    { name: "Webdesigner Depot", url: "https://www.webdesignerdepot.com/feed/", category: "Design" },
    { name: "It's Nice That", url: "https://www.itsnicethat.com/rss/all", category: "Design" },

    // Security
    { name: "Google Project Zero", url: "https://googleprojectzero.blogspot.com/feeds/posts/default", category: "Security" },
    { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed_full.xml", category: "Security" },
    { name: "Naked Security", url: "https://nakedsecurity.sophos.com/feed/", category: "Security" },
    { name: "Graham Cluley", url: "https://grahamcluley.com/feed/", category: "Security" },

    // Podcasts
    { name: "Acquired", url: "https://acquired.libsyn.com/rss", category: "Podcasts" },
    { name: "All-In Podcast", url: "https://feeds.megaphone.fm/all-in-with-chamath-jason-sacks-friedberg", category: "Podcasts" },
    { name: "The Vergecast", url: "https://feeds.megaphone.fm/vergecast", category: "Podcasts" },
    { name: "Darknet Diaries", url: "https://feeds.megaphone.fm/darknetdiaries", category: "Podcasts" },
    { name: "CoRecursive", url: "https://corecursive.com/feed.xml", category: "Podcasts" },

    // Misc / Culture
    { name: "Aeon", url: "https://aeon.co/feed.rss", category: "Miscellaneous" },
    { name: "Nautilus", url: "https://nautil.us/feed/", category: "Miscellaneous" },
    { name: "The Pudding", url: "https://pudding.cool/feed/index.xml", category: "Miscellaneous" },
    { name: "Literary Hub", url: "https://lithub.com/feed/", category: "Miscellaneous" },
    { name: "Open Culture", url: "https://www.openculture.com/feed", category: "Miscellaneous" },
    { name: "Boing Boing", url: "https://boingboing.net/feed", category: "Miscellaneous" },
    { name: "The Morning News", url: "https://themorningnews.org/feed", category: "Miscellaneous" },
    { name: "Cup of Jo", url: "https://cupofjo.com/feed", category: "Miscellaneous" },
];

function testFeed(feed) {
    return new Promise((resolve) => {
        const url = new URL(feed.url);
        const client = url.protocol === 'https:' ? https : http;

        const req = client.get(feed.url, {
            timeout: 10000,
            headers: { 'User-Agent': 'RSS-Reader-Test/1.0' }
        }, (res) => {
            // Follow redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                const redirectUrl = res.headers.location.startsWith('http')
                    ? res.headers.location
                    : `${url.protocol}//${url.host}${res.headers.location}`;
                testFeed({ ...feed, url: redirectUrl }).then(resolve);
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk.slice(0, 5000));
            res.on('end', () => {
                const isRss = data.includes('<rss') || data.includes('<feed') || data.includes('<channel');
                const hasItems = data.includes('<item') || data.includes('<entry');

                let lastPost = null;
                const dateMatch = data.match(/<pubDate>([^<]+)<\/pubDate>|<published>([^<]+)<\/published>|<updated>([^<]+)<\/updated>/);
                if (dateMatch) {
                    lastPost = new Date(dateMatch[1] || dateMatch[2] || dateMatch[3]);
                }

                resolve({
                    name: feed.name,
                    url: feed.url,
                    category: feed.category,
                    status: res.statusCode,
                    ok: res.statusCode === 200 && isRss && hasItems,
                    isRss,
                    hasItems,
                    lastPost,
                    error: null
                });
            });
        });

        req.on('error', (e) => {
            resolve({ name: feed.name, url: feed.url, category: feed.category, status: 0, ok: false, error: e.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ name: feed.name, url: feed.url, category: feed.category, status: 0, ok: false, error: 'timeout' });
        });
    });
}

async function main() {
    console.error(`Testing ${FEEDS.length} feeds...`);
    const results = await Promise.all(FEEDS.map(testFeed));
    console.log(JSON.stringify(results, null, 2));
}

main();
