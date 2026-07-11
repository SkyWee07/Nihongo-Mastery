import { supabase } from '../supabase';

// QUZ SCORES
export const saveQuizScore = async (userId, level, quizType, newScore) => {
  if (!userId) return;
  
  // Get existing score first
  const { data: existing } = await supabase
    .from('quiz_scores')
    .select('highest_score')
    .eq('user_id', userId)
    .eq('level', level)
    .eq('quiz_type', quizType)
    .single();

  const highestScore = existing?.highest_score || 0;

  if (newScore > highestScore) {
    // Upsert the new high score
    const { error } = await supabase
      .from('quiz_scores')
      .upsert({
        user_id: userId,
        level,
        quiz_type: quizType,
        highest_score: newScore,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,level,quiz_type' });

    if (error) throw error;
    return true; // Indicates new high score
  }
  return false;
};

export const getQuizScores = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
};

// USER PROGRESS (Checklist)
export const getMasteredItems = async (userId, level, category) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('user_progress')
    .select('item_id')
    .eq('user_id', userId)
    .eq('level', level)
    .eq('category', category);
    
  if (error) throw error;
  return data.map(row => row.item_id);
};

export const toggleMasteredItem = async (userId, level, category, itemId, isMastered) => {
  if (!userId) return;

  if (isMastered) {
    // Insert new progress
    const { error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        level,
        category,
        item_id: itemId
      });
    // ignore duplicate error if they spam click
    if (error && error.code !== '23505') throw error;
  } else {
    // Delete progress
    const { error } = await supabase
      .from('user_progress')
      .delete()
      .match({
        user_id: userId,
        level,
        category,
        item_id: itemId
      });
    if (error) throw error;
  }
};

export const getProgressStats = async (userId) => {
  if (!userId) return { kotoba: 0, kanji: 0, bunpo: 0 };
  
  const { data, error } = await supabase
    .from('user_progress')
    .select('category')
    .eq('user_id', userId);
    
  if (error) throw error;
  
  const stats = { kotoba: 0, kanji: 0, bunpo: 0 };
  data.forEach(row => {
    if (stats[row.category] !== undefined) {
      stats[row.category]++;
    }
  });
  
  return stats;
};
