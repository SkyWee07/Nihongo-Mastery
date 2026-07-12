import { supabase } from '../supabase';

/**
 * Mengambil daftar video dari database dengan paginasi
 * @param {string} level - Filter level (opsional)
 * @param {number} page - Halaman saat ini
 * @param {number} limit - Jumlah item per halaman
 */
export const getVideos = async (level = null, page = 1, limit = 9) => {
  let query = supabase.from('videos').select(`
    *,
    profiles(username)
  `, { count: 'exact' }).order('created_at', { ascending: false });

  if (level && level !== 'all') {
    query = query.eq('level', level);
  }

  // Set pagination range
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
  
  return { data, count };
};

/**
 * Menambahkan video baru ke database
 */
export const addVideo = async (videoData) => {
  const { error } = await supabase
    .from('videos')
    .insert([videoData]);

  if (error) {
    console.error('Error adding video:', error);
    throw error;
  }
  
  return true;
};
