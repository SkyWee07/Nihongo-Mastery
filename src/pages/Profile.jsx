import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgressStats, getQuizScores } from '../services/progressService';
import { getProfile, updateProfile } from '../services/profileService';
import { hasProfanity } from '../utils/profanityFilter';
import './Profile.css';

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
    
    // Validasi input kosong
    if (!editForm.username.trim()) {
      setErrorMsg('Username tidak boleh kosong');
      return;
    }

    // Profanity Filter Check
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
      
      // Update local state
      setProfile({
        username: editForm.username.trim(),
        bio: editForm.bio.trim(),
        avatar_url: editForm.avatar_url
      });
      
      setIsEditing(false);
      
      // Dispatch custom event to notify Navbar of the change
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      setErrorMsg('Gagal menyimpan profil. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card glass-panel text-center">
          <h2>Anda belum login</h2>
          <p>Silakan login untuk melihat statistik progres belajar Anda.</p>
        </div>
      </div>
    );
  }

  const totalMastered = stats.kotoba + stats.kanji + stats.bunpo;

  return (
    <div className="profile-container">
      <div className="profile-header glass-panel">
        {!isEditing ? (
          <>
            <div className="profile-avatar-display">{profile.avatar_url}</div>
            <h2>{profile.username}</h2>
            <p className="profile-email">{user.email}</p>
            {profile.bio && <p className="profile-bio">"{profile.bio}"</p>}
            
            <div className="profile-badges-row">
              <span className="profile-badge">Pejuang JLPT</span>
              {totalMastered > 50 && <span className="profile-badge gold">Nihongo Master 🏆</span>}
            </div>
            
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Profil
            </button>
          </>
        ) : (
          <form className="edit-profile-form" onSubmit={handleSaveProfile}>
            <h3>Edit Profil</h3>
            
            {errorMsg && <div className="error-message">{errorMsg}</div>}
            
            <div className="form-group">
              <label>Pilih Avatar:</label>
              <div className="avatar-selection">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    className={`avatar-option ${editForm.avatar_url === avatar ? 'selected' : ''}`}
                    onClick={() => setEditForm({...editForm, avatar_url: avatar})}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Username:</label>
              <input 
                type="text" 
                maxLength={20}
                value={editForm.username}
                onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                placeholder="Masukkan username..."
              />
            </div>

            <div className="form-group">
              <label>Bio (Opsional):</label>
              <textarea 
                maxLength={100}
                value={editForm.bio}
                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                placeholder="Tulis sedikit tentang diri Anda (Max 100 karakter)..."
              ></textarea>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profile); // Reset changes
                  setErrorMsg('');
                }}
                disabled={isSaving}
              >
                Batal
              </button>
              <button type="submit" className="save-btn" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-content">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <section className="stats-section glass-panel">
              <h3>📈 Total Dikuasai</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value text-blue">{totalMastered}</div>
                  <div className="stat-label">Total Item</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.kotoba}</div>
                  <div className="stat-label">Kosakata</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.kanji}</div>
                  <div className="stat-label">Kanji</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.bunpo}</div>
                  <div className="stat-label">Tata Bahasa</div>
                </div>
              </div>
            </section>

            <section className="scores-section glass-panel">
              <h3>🏆 Rekor Kuis Tertinggi</h3>
              {quizScores.length === 0 ? (
                <p className="no-data">Belum ada rekor kuis. Ayo mulai bermain!</p>
              ) : (
                <div className="scores-grid">
                  {quizScores.map(score => (
                    <div key={score.id} className="score-card">
                      <div className="score-header">
                        <span className="score-level">{score.level.toUpperCase()}</span>
                        <span className="score-type">{score.quiz_type}</span>
                      </div>
                      <div className="score-value">{score.highest_score}</div>
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
