const fs = require('fs');
const path = require('path');
const https = require('https');

const strokeOrderDir = path.join(__dirname, 'public', 'strokeOrder');
if (!fs.existsSync(strokeOrderDir)) {
  fs.mkdirSync(strokeOrderDir, { recursive: true });
}

// Unicode codepoints for the 10 Kanji we generated in kanjiN5.json and kanjiN4.json
const kanjiList = [
  "4e00", // 一
  "4e8c", // 二
  "4eba", // 人
  "65e5", // 日
  "6728", // 木
  "5bb6", // 家
  "65cf", // 族
  "52c9", // 勉
  "5f37", // 強
  "6625"  // 春
];

const downloadFile = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filepath);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const run = async () => {
  console.log("Downloading Kanji SVGs from KanjiVG...");
  let count = 0;
  for (const codepoint of kanjiList) {
    // KanjiVG format: 0pad to 5 chars usually, e.g., 04e00
    const filename = `0${codepoint}.svg`;
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${filename}`;
    const filepath = path.join(strokeOrderDir, filename);

    if (!fs.existsSync(filepath)) {
      try {
        await downloadFile(url, filepath);
        console.log(`Downloaded ${filename}`);
        count++;
      } catch (e) {
        console.error(e.message);
      }
    } else {
      console.log(`Skipped ${filename} (already exists)`);
    }
  }
  console.log(`Finished downloading ${count} kanji files.`);
};

run();
