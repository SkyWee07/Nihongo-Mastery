const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = 'https://jisho.org/api/v1/search/words?keyword=%23jlpt-n3&page=';

const fetchData = (page) => {
  return new Promise((resolve, reject) => {
    https.get(API_URL + page, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ data: [] });
        }
      });
    }).on('error', reject);
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Fetching JLPT N3 vocabulary from Jisho API...");
  let allWords = [];
  let idCounter = 1;
  
  for (let page = 1; page <= 60; page++) {
    console.log(`Fetching page ${page}...`);
    const json = await fetchData(page);
    
    if (!json.data || json.data.length === 0) break;

    json.data.forEach(item => {
      let kanji = item.japanese[0].word || item.japanese[0].reading;
      let kana = item.japanese[0].reading || kanji;
      let meanings = item.senses[0].english_definitions.join(', ');
      let pos = item.senses[0].parts_of_speech.join(', ');

      allWords.push({
        id: idCounter++,
        kanji: kanji,
        kana: kana,
        romaji: "-", // Auto generated or omitted
        arti: meanings,
        tipe: pos,
        contoh: ""
      });
    });

    await delay(300); // 300ms delay to avoid rate limiting
  }

  console.log(`Successfully fetched ${allWords.length} words! Saving to kotobaN3.json...`);
  fs.writeFileSync(path.join(__dirname, 'src', 'data', 'kotobaN3.json'), JSON.stringify(allWords, null, 2));
}

run();
