const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, 'src', 'data', 'strokeOrder');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Hiragana: 3041 - 3096
// Katakana: 30A1 - 30FA
const ranges = [
    { start: 0x3041, end: 0x3096 }, // Hiragana
    { start: 0x30A1, end: 0x30FA }  // Katakana
];

async function downloadSVG(hexCode) {
    const fileName = `0${hexCode.toLowerCase()}.svg`;
    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${fileName}`;
    const dest = path.join(dir, fileName);

    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                console.log(`Failed to download ${fileName}: ${res.statusCode}`);
                // Resolve anyway so we don't crash the loop
                resolve();
            }
        }).on('error', (err) => {
            console.error(`Error downloading ${fileName}: ${err.message}`);
            resolve();
        });
    });
}

async function main() {
    console.log('Downloading Kana SVGs from KanjiVG...');
    for (const range of ranges) {
        for (let code = range.start; code <= range.end; code++) {
            const hex = code.toString(16);
            await downloadSVG(hex);
        }
    }
    console.log('Download complete.');
}

main();
