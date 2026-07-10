const fs = require('fs');
const path = require('path');

const n4KanjiStr = "悪 暗 医 意 引 飲 院 右 雨 運 英 駅 円 園 遠 音 歌 歌 夏 家 画 海 回 開 外 街 学 楽 活 寒 漢 間 関 館 顔 願 期 機 帰 気 記 起 休 急 牛 去 魚 京 強 教 局 近 銀 九 空 係 兄 形 計 決 建 犬 験 元 言 古 五 午 後 語 口 工 公 広 交 光 考 行 降 高 号 合 国 黒 今 困 婚 査 左 最 歳 祭 際 作 昨 産 算 散 残 止 姉 思 紙 字 寺 自 事 持 時 次 治 辞 式 七 失 室 実 写 社 者 車 借 若 弱 手 主 取 秋 終 習 集 春 正 少 色 食 心 新 森 神 親 身 進 人 図 水 正 生 世 声 西 誠 青 静 昔 石 赤 切 接 節 説 雪 先 千 専 川 洗 線 選 前 然 全 組 走 多 太 体 待 貸 台 大 第 題 達 単 短 男 知 地 池 置 遅 茶 着 昼 注 町 鳥 朝 通 弟 庭 的 鉄 店 転 答 冬 頭 同 道 読 特 肉 夏 発 半 反 飯 晩 番 非 飛 美 鼻 病 疲 表 品 不 夫 婦 父 部 風 服 物 分 文 勉 歩 報 方 妹 味 明 名 目 問 夜 野 薬 夕 曜 用 洋 理 里 力 林 冷 礼 練 録 六 和 話";

const generateKanjiN4 = () => {
  const chars = n4KanjiStr.split(' ').filter(c => c);
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

const n4KanjiData = generateKanjiN4();
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'kanjiN4.json'), JSON.stringify(n4KanjiData, null, 2));
console.log('kanjiN4.json updated with ' + n4KanjiData.length + ' kanji.');
