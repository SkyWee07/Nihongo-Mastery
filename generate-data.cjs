const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const kotobaN5 = [
  { id: 1, kanji: "私", kana: "わたし", romaji: "watashi", arti: "Saya", tipe: "Noun", contoh: "私は学生です。" },
  { id: 2, kanji: "あなた", kana: "あなた", romaji: "anata", arti: "Anda/Kamu", tipe: "Noun", contoh: "あなたは先生ですか。" },
  { id: 3, kanji: "食べる", kana: "たべる", romaji: "taberu", arti: "Makan", tipe: "Verb (Ru)", contoh: "ご飯を食べる。" },
  { id: 4, kanji: "飲む", kana: "のむ", romaji: "nomu", arti: "Minum", tipe: "Verb (U)", contoh: "水を飲む。" },
  { id: 5, kanji: "大きい", kana: "おおきい", romaji: "ookii", arti: "Besar", tipe: "I-Adj", contoh: "大きい家。" }
];

const kotobaN4 = [
  { id: 1, kanji: "息子", kana: "むすこ", romaji: "musuko", arti: "Anak laki-laki", tipe: "Noun", contoh: "私の息子です。" },
  { id: 2, kanji: "娘", kana: "むすめ", romaji: "musume", arti: "Anak perempuan", tipe: "Noun", contoh: "娘は学生です。" },
  { id: 3, kanji: "片付ける", kana: "かたづける", romaji: "katadukeru", arti: "Membereskan", tipe: "Verb (Ru)", contoh: "部屋を片付ける。" },
  { id: 4, kanji: "複雑", kana: "ふくざつ", romaji: "fukuzatsu", arti: "Rumit", tipe: "Na-Adj", contoh: "複雑な問題。" },
  { id: 5, kanji: "急に", kana: "きゅうに", romaji: "kyuuni", arti: "Tiba-tiba", tipe: "Adverb", contoh: "急に雨が降った。" }
];

const bunpoN5 = [
  { 
    id: 1, 
    pattern: "～は～です", 
    arti: "Adalah (Kalimat Positif)", 
    penjelasan: "Digunakan untuk menyatakan identitas, pekerjaan, atau sifat dari subjek. 'は' dibaca 'wa'.", 
    contoh: [
      { jp: "私は学生です。", id: "Watashi wa gakusei desu.", id_arti: "Saya adalah siswa." },
      { jp: "彼は医者です。", id: "Kare wa isha desu.", id_arti: "Dia adalah dokter." }
    ]
  },
  { 
    id: 2, 
    pattern: "～は～ではありません", 
    arti: "Bukan (Kalimat Negatif)", 
    penjelasan: "Bentuk negatif dari 'です'.", 
    contoh: [
      { jp: "私は先生ではありません。", id: "Watashi wa sensei dewa arimasen.", id_arti: "Saya bukan guru." }
    ]
  }
];

const bunpoN4 = [
  { 
    id: 1, 
    pattern: "～かもしれない", 
    arti: "Mungkin", 
    penjelasan: "Digunakan untuk menyatakan kemungkinan (sekitar 50%). Digabungkan dengan bentuk biasa (plain form).", 
    contoh: [
      { jp: "明日は雨かもしれない。", id: "Ashita wa ame kamoshirenai.", id_arti: "Besok mungkin hujan." }
    ]
  },
  { 
    id: 2, 
    pattern: "～ために", 
    arti: "Untuk / Demi", 
    penjelasan: "Menyatakan tujuan (purpose) atau alasan (reason).", 
    contoh: [
      { jp: "家族のために働きます。", id: "Kazoku no tame ni hatarakimasu.", id_arti: "Saya bekerja demi keluarga." }
    ]
  }
];

const kanjiN5 = [
  { id: 1, kanji: "一", onyomi: "イチ, イツ", kunyomi: "ひと, ひと.つ", arti: "Satu", contoh: "一つ (ひとつ)" },
  { id: 2, kanji: "二", onyomi: "ニ, ジ", kunyomi: "ふた, ふた.つ", arti: "Dua", contoh: "二つ (ふたつ)" },
  { id: 3, kanji: "人", onyomi: "ジン, ニン", kunyomi: "ひと", arti: "Orang", contoh: "日本人 (にほんじん)" },
  { id: 4, kanji: "日", onyomi: "ニチ, ジツ", kunyomi: "ひ, -び, -か", arti: "Matahari, Hari", contoh: "日本 (にほん)" },
  { id: 5, kanji: "木", onyomi: "ボク, モク", kunyomi: "き, こ-", arti: "Pohon, Kayu", contoh: "木曜日 (もくようび)" }
];

const kanjiN4 = [
  { id: 1, kanji: "家", onyomi: "カ, ケ", kunyomi: "いえ, や, うち", arti: "Rumah", contoh: "家族 (かぞく)" },
  { id: 2, kanji: "族", onyomi: "ゾク", kunyomi: "-", arti: "Keluarga, Suku", contoh: "家族 (かぞく)" },
  { id: 3, kanji: "勉", onyomi: "ベン", kunyomi: "つと.める", arti: "Berusaha, Belajar", contoh: "勉強 (べんきょう)" },
  { id: 4, kanji: "強", onyomi: "キョウ, ゴウ", kunyomi: "つよ.い, つよ.まる, し.いる", arti: "Kuat", contoh: "強い (つよい)" },
  { id: 5, kanji: "春", onyomi: "シュン", kunyomi: "はる", arti: "Musim Semi", contoh: "春休み (はるやすみ)" }
];

const writeJson = (filename, data) => {
  fs.writeFileSync(path.join(dataDir, filename), JSON.stringify(data, null, 2));
  console.log(`Created ${filename}`);
};

writeJson('kotobaN5.json', kotobaN5);
writeJson('kotobaN4.json', kotobaN4);
writeJson('bunpoN5.json', bunpoN5);
writeJson('bunpoN4.json', bunpoN4);
writeJson('kanjiN5.json', kanjiN5);
writeJson('kanjiN4.json', kanjiN4);
