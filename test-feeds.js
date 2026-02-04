const https = require('https');
const http = require('http');

const FEEDS = [
    // Tech News
    { name: "Hacker News", url: "https://hnrss.org/frontpage" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" },
    { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/" },
    { name: "Engadget", url: "https://www.engadget.com/rss.xml" },
    { name: "Gizmodo", url: "https://gizmodo.com/rss" },
    { name: "AnandTech", url: "https://www.anandtech.com/rss/" },
    { name: "Tom's Hardware", url: "https://www.tomshardware.com/feeds/all" },
    // AI & ML
    { name: "Anthropic Blog", url: "https://blog.anthropic.com/rss.xml" },
    { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml" },
    { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/" },
    { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml" },
    { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml" },
    { name: "ML Mastery", url: "https://machinelearningmastery.com/feed/" },
    { name: "Towards Data Science", url: "https://towardsdatascience.com/feed" },
    { name: "Papers With Code", url: "https://paperswithcode.com/rss" },
    // Programming
    { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
    { name: "Joel on Software", url: "https://www.joelonsoftware.com/feed/" },
    { name: "Coding Horror", url: "https://blog.codinghorror.com/rss/" },
    { name: "CSS-Tricks", url: "https://css-tricks.com/feed/" },
    { name: "Smashing Magazine", url: "https://www.smashingmagazine.com/feed/" },
    { name: "A List Apart", url: "https://alistapart.com/main/feed/" },
    { name: "Dev.to", url: "https://dev.to/feed" },
    { name: "Lobsters", url: "https://lobste.rs/rss" },
    { name: "The Pragmatic Engineer", url: "https://newsletter.pragmaticengineer.com/feed" },
    { name: "Martin Fowler", url: "https://martinfowler.com/feed.atom" },
    { name: "Dan Abramov", url: "https://overreacted.io/rss.xml" },
    { name: "Julia Evans", url: "https://jvns.ca/atom.xml" },
    { name: "Daring Fireball", url: "https://daringfireball.net/feeds/main" },
    // Science
    { name: "Nature", url: "https://www.nature.com/nature.rss" },
    { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml" },
    { name: "Quanta Magazine", url: "https://api.quantamagazine.org/feed/" },
    { name: "New Scientist", url: "https://www.newscientist.com/feed/home/" },
    { name: "Scientific American", url: "https://rss.sciam.com/ScientificAmerican-Global" },
    { name: "Phys.org", url: "https://phys.org/rss-feed/" },
    { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss" },
    { name: "Space.com", url: "https://www.space.com/feeds/all" },
    // News
    { name: "Reuters", url: "https://www.reutersagency.com/feed/" },
    { name: "AP News", url: "https://apnews.com/index.rss" },
    { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "The Atlantic", url: "https://www.theatlantic.com/feed/all/" },
    { name: "Vox", url: "https://www.vox.com/rss/index.xml" },
    // Business & Finance
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss" },
    { name: "Financial Times", url: "https://www.ft.com/rss/home" },
    { name: "The Economist", url: "https://www.economist.com/rss" },
    { name: "Harvard Business Review", url: "https://hbr.org/rss" },
    { name: "Y Combinator", url: "https://www.ycombinator.com/blog/rss/" },
    { name: "a16z", url: "https://a16z.com/feed/" },
    { name: "Stratechery", url: "https://stratechery.com/feed/" },
    // Design
    { name: "Designer News", url: "https://www.designernews.co/?format=rss" },
    { name: "UX Collective", url: "https://uxdesign.cc/feed" },
    { name: "NN Group", url: "https://www.nngroup.com/feed/rss/" },
    { name: "Sidebar", url: "https://sidebar.io/feed.xml" },
    { name: "Codrops", url: "https://tympanus.net/codrops/feed/" },
    // Security
    { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
    { name: "Schneier on Security", url: "https://www.schneier.com/feed/" },
    { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
    { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml" },
    { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/" },
    // Podcasts
    { name: "Lex Fridman", url: "https://lexfridman.com/feed/podcast/" },
    { name: "Changelog", url: "https://changelog.com/podcast/feed" },
    { name: "Software Engineering Daily", url: "https://softwareengineeringdaily.com/feed/podcast/" },
    { name: "Syntax.fm", url: "https://feed.syntax.fm/rss" },
    { name: "Talk Python", url: "https://talkpython.fm/episodes/rss" },
    // Miscellaneous
    { name: "Wait But Why", url: "https://waitbutwhy.com/feed" },
    { name: "Brain Pickings", url: "https://www.themarginalian.org/feed/" },
    { name: "Kottke", url: "https://feeds.kottke.org/main" },
    { name: "Austin Kleon", url: "https://austinkleon.com/feed/" },
    { name: "Seth Godin", url: "https://seths.blog/feed/" },
    { name: "Longform", url: "https://longform.org/feed.rss" },
    { name: "The Browser", url: "https://thebrowser.com/feed/" },
    { name: "Farnam Street", url: "https://fs.blog/feed/" },
    { name: "XKCD", url: "https://xkcd.com/rss.xml" },
];

function testFeed(feed) {
    return new Promise((resolve) => {
        const url = new URL(feed.url);
        const client = url.protocol === 'https:' ? https : http;

        const req = client.get(feed.url, {
            timeout: 10000,
            headers: { 'User-Agent': 'RSS-Reader-Test/1.0' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk.slice(0, 5000)); // Just get first bit
            res.on('end', () => {
                const isRss = data.includes('<rss') || data.includes('<feed') || data.includes('<channel');
                const hasItems = data.includes('<item') || data.includes('<entry');

                // Try to find latest date
                let lastPost = null;
                const dateMatch = data.match(/<pubDate>([^<]+)<\/pubDate>|<published>([^<]+)<\/published>|<updated>([^<]+)<\/updated>/);
                if (dateMatch) {
                    lastPost = new Date(dateMatch[1] || dateMatch[2] || dateMatch[3]);
                }

                resolve({
                    name: feed.name,
                    url: feed.url,
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
            resolve({
                name: feed.name,
                url: feed.url,
                status: 0,
                ok: false,
                error: e.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                name: feed.name,
                url: feed.url,
                status: 0,
                ok: false,
                error: 'timeout'
            });
        });
    });
}

async function main() {
    console.log(`Testing ${FEEDS.length} feeds...\n`);

    const results = await Promise.all(FEEDS.map(testFeed));

    const working = results.filter(r => r.ok);
    const broken = results.filter(r => !r.ok);

    // Check for stale (>2 years old)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const stale = working.filter(r => r.lastPost && r.lastPost < twoYearsAgo);

    console.log('=== BROKEN FEEDS ===');
    broken.forEach(r => {
        console.log(`❌ ${r.name}: ${r.error || `HTTP ${r.status}`} ${!r.isRss ? '(not RSS)' : ''} ${!r.hasItems ? '(no items)' : ''}`);
    });

    console.log('\n=== STALE FEEDS (>2 years) ===');
    stale.forEach(r => {
        console.log(`⚠️  ${r.name}: last post ${r.lastPost?.toLocaleDateString()}`);
    });

    console.log('\n=== SUMMARY ===');
    console.log(`✅ Working: ${working.length - stale.length}`);
    console.log(`⚠️  Stale: ${stale.length}`);
    console.log(`❌ Broken: ${broken.length}`);

    console.log('\n=== FEEDS TO REMOVE ===');
    [...broken, ...stale].forEach(r => console.log(`- ${r.name}`));
}

main();
