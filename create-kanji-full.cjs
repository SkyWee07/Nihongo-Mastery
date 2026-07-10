const fs = require('fs');
const path = require('path');

const n5KanjiStr = "日 月 火 水 木 金 土 山 川 田 人 口 目 耳 手 足 力 女 男 子 学 校 先 生 本 字 文 教 会 社 店 買 行 来 帰 見 聞 読 書 話 食 飲 立 座 休 寝 起 言 買 売 車 電 天 気 雨 雪 風 南 北 東 西 上 下 左 右 中 外 前 後 何 半 分 時 間 午 年 今 週 毎 新 古 高 安 大 小 多 少 長 短 白 黒 赤 青";

const generateKanjiN5 = () => {
  const chars = n5KanjiStr.split(' ').filter(c => c);
  let id = 1;
  return chars.map(k => ({
    id: id++,
    karakter: k,
    onyomi: "-", // Simplified for display
    kunyomi: "-",
    arti: "Lihat kamus untuk arti " + k,
    contoh: ""
  }));
};

const n5KanjiData = generateKanjiN5();
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'kanjiN5.json'), JSON.stringify(n5KanjiData, null, 2));
console.log('kanjiN5.json updated with ' + n5KanjiData.length + ' kanji.');
