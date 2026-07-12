import { supabase } from '../supabase';

/**
 * SuperMemo-2 (SM-2) Algorithm implementation for Spaced Repetition.
 * @param {number} quality - 0 (Blackout) to 5 (Perfect)
 * @param {number} interval - Previous interval in days
 * @param {number} repetition - Previous repetition count
 * @param {number} easeFactor - Previous ease factor
 * @returns {Object} - { interval, repetition, easeFactor }
 */
export const calculateSm2 = (quality, interval, repetition, easeFactor) => {
  let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEaseFactor < 1.3) newEaseFactor = 1.3;

  let newRepetition = repetition;
  let newInterval = interval;

  if (quality >= 3) {
    if (repetition === 0) {
      newInterval = 1;
    } else if (repetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetition++;
  } else {
    newRepetition = 0;
    newInterval = 1;
  }

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: newEaseFactor,
  };
};

/**
 * Dapatkan semua SRS progress untuk user saat ini
 */
export const getSrsProgress = async (userId) => {
  const { data, error } = await supabase
    .from('srs_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching SRS progress:', error);
    return [];
  }
  return data;
};

/**
 * Simpan atau Update hasil review ke tabel SRS
 * @param {string} userId
 * @param {string} itemType - 'kosakata' atau 'kanji'
 * @param {number} itemId
 * @param {number} quality - 0 (salah) sampai 5 (sempurna dan cepat)
 */
export const updateSrsProgress = async (userId, itemType, itemId, quality) => {
  // Ambil record lama (jika ada)
  const { data: existingData } = await supabase
    .from('srs_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('item_type', itemType)
    .eq('item_id', itemId)
    .single();

  let prevInterval = 0;
  let prevRepetition = 0;
  let prevEase = 2.5;

  if (existingData) {
    prevInterval = existingData.interval;
    prevRepetition = existingData.repetition;
    prevEase = existingData.ease_factor;
  }

  // Hitung jadwal baru
  const sm2 = calculateSm2(quality, prevInterval, prevRepetition, prevEase);
  
  // Hitung tanggal next review (hari ini + interval hari)
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + sm2.interval);

  const payload = {
    user_id: userId,
    item_type: itemType,
    item_id: itemId,
    interval: sm2.interval,
    repetition: sm2.repetition,
    ease_factor: sm2.easeFactor,
    next_review: nextReviewDate.toISOString(),
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('srs_progress')
    .upsert(payload, { onConflict: 'user_id, item_type, item_id' });

  if (error) {
    console.error('Error updating SRS:', error);
  }
  return true;
};
