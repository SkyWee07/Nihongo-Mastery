import { supabase } from '../supabase';

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('total_xp', { ascending: false })
    .limit(50); // Get top 50 users

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
  
  return data;
};
