const https = require('https');

const API_KEY = "3290a5895212edaeed34ba568840627c374d002e";

async function testSerper(query) {
    console.log(`\nTesting Serper for query: "${query}"...`);

    const postData = JSON.stringify({
        "q": query,
        "gl": "in",
        "hl": "en"
    });

    const options = {
        hostname: 'google.serper.dev',
        path: '/shopping',
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.shopping) {
                        console.log(`  Found ${json.shopping.length} results.`);
                        json.shopping.slice(0, 3).forEach(item => {
                            console.log(`    - ${item.title} (${item.price}) from ${item.source}`);
                        });
                    } else {
                        console.log("  No shopping results found.");
                        console.log("  Full response:", JSON.stringify(json).substring(0, 200) + "...");
                    }
                    resolve();
                } catch (e) {
                    console.error("  Failed to parse response:", e);
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`  Problem with request: ${e.message}`);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    await testSerper("Plywood Sheet 18mm");
    await testSerper("Steel Rebar 10mm");
    await testSerper("Tempered Glass Panel");
}

runTests();
