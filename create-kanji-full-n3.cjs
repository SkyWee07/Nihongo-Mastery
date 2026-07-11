const fs = require('fs');
const path = require('path');

const n3KanjiStr = "政 議 民 連 対 部 合 市 内 相 定 回 選 米 実 関 決 全 表 戦 経 最 現 調 化 当 約 首 法 性 要 制 治 務 成 期 取 都 和 機 平 加 受 続 進 委 設 改 数 記 院 建 考 支 局 交 権 態 予 容 保 将 統 指 次 第 各 感 情 投 示 打 終 派 案 信 伝 結 企 健 夫 念 判 個 労 効 解 価 策 座 呼 両 未 完 録 辞 失 欠 残 求 限 配 置 苦 退 形 育 説 直 在 具 談 特 然 無 可 確 告 術 意 過 有 任 件 由 応 面 能 断 象";

const generateKanjiN3 = () => {
  const chars = n3KanjiStr.split(' ').filter(c => c);
  // deduplicate
  const uniqueChars = [...new Set(chars)];
  let id = 1;
  return uniqueChars.map(k => ({
    id: id++,
    karakter: k,
    onyomi: "-", 
    kunyomi: "-",
    arti: "Lihat kamus untuk arti " + k,
    contoh: ""
  }));
};

const n3KanjiData = generateKanjiN3();
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'kanjiN3.json'), JSON.stringify(n3KanjiData, null, 2));
console.log('kanjiN3.json updated with ' + n3KanjiData.length + ' kanji.');
