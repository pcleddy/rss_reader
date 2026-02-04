#!/usr/bin/env node
const https = require('https');

const PROXY = 'https://masterp99-rss-proxy.hf.space/proxy?url=';

const FEEDS = [
    { name: "Jeff Geerling", url: "https://www.jeffgeerling.com/blog.xml" },
    { name: "Sean Goedecke", url: "https://www.seangoedecke.com/rss.xml" },
    { name: "Eric Migicovsky", url: "https://ericmigi.com/rss.xml" },
    { name: "Antirez", url: "http://antirez.com/rss" },
    { name: "Ibrahim Diallo", url: "https://idiallo.com/feed.rss" },
    { name: "Maurycy Zarzycki", url: "https://maurycyz.com/index.xml" },
    { name: "Cory Doctorow", url: "https://pluralistic.net/feed/" },
    { name: "Terence Eden", url: "https://shkspr.mobi/blog/feed/" },
    { name: "lcamtuf", url: "https://lcamtuf.substack.com/feed" },
    { name: "Mitchell Hashimoto", url: "https://mitchellh.com/feed.xml" },
    { name: "Dynomight", url: "https://dynomight.net/feed.xml" },
    { name: "Chris Siebenmann", url: "https://utcc.utoronto.ca/~cks/space/blog/?atom" },
    { name: "Xe Iaso", url: "https://xeiaso.net/blog.rss" },
    { name: "The Old New Thing", url: "https://devblogs.microsoft.com/oldnewthing/feed" },
    { name: "Ken Shirriff", url: "https://www.righto.com/feeds/posts/default" },
    { name: "Armin Ronacher", url: "https://lucumr.pocoo.org/feed.atom" },
    { name: "Skyfall", url: "https://skyfall.dev/rss.xml" },
    { name: "Gary Marcus", url: "https://garymarcus.substack.com/feed" },
    { name: "Rachel by the Bay", url: "https://rachelbythebay.com/w/atom.xml" },
    { name: "Tim Sherratt", url: "https://timsh.org/rss/" },
    { name: "John D Cook", url: "https://www.johndcook.com/blog/feed/" },
    { name: "Giles Thomas", url: "https://gilesthomas.com/feed/rss.xml" },
    { name: "matklad", url: "https://matklad.github.io/feed.xml" },
    { name: "Derek Thompson", url: "https://www.theatlantic.com/feed/author/derek-thompson/" },
    { name: "Evan Hahn", url: "https://evanhahn.com/feed.xml" },
    { name: "Terrible Software", url: "https://terriblesoftware.org/feed/" },
    { name: "Rakhim", url: "https://rakhim.exotext.com/rss.xml" },
    { name: "Joan Westenberg", url: "https://joanwestenberg.com/rss" },
    { name: "Xania", url: "https://xania.org/feed" },
    { name: "Micah Lee", url: "https://micahflee.com/feed/" },
    { name: "Andrew Nesbitt", url: "https://nesbitt.io/feed.xml" },
    { name: "Construction Physics", url: "https://www.construction-physics.com/feed" },
    { name: "Tedium", url: "https://feed.tedium.co/" },
    { name: "Susam Pal", url: "https://susam.net/feed.xml" },
    { name: "Entropic Thoughts", url: "https://entropicthoughts.com/feed.xml" },
    { name: "Hillel Wayne", url: "https://buttondown.com/hillelwayne/rss" },
    { name: "Dwarkesh Patel", url: "https://www.dwarkeshpatel.com/feed" },
    { name: "Fernando Borretti", url: "https://borretti.me/feed.xml" },
    { name: "Ed Zitron", url: "https://www.wheresyoured.at/rss/" },
    { name: "Jay D", url: "https://jayd.ml/feed.xml" },
    { name: "Max Woolf", url: "https://minimaxir.com/index.xml" },
    { name: "George Hotz", url: "https://geohot.github.io/blog/feed.xml" },
    { name: "Paul Graham", url: "http://www.aaronsw.com/2002/feeds/pgessays.rss" },
    { name: "The Digital Antiquarian", url: "https://www.filfre.net/feed/" },
    { name: "Jim Nielsen", url: "https://blog.jim-nielsen.com/feed.xml" },
    { name: "Dave Farquhar", url: "https://dfarq.homeip.net/feed/" },
    { name: "jyn", url: "https://jyn.dev/atom.xml" },
    { name: "Geoffrey Litt", url: "https://www.geoffreylitt.com/feed.xml" },
    { name: "Doug Brown", url: "https://www.downtowndougbrown.com/feed/" },
    { name: "Brutecat", url: "https://brutecat.com/rss.xml" },
    { name: "Eli Bendersky", url: "https://eli.thegreenplace.net/feeds/all.atom.xml" },
    { name: "Abort Retry Fail", url: "https://www.abortretry.fail/feed" },
    { name: "Fabien Sanglard", url: "https://fabiensanglard.net/rss.xml" },
    { name: "Old VCR", url: "https://oldvcr.blogspot.com/feeds/posts/default" },
    { name: "Bogdan the Geek", url: "https://bogdanthegeek.github.io/blog/index.xml" },
    { name: "Hugo Tunius", url: "https://hugotunius.se/feed.xml" },
    { name: "Gwern", url: "https://gwern.substack.com/feed" },
    { name: "Bert Hubert", url: "https://berthub.eu/articles/index.xml" },
    { name: "Chad Nauseam", url: "https://chadnauseam.com/rss.xml" },
    { name: "Simone", url: "https://simone.org/feed/" },
    { name: "IT Notes", url: "https://it-notes.dragas.net/feed/" },
    { name: "Beej", url: "https://beej.us/blog/rss.xml" },
    { name: "Hey Paris", url: "https://hey.paris/index.xml" },
    { name: "Daniel Wirtz", url: "https://danielwirtz.com/rss.xml" },
    { name: "Mat Duggan", url: "https://matduggan.com/rss/" },
    { name: "Refactoring English", url: "https://refactoringenglish.com/index.xml" },
    { name: "Works on My Machine", url: "https://worksonmymachine.substack.com/feed" },
    { name: "Philip Laine", url: "https://philiplaine.com/index.xml" },
    { name: "Steve Blank", url: "https://steveblank.com/feed/" },
    { name: "Max Bernstein", url: "https://bernsteinbear.com/feed.xml" },
    { name: "Daniel Delaney", url: "https://danieldelaney.net/feed" },
    { name: "Herman", url: "https://herman.bearblog.dev/feed/" },
    { name: "Tom Renner", url: "https://tomrenner.com/index.xml" },
    { name: "Pixelmelt", url: "https://blog.pixelmelt.dev/rss/" },
    { name: "Martin Alderson", url: "https://martinalderson.com/feed.xml" },
    { name: "Daniel Hooper", url: "https://danielchasehooper.com/feed.xml" },
    { name: "Simon Tatham", url: "https://www.chiark.greenend.org.uk/~sgtatham/quasiblog/feed.xml" },
    { name: "Grant Slatton", url: "https://grantslatton.com/rss.xml" },
    { name: "Experimental History", url: "https://www.experimental-history.com/feed" },
    { name: "Anil Dash", url: "https://anildash.com/feed.xml" },
    { name: "Marcin Wichary", url: "https://aresluna.org/main.rss" },
    { name: "Michael Stapelberg", url: "https://michael.stapelberg.ch/feed.xml" },
    { name: "Miguel Grinberg", url: "https://blog.miguelgrinberg.com/feed" },
    { name: "Keygen", url: "https://keygen.sh/blog/feed.xml" },
    { name: "Matthew Garrett", url: "https://mjg59.dreamwidth.org/data/rss" },
    { name: "Computer.rip", url: "https://computer.rip/rss.xml" },
    { name: "Ted Unangst", url: "https://www.tedunangst.com/flak/rss" },
];

const TIMEOUT = 10000;

async function testFeed(feed) {
    const url = PROXY + encodeURIComponent(feed.url);
    const start = Date.now();

    return new Promise(resolve => {
        const timer = setTimeout(() => {
            resolve({ name: feed.name, url: feed.url, ok: false, error: 'TIMEOUT', ms: TIMEOUT });
        }, TIMEOUT);

        https.get(url, { headers: { 'User-Agent': 'RSS-Test/1.0' } }, res => {
            clearTimeout(timer);
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const ms = Date.now() - start;
                const isXml = data.includes('<rss') || data.includes('<feed') || data.includes('<channel');
                resolve({
                    name: feed.name,
                    url: feed.url,
                    ok: res.statusCode === 200 && isXml,
                    status: res.statusCode,
                    ms
                });
            });
        }).on('error', err => {
            clearTimeout(timer);
            resolve({ name: feed.name, url: feed.url, ok: false, error: err.message, ms: Date.now() - start });
        });
    });
}

async function main() {
    console.log(`🧪 Testing ${FEEDS.length} Karpathy feeds through HF proxy...\n`);

    const working = [];
    const broken = [];

    for (let i = 0; i < FEEDS.length; i++) {
        const feed = FEEDS[i];
        process.stdout.write(`[${i+1}/${FEEDS.length}] ${feed.name}...`);
        const result = await testFeed(feed);

        if (result.ok) {
            console.log(` ✅ (${result.ms}ms)`);
            working.push(result);
        } else {
            console.log(` ❌ ${result.error || result.status}`);
            broken.push(result);
        }
    }

    console.log(`\n📊 Results: ${working.length}/${FEEDS.length} working\n`);

    if (broken.length > 0) {
        console.log('❌ Broken feeds:');
        broken.forEach(f => console.log(`   - ${f.name}: ${f.error || f.status}`));
    }

    console.log('\n✅ Working feeds (for index.html):');
    working.forEach(f => {
        console.log(`                { name: "${f.name}", url: "${f.url}" },`);
    });
}

main();
