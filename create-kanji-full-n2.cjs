const fs = require('fs');
const path = require('path');
const https = require('https');

// Sample N2 Kanji
const kanjiString = "党協総区領県設保改第結派府査委軍案策団各島革村勢減州共統報演権済責選割価企営半防拡勝検審裁訴担額等首制治務成期取都和機平加受続進記院建考支局交態予容将指次感情投示打終信伝健夫念判個労効解座呼両未完録辞失欠残求限配置苦退形育説直在具談特然無可確告術意過有任件由応面能断象";

// Remove duplicates
const uniqueKanji = [...new Set(kanjiString.split(''))];

const fetchKanjiDetails = (kanji) => {
  return new Promise((resolve) => {
    https.get(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log(`Generating Kanji N2 data for ${uniqueKanji.length} characters...`);
  const kanjiN2 = [];
  let id = 1;

  for (let k of uniqueKanji) {
    const details = await fetchKanjiDetails(k);
    if (details && !details.error) {
      kanjiN2.push({
        id: id++,
        karakter: k,
        onyomi: details.on_readings ? details.on_readings.join(', ') : '-',
        kunyomi: details.kun_readings ? details.kun_readings.join(', ') : '-',
        arti: details.meanings ? details.meanings.join(', ') : '-',
        contoh: ""
      });
      console.log(`Fetched ${k}: ${details.meanings ? details.meanings[0] : '-'}`);
    } else {
      console.log(`Failed to fetch ${k}, skipping.`);
    }
    await delay(100);
  }

  const outPath = path.join(__dirname, 'src', 'data', 'kanjiN2.json');
  fs.writeFileSync(outPath, JSON.stringify(kanjiN2, null, 2));
  console.log(`Successfully saved ${kanjiN2.length} N2 kanji to ${outPath}`);
}

run();
