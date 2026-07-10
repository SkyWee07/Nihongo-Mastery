const fs = require('fs');
const path = require('path');
const https = require('https');

const n5Path = path.join(__dirname, 'src', 'data', 'kanjiN5.json');
const n4Path = path.join(__dirname, 'src', 'data', 'kanjiN4.json');

const n5Kanji = JSON.parse(fs.readFileSync(n5Path, 'utf-8'));
const n4Kanji = JSON.parse(fs.readFileSync(n4Path, 'utf-8'));

const fetchKanjiData = (kanji) => {
  return new Promise((resolve) => {
    const url = `https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function updateKanjiList(list, outputPath) {
  const updatedList = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const char = item.karakter || item.kanji;
    if (!char) {
      updatedList.push(item);
      continue;
    }
    
    console.log(`Fetching ${char} (${i+1}/${list.length})...`);
    const data = await fetchKanjiData(char);
    
    if (data) {
      updatedList.push({
        id: item.id,
        karakter: char,
        onyomi: data.on_readings ? data.on_readings.join(', ') : '-',
        kunyomi: data.kun_readings ? data.kun_readings.join(', ') : '-',
        arti: data.meanings ? data.meanings.join(', ') : item.arti,
        contoh: '' // Can't easily get examples from kanjiapi, we'll leave it empty or fallback
      });
    } else {
      updatedList.push(item);
    }
    
    // rate limit prevention
    await delay(200); 
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(updatedList, null, 2));
  console.log(`Updated ${outputPath}`);
}

async function run() {
  console.log("Updating N5...");
  await updateKanjiList(n5Kanji, n5Path);
  console.log("Updating N4...");
  await updateKanjiList(n4Kanji, n4Path);
  console.log("Done.");
}

run();
