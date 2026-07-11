const fs = require('fs');
const path = require('path');
const https = require('https');

const n5 = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'kanjiN5.json'), 'utf-8'));
const n4 = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'kanjiN4.json'), 'utf-8'));
const n3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'src', 'data', 'kanjiN3.json'), 'utf-8'));

const allKanji = [...n5, ...n4, ...n3].map(k => k.kanji || k.karakter).filter(k => k && k.length === 1);

const outDir = path.join(__dirname, 'public', 'strokeOrder');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function downloadSVG(kanjiChar) {
  const code = kanjiChar.charCodeAt(0).toString(16).padStart(5, '0');
  const svgPath = path.join(outDir, `${code}.svg`);
  
  if (fs.existsSync(svgPath)) {
    return;
  }

  const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${code}.svg`;
  
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(svgPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        resolve(); // skip if 404
      }
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Fetching SVGs for ${allKanji.length} characters...`);
  for (let i = 0; i < allKanji.length; i++) {
    await downloadSVG(allKanji[i]);
    if (i % 20 === 0) console.log(`Progress: ${i} / ${allKanji.length}`);
  }
  console.log('Done downloading Kanji SVGs.');
}

run();
