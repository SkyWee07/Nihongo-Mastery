import { supabase } from '../supabase';

/**
 * Mengambil daftar video dari database
 * @param {string} level - Filter level (opsional)
 */
export const getVideos = async (level = null) => {
  let query = supabase.from('videos').select(`
    *,
    profiles(username)
  `).order('created_at', { ascending: false });

  if (level && level !== 'all') {
    query = query.eq('level', level);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
  
  return data;
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
