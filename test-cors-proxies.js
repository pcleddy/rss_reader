#!/usr/bin/env node
/**
 * CORS Proxy Machine Gun Test
 * Tests all feeds against multiple CORS proxies, one at a time (nice and slow)
 * Run: node test-cors-proxies.js
 * Output: cors-test-results.json
 */

const https = require('https');
const http = require('http');

// CORS proxies to test
const PROXIES = [
    { name: 'masterp99-hf', format: url => `https://masterp99-rss-proxy.hf.space/proxy?url=${encodeURIComponent(url)}` },
    { name: 'corsproxy.io', format: url => `https://corsproxy.io/?${encodeURIComponent(url)}` },
    { name: 'allorigins.win', format: url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}` },
    { name: 'thingproxy', format: url => `https://thingproxy.freeboard.io/fetch/${url}` },
];

// All feeds from the RSS reader
const FEEDS = [
    // Tech News
    { name: "Hacker News", url: "https://hnrss.org/frontpage" },
    { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index" },
    { name: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" },
    { name: "MIT Tech Review", url: "https://www.technologyreview.com/feed/" },
    { name: "Engadget", url: "https://www.engadget.com/rss.xml" },
    { name: "TechMeme", url: "https://www.techmeme.com/feed.xml" },
    { name: "The Register", url: "https://www.theregister.com/headlines.atom" },
    { name: "Hacker Noon", url: "https://hackernoon.com/feed" },
    { name: "Product Hunt", url: "https://www.producthunt.com/feed" },
    { name: "InfoQ", url: "https://feed.infoq.com/" },
    // AI & ML
    { name: "DeepMind", url: "https://deepmind.google/blog/rss.xml" },
    { name: "Hugging Face Blog", url: "https://huggingface.co/blog/feed.xml" },
    { name: "ML Mastery", url: "https://machinelearningmastery.com/feed/" },
    { name: "MIT AI News", url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml" },
    { name: "The Gradient", url: "https://thegradient.pub/rss/" },
    { name: "AI Weirdness", url: "https://www.aiweirdness.com/rss/" },
    // Programming
    { name: "Simon Willison", url: "https://simonwillison.net/atom/everything/" },
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
    { name: "The Go Blog", url: "https://go.dev/blog/feed.atom" },
    { name: "Rust Blog", url: "https://blog.rust-lang.org/feed.xml" },
    { name: "Python Insider", url: "https://blog.python.org/feeds/posts/default" },
    { name: "GitHub Blog", url: "https://github.blog/feed/" },
    { name: "Cloudflare Blog", url: "https://blog.cloudflare.com/rss/" },
    { name: "Vercel Blog", url: "https://vercel.com/atom" },
    { name: "Fly.io Blog", url: "https://fly.io/blog/feed.xml" },
    { name: "Stripe Blog", url: "https://stripe.com/blog/feed.rss" },
    { name: "Dropbox Tech", url: "https://dropbox.tech/feed" },
    { name: "Slack Engineering", url: "https://slack.engineering/feed/" },
    { name: "Discord Blog", url: "https://discord.com/blog/rss.xml" },
    // Science
    { name: "Nature", url: "https://www.nature.com/nature.rss" },
    { name: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml" },
    { name: "New Scientist", url: "https://www.newscientist.com/feed/home/" },
    { name: "Phys.org", url: "https://phys.org/rss-feed/" },
    { name: "Ars Science", url: "https://feeds.arstechnica.com/arstechnica/science" },
    { name: "Live Science", url: "https://www.livescience.com/feeds.xml" },
    { name: "ScienceAlert", url: "https://www.sciencealert.com/feed" },
    { name: "Smithsonian", url: "https://www.smithsonianmag.com/rss/science-nature/" },
    // News
    { name: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "The Guardian", url: "https://www.theguardian.com/world/rss" },
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "The Atlantic", url: "https://www.theatlantic.com/feed/all/" },
    { name: "Vox", url: "https://www.vox.com/rss/index.xml" },
    { name: "The Intercept", url: "https://theintercept.com/feed/?rss" },
    { name: "ProPublica", url: "https://www.propublica.org/feeds/propublica/main" },
    { name: "Axios", url: "https://api.axios.com/feed/" },
    { name: "Rest of World", url: "https://restofworld.org/feed/latest/" },
    // Business & Finance
    { name: "Bloomberg", url: "https://feeds.bloomberg.com/markets/news.rss" },
    { name: "Y Combinator", url: "https://www.ycombinator.com/blog/rss/" },
    { name: "Stratechery", url: "https://stratechery.com/feed/" },
    { name: "Benedict Evans", url: "https://www.ben-evans.com/benedictevans?format=rss" },
    { name: "Lenny's Newsletter", url: "https://www.lennysnewsletter.com/feed" },
    // Design
    { name: "UX Collective", url: "https://uxdesign.cc/feed" },
    { name: "NN Group", url: "https://www.nngroup.com/feed/rss/" },
    { name: "Sidebar", url: "https://sidebar.io/feed.xml" },
    { name: "Codrops", url: "https://tympanus.net/codrops/feed/" },
    { name: "Dribbble Blog", url: "https://dribbble.com/stories.rss" },
    { name: "Webdesigner Depot", url: "https://webdesignerdepot.com/feed/" },
    // Security
    { name: "Krebs on Security", url: "https://krebsonsecurity.com/feed/" },
    { name: "Schneier on Security", url: "https://www.schneier.com/feed/" },
    { name: "The Hacker News", url: "https://feeds.feedburner.com/TheHackersNews" },
    { name: "Dark Reading", url: "https://www.darkreading.com/rss.xml" },
    { name: "Troy Hunt", url: "https://www.troyhunt.com/rss/" },
    { name: "Google Project Zero", url: "https://projectzero.google/feed.xml" },
    { name: "SANS ISC", url: "https://isc.sans.edu/rssfeed_full.xml" },
    { name: "Graham Cluley", url: "https://grahamcluley.com/feed/" },
    // Podcasts
    { name: "Lex Fridman", url: "https://lexfridman.com/feed/podcast/" },
    { name: "Changelog", url: "https://changelog.com/podcast/feed" },
    { name: "Software Engineering Daily", url: "https://softwareengineeringdaily.com/feed/podcast/" },
    { name: "Talk Python", url: "https://talkpython.fm/episodes/rss" },
    { name: "Acquired", url: "https://feeds.transistor.fm/acquired" },
    { name: "The Vergecast", url: "https://feeds.megaphone.fm/vergecast" },
    { name: "Darknet Diaries", url: "https://podcast.darknetdiaries.com/" },
    // Miscellaneous
    { name: "Wait But Why", url: "https://waitbutwhy.com/feed" },
    { name: "Brain Pickings", url: "https://www.themarginalian.org/feed/" },
    { name: "Kottke", url: "https://feeds.kottke.org/main" },
    { name: "Austin Kleon", url: "https://austinkleon.com/feed/" },
    { name: "Seth Godin", url: "https://seths.blog/feed/" },
    { name: "Longform", url: "https://longform.org/feed.rss" },
    { name: "Farnam Street", url: "https://fs.blog/feed/" },
    { name: "XKCD", url: "https://xkcd.com/rss.xml" },
    { name: "Aeon", url: "https://aeon.co/feed.rss" },
    { name: "Nautilus", url: "https://nautil.us/feed/" },
    { name: "The Pudding", url: "https://pudding.cool/rss.xml" },
    { name: "Literary Hub", url: "https://lithub.com/feed/" },
    { name: "Open Culture", url: "https://www.openculture.com/feed" },
    { name: "Boing Boing", url: "https://boingboing.net/feed" },
    { name: "The Morning News", url: "https://themorningnews.org/rss/" },
    { name: "Cup of Jo", url: "https://cupofjo.com/feed/" },
];

const TIMEOUT = 10000; // 10 second timeout
const DELAY_BETWEEN = 100; // 100ms between tests (faster!)

function fetch(url, timeout = TIMEOUT) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        let req;
        const timer = setTimeout(() => {
            if (req) req.destroy();
            reject(new Error('TIMEOUT'));
        }, timeout);

        req = protocol.get(url, {
            headers: { 'User-Agent': 'RSS-Reader-Test/1.0' }
        }, res => {
            clearTimeout(timer);

            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                clearTimeout(timer);
                fetch(res.headers.location, timeout).then(resolve).catch(reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });

        req.on('error', err => {
            clearTimeout(timer);
            reject(err);
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFeedWithProxy(feed, proxy) {
    const proxyUrl = proxy.format(feed.url);
    const start = Date.now();

    try {
        const result = await fetch(proxyUrl);
        const elapsed = Date.now() - start;
        const isXml = result.data.includes('<rss') || result.data.includes('<feed') || result.data.includes('<channel');

        return {
            success: isXml,
            elapsed,
            error: isXml ? null : 'Not valid RSS/Atom',
            status: result.status
        };
    } catch (err) {
        return {
            success: false,
            elapsed: Date.now() - start,
            error: err.message,
            status: null
        };
    }
}

async function main() {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════════╗');
    console.log('  ║  🔫 CORS PROXY BATTLE ROYALE 🔫                          ║');
    console.log('  ║  Who will be the last proxy standing?                    ║');
    console.log('  ╚══════════════════════════════════════════════════════════╝');
    console.log(`\n  ${FEEDS.length} feeds × ${PROXIES.length} proxies = ${FEEDS.length * PROXIES.length} battles!\n`);

    const results = {
        timestamp: new Date().toISOString(),
        summary: {},
        byProxy: {},
        byFeed: {},
        details: []
    };

    // Initialize counters with gamification
    const scores = {};
    const wins = {};   // Speed wins (fastest successful)
    const saves = {};  // Only proxy to succeed
    for (const proxy of PROXIES) {
        results.byProxy[proxy.name] = { success: 0, failed: 0, avgTime: 0, times: [] };
        scores[proxy.name] = 0;
        wins[proxy.name] = 0;
        saves[proxy.name] = 0;
    }

    const taunts = [
        "is on fire! 🔥",
        "can't be stopped! 💪",
        "is dominating! 👑",
        "takes the lead! 🏃",
        "pulls ahead! 🚀",
    ];
    const fails = [
        "totally wiped out! 💀",
        "got rekt! 😵",
        "choked! 🤢",
        "went dark! 🌑",
    ];

    let feedNum = 0;
    let lastLeader = null;
    let leaderStreak = 0;

    const printLeaderboard = () => {
        const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
        console.log('\n  ┌─────────────────────────────────────────┐');
        console.log('  │  📊 LIVE LEADERBOARD                    │');
        console.log('  ├─────────────────────────────────────────┤');
        sorted.forEach(([name, score], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
            const bar = '█'.repeat(Math.min(20, Math.floor(score / 3)));
            const w = wins[name];
            const s = saves[name];
            console.log(`  │ ${medal} ${name.padEnd(15)} ${String(score).padStart(3)} pts │ W:${w} S:${s}`);
        });
        console.log('  └─────────────────────────────────────────┘\n');
    };

    for (const feed of FEEDS) {
        feedNum++;
        console.log(`  ⚔️  [${feedNum}/${FEEDS.length}] ${feed.name}`);

        results.byFeed[feed.name] = {};

        // Race proxies - first success wins, bail immediately!
        const proxyResults = [];
        let successCount = 0;
        const MIN_SUCCESSES = 1;

        await new Promise(resolve => {
            let completed = 0;
            PROXIES.forEach((proxy, i) => {
                testFeedWithProxy(feed, proxy).then(result => {
                    proxyResults[i] = result;
                    completed++;
                    if (result.success) successCount++;

                    // Bail early if we have enough successes OR all done
                    if (successCount >= MIN_SUCCESSES || completed === PROXIES.length) {
                        // Fill remaining with "skipped"
                        PROXIES.forEach((p, j) => {
                            if (!proxyResults[j]) {
                                proxyResults[j] = { success: false, elapsed: 0, error: 'SKIPPED', status: null };
                            }
                        });
                        resolve();
                    }
                });
            });
        });

        // Find winner (fastest success)
        let fastestTime = Infinity;
        let fastestProxy = null;
        successCount = 0; // Reset for accurate count

        // Process results
        PROXIES.forEach((proxy, i) => {
            const result = proxyResults[i];

            results.details.push({
                feed: feed.name,
                feedUrl: feed.url,
                proxy: proxy.name,
                ...result
            });

            results.byFeed[feed.name][proxy.name] = result.success;

            if (result.success) {
                results.byProxy[proxy.name].success++;
                results.byProxy[proxy.name].times.push(result.elapsed);
                scores[proxy.name] += 10; // Points for success
                successCount++;
                if (result.elapsed < fastestTime) {
                    fastestTime = result.elapsed;
                    fastestProxy = proxy.name;
                }
            } else {
                results.byProxy[proxy.name].failed++;
            }
        });

        // Award bonuses
        if (fastestProxy) {
            scores[fastestProxy] += 5; // Speed bonus
            wins[fastestProxy]++;
            console.log(`      🏆 ${fastestProxy} WINS! (${fastestTime}ms)`);

            if (successCount === 1) {
                scores[fastestProxy] += 10; // Clutch save bonus!
                saves[fastestProxy]++;
                console.log(`      🦸 CLUTCH SAVE! Only proxy to succeed!`);
            }

            // Streak tracking
            if (fastestProxy === lastLeader) {
                leaderStreak++;
                if (leaderStreak >= 3) {
                    console.log(`      🔥 ${leaderStreak}-WIN STREAK! ${taunts[Math.floor(Math.random() * taunts.length)]}`);
                }
            } else {
                if (leaderStreak >= 3) {
                    console.log(`      💔 ${lastLeader}'s streak BROKEN!`);
                }
                leaderStreak = 1;
                lastLeader = fastestProxy;
            }
        } else {
            console.log(`      💀 ALL PROXIES FAILED! ${fails[Math.floor(Math.random() * fails.length)]}`);
        }

        // Show leaderboard every 10 feeds
        if (feedNum % 10 === 0) {
            printLeaderboard();
        }

        // Small delay between feeds
        await sleep(DELAY_BETWEEN);
    }

    // Final leaderboard
    printLeaderboard();

    // Calculate averages and summary
    console.log('\n\n📊 RESULTS:\n');
    console.log('PROXY SCOREBOARD:');
    console.log('─'.repeat(60));

    const scoreboard = [];
    for (const proxy of PROXIES) {
        const stats = results.byProxy[proxy.name];
        stats.avgTime = stats.times.length > 0
            ? Math.round(stats.times.reduce((a,b) => a+b, 0) / stats.times.length)
            : 0;
        delete stats.times; // Don't need raw times in output

        const pct = Math.round((stats.success / FEEDS.length) * 100);
        scoreboard.push({ name: proxy.name, pct, stats });
        console.log(`${proxy.name.padEnd(20)} ${stats.success}/${FEEDS.length} (${pct}%) avg: ${stats.avgTime}ms`);
    }

    // Sort by success rate
    scoreboard.sort((a, b) => b.pct - a.pct);
    results.summary.ranking = scoreboard.map(s => s.name);
    results.summary.winner = scoreboard[0].name;
    results.summary.winnerPct = scoreboard[0].pct;

    console.log('─'.repeat(60));
    console.log(`\n🏆 WINNER: ${results.summary.winner} (${results.summary.winnerPct}%)\n`);

    // Find feeds that work on ALL proxies
    const universalFeeds = [];
    const problemFeeds = [];

    for (const [feedName, proxyResults] of Object.entries(results.byFeed)) {
        const successCount = Object.values(proxyResults).filter(Boolean).length;
        if (successCount === PROXIES.length) {
            universalFeeds.push(feedName);
        } else if (successCount === 0) {
            problemFeeds.push(feedName);
        }
    }

    results.summary.universalFeeds = universalFeeds.length;
    results.summary.problemFeeds = problemFeeds;

    console.log(`✅ Feeds that work on ALL proxies: ${universalFeeds.length}`);
    console.log(`❌ Feeds that work on NO proxies: ${problemFeeds.length}`);
    if (problemFeeds.length > 0 && problemFeeds.length <= 10) {
        console.log(`   Problem feeds: ${problemFeeds.join(', ')}`);
    }

    // Write results
    const fs = require('fs');
    fs.writeFileSync('cors-test-results.json', JSON.stringify(results, null, 2));
    console.log('\n📁 Full results written to cors-test-results.json');
}

main().catch(console.error);
