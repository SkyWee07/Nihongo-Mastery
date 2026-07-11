const fs = require('fs');
const path = require('path');
const https = require('https');

// We will fetch "#jlpt-n1"
const searchQuery = encodeURIComponent('#jlpt-n1');
let page = 1;
const maxPages = 75; // 75 pages * 20 words = 1500 words approx
const results = [];
let idCounter = 1;

const fetchPage = (pageNum) => {
  return new Promise((resolve, reject) => {
    const url = `https://jisho.org/api/v1/search/words?keyword=${searchQuery}&page=${pageNum}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log('Fetching N1 vocabulary from Jisho...');
  
  for (page = 1; page <= maxPages; page++) {
    try {
      const data = await fetchPage(page);
      if (!data.data || data.data.length === 0) {
        console.log(`No more data at page ${page}. Stopping.`);
        break;
      }
      
      data.data.forEach(item => {
        const japanese = item.japanese[0];
        const kanji = japanese.word || "";
        const kana = japanese.reading || "";
        const arti = item.senses[0]?.english_definitions.join(', ') || "";
        
        results.push({
          id: idCounter++,
          kanji: kanji,
          kana: kana,
          arti: arti
        });
      });
      
      console.log(`Fetched page ${page}, total words so far: ${results.length}`);
      await delay(500); // polite delay
    } catch (e) {
      console.error(`Error fetching page ${page}:`, e.message);
      break;
    }
  }

  const outPath = path.join(__dirname, 'src', 'data', 'kotobaN1.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log(`Successfully saved ${results.length} words to ${outPath}`);
}

run();
