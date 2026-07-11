const fs = require('fs');
const path = require('path');
const https = require('https');

const fetchKanjiList = (level) => {
  return new Promise((resolve, reject) => {
    https.get(`https://kanjiapi.dev/v1/kanji/jlpt-n${level}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const fetchKanjiDetails = (kanji) => {
  return new Promise((resolve, reject) => {
    // URL encode kanji because it's non-ascii
    https.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  for (let level of [3]) {
    console.log(`Fetching JLPT N${level} Kanji list...`);
    const kanjiList = await fetchKanjiList(level);
    console.log(`Found ${kanjiList.length} kanji for N${level}. Fetching details...`);
    
    let fullList = [];
    let idCounter = 1;

    for (let kanji of kanjiList) {
      try {
        const details = await fetchKanjiDetails(kanji);
        fullList.push({
          id: idCounter++,
          karakter: details.kanji,
          onyomi: details.on_readings.join(', '),
          kunyomi: details.kun_readings.join(', '),
          arti: details.meanings.join(', '), // English meaning
          contoh: ""
        });
      } catch (e) {
        console.error(`Failed to fetch ${kanji}`);
      }
      await delay(100);
    }
    
    console.log(`Successfully fetched ${fullList.length} kanji for N${level}. Saving to kanjiN${level}.json...`);
    fs.writeFileSync(path.join(__dirname, 'src', 'data', `kanjiN${level}.json`), JSON.stringify(fullList, null, 2));
  }
}

run();
