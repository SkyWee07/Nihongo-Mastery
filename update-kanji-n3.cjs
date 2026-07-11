const fs = require('fs');
const path = require('path');
const https = require('https');

const fetchKanjiDetails = (kanji) => {
  return new Promise((resolve, reject) => {
    https.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  const filepath = path.join(__dirname, 'src', 'data', 'kanjiN3.json');
  const kanjiList = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
  
  console.log(`Updating details for ${kanjiList.length} N3 kanji...`);
  
  for (let i = 0; i < kanjiList.length; i++) {
    const item = kanjiList[i];
    if (item.onyomi === '-' || item.arti.includes('Lihat kamus')) {
      try {
        const details = await fetchKanjiDetails(item.karakter);
        if (details && !details.error) {
          item.onyomi = details.on_readings ? details.on_readings.join(', ') : '-';
          item.kunyomi = details.kun_readings ? details.kun_readings.join(', ') : '-';
          item.arti = details.meanings ? details.meanings.join(', ') : '-';
          console.log(`Updated ${item.karakter}: ${item.arti}`);
        } else {
          console.log(`Skipping ${item.karakter} - not found or error.`);
        }
      } catch (e) {
        console.error(`Failed to fetch ${item.karakter}`, e.message);
      }
      await delay(100); // polite delay
    }
  }

  fs.writeFileSync(filepath, JSON.stringify(kanjiList, null, 2));
  console.log('kanjiN3.json successfully updated with real meanings and readings!');
}

run();
