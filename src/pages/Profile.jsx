import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgressStats, getQuizScores } from '../services/progressService';
import { getProfile, updateProfile } from '../services/profileService';
import { hasProfanity } from '../utils/profanityFilter';

const AVATARS = ['🦊', '🐱', '🐼', '🐶', '🐯', '🐰', '🐸', '🦉', '🐻', '🥷', '🌸', '🏮'];

export default function Profile() {
  const { user } = useAuth();
  
  // Data State
  const [stats, setStats] = useState({ kotoba: 0, kanji: 0, bunpo: 0 });
  const [quizScores, setQuizScores] = useState([]);
  const [profile, setProfile] = useState({ username: '', bio: '', avatar_url: '👤' });
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '', avatar_url: '👤' });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        const [progressData, scoresData, profileData] = await Promise.all([
          getProgressStats(user.id),
          getQuizScores(user.id),
          getProfile(user.id)
        ]);
        setStats(progressData);
        setQuizScores(scoresData);
        
        if (profileData) {
          const currentProfile = {
            username: profileData.username || user.email?.split('@')[0],
            bio: profileData.bio || '',
            avatar_url: profileData.avatar_url || '👤'
          };
          setProfile(currentProfile);
          setEditForm(currentProfile);
        }
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!editForm.username.trim()) {
      setErrorMsg('Username tidak boleh kosong');
      return;
    }

    if (hasProfanity(editForm.username)) {
      setErrorMsg('⚠️ Username mengandung kata-kata yang tidak pantas.');
      return;
    }
    
    if (hasProfanity(editForm.bio)) {
      setErrorMsg('⚠️ Bio mengandung kata-kata yang tidak pantas.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatar_url: editForm.avatar_url
      });
      
      setProfile({
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatar_url: editForm.avatar_url
      });
      
      setIsEditing(false);
      
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setErrorMsg('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-[900px] mx-auto p-4 md:p-8 animate-[fadeIn_0.4s_ease-out]">
        <div className="glass-panel text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Anda belum login</h2>
          <p className="text-text-muted">Silakan login untuk melihat statistik progres belajar Anda.</p>
        </div>
      </div>
    );
  }

  const totalMastered = stats.kotoba + stats.kanji + stats.bunpo;

  return (
    <div className="max-w-[900px] mx-auto p-4 md:p-8 animate-[fadeIn_0.4s_ease-out]">
      <div className="glass-panel flex flex-col items-center p-8 mb-8 text-center">
        {!isEditing ? (
          <>
            <div className="text-[4rem] mb-4 bg-white/5 w-[100px] h-[100px] flex items-center justify-center rounded-full border-2 border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {profile.avatar_url}
            </div>
            <h2 className="text-[1.8rem] text-text-main mb-1 font-bold">{profile.username}</h2>
            <p className="text-text-muted text-[0.9rem] mb-4">{user.email}</p>
            {profile.bio && <p className="text-text-muted italic my-4 max-w-[400px]">"{profile.bio}"</p>}
            
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              <span className="bg-indigo-500/20 text-indigo-400 py-1.5 px-4 rounded-full text-[0.8rem] font-semibold border border-indigo-500/30">
                Pejuang JLPT
              </span>
              {totalMastered > 50 && (
                <span className="bg-gradient-to-br from-amber-400 to-amber-600 text-white py-1.5 px-4 rounded-full text-[0.8rem] font-semibold">
                  Nihongo Master 🏆
                </span>
              )}
            </div>
            
            <button 
              className="mt-6 bg-white/10 border border-white/20 text-text-main py-2 px-4 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/20" 
              onClick={() => setIsEditing(true)}
            >
              ✏️ Edit Profil
            </button>
          </>
        ) : (
          <form className="text-left max-w-[400px] w-full mx-auto" onSubmit={handleSaveProfile}>
            <h3 className="text-center mb-6 text-text-main text-xl font-bold">Edit Profil</h3>
            
            {errorMsg && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-6 text-[0.9rem] text-center">{errorMsg}</div>}
            
            <div className="mb-6">
              <label className="block mb-2 text-text-muted text-[0.9rem]">Pilih Avatar:</label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`text-[1.5rem] bg-white/5 border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-white/10 hover:scale-110 ${editForm.avatar_url === avatar ? 'border-primary bg-indigo-500/20' : 'border-transparent'}`}
                    onClick={() => setEditForm({...editForm, avatar_url: avatar})}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-text-muted text-[0.9rem]">Username:</label>
              <input 
                type="text" 
                maxLength={20}
                className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors"
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                placeholder="Masukkan username..."
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-text-muted text-[0.9rem]">Bio (Opsional):</label>
              <textarea 
                maxLength={100}
                className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans min-h-[80px] resize-y focus:outline-none focus:border-primary transition-colors"
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tulis sedikit tentang diri Anda (Max 100 karakter)..."
              ></textarea>
            </div>

            <div className="flex gap-4 mt-8">
              <button 
                type="button" 
                className="flex-1 p-3 rounded-lg font-bold cursor-pointer transition-all duration-200 bg-transparent border border-white/20 text-text-main hover:bg-white/10 disabled:opacity-70 disabled:cursor-not-allowed" 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profile);
                  setErrorMsg('');
                }}
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="flex-1 p-3 rounded-lg font-bold cursor-pointer transition-all duration-200 bg-primary border-none text-white hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed" 
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid gap-8">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <section className="glass-panel p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">📈 Total Dikuasai</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
                  <div className="text-[2.5rem] font-extrabold text-sky-400 mb-2 leading-none">{totalMastered}</div>
                  <div className="text-slate-400 text-sm font-medium">Total Item</div>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
                  <div className="text-[2.5rem] font-extrabold text-white mb-2 leading-none">{stats.kotoba}</div>
                  <div className="text-slate-400 text-sm font-medium">Kosakata</div>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
                  <div className="text-[2.5rem] font-extrabold text-white mb-2 leading-none">{stats.kanji}</div>
                  <div className="text-slate-400 text-sm font-medium">Kanji</div>
                </div>
                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 text-center transition-transform duration-200 hover:-translate-y-1 hover:border-white/20">
                  <div className="text-[2.5rem] font-extrabold text-white mb-2 leading-none">{stats.bunpo}</div>
                  <div className="text-slate-400 text-sm font-medium">Tata Bahasa</div>
                </div>
              </div>
            </section>

            <section className="glass-panel p-6">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">🏆 Rekor Kuis Tertinggi</h3>
              {quizScores.length === 0 ? (
                <p className="text-center text-text-muted py-8 italic">Belum ada rekor kuis. Ayo mulai bermain!</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quizScores.map(score => (
                    <div key={score.id} className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-center transition-transform duration-200 hover:-translate-y-1 hover:border-white/10">
                      <div className="flex justify-between mb-4 text-xs font-bold">
                        <span className="text-emerald-500 bg-emerald-500/10 py-1 px-2 rounded-md">{score.level.toUpperCase()}</span>
                        <span className="text-slate-400 bg-slate-400/10 py-1 px-2 rounded-md">{score.quiz_type}</span>
                      </div>
                      <div className="text-[2.5rem] font-extrabold text-text-main leading-none">{score.highest_score}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
