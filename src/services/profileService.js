import { supabase } from '../supabase';

/**
 * Mengambil data profil dari tabel profiles
 */
export const getProfile = async (userId) => {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('username, bio, avatar_url')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no row found, which is expected for new users before trigger runs
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

/**
 * Mengupdate data profil (username, bio, avatar)
 */
export const updateProfile = async (userId, updates) => {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  
  return true;
};
