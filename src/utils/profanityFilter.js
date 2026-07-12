// Daftar kata kasar dasar (Bahasa Indonesia & Inggris)
// Ini adalah versi sederhana. Untuk skala produksi, bisa ditambahkan lebih banyak
const badWords = [
  // Indonesian
  'anjing', 'babi', 'monyet', 'bangsat', 'keparat', 'tolol', 'goblok', 'bego', 
  'idiot', 'bajingan', 'kampret', 'sialan', 'tai', 'jancok', 'jancuk', 'kontol',
  'memek', 'jembut', 'peler', 'pepek', 'ngentot', 'jablay', 'lote', 'lonte',
  'pelacur', 'banci', 'bencong', 'maho', 'gay', 'lesbi', 'sundel', 'perek',
  
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut',
  'bastard', 'motherfucker', 'nigger', 'nigga', 'faggot', 'retard', 'cock',
  'twat', 'wanker', 'cum', 'porn', 'sex'
];

/**
 * Mengecek apakah sebuah string mengandung kata kasar
 * @param {string} text - Teks yang akan dicek
 * @returns {boolean} - True jika ada kata kasar, False jika aman
 */
export const hasProfanity = (text) => {
  if (!text) return false;
  
  // Ubah ke huruf kecil semua dan hilangkan spasi ganda
  const normalizedText = text.toLowerCase().trim();
  
  // Cek jika teks kosong setelah di trim
  if (normalizedText === '') return false;
  
  // Pecah menjadi kata-kata (mengabaikan tanda baca)
  const words = normalizedText.replace(/[^\w\s]/gi, '').split(/\s+/);
  
  // Cek kecocokan kata persis
  for (const word of words) {
    if (badWords.includes(word)) {
      return true;
    }
  }
  
  // Cek kecocokan substring (untuk kata yang disambung tanpa spasi)
  // Hanya mengecek untuk kata yang cukup panjang agar tidak salah blokir
  // Misal: "ass" mungkin ada di kata "password" (false positive)
  const longBadWords = badWords.filter(word => word.length > 4);
  for (const badWord of longBadWords) {
    if (normalizedText.includes(badWord)) {
      return true;
    }
  }

  return false;
};
