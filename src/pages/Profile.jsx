import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProgressStats, getQuizScores } from '../services/progressService';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ kotoba: 0, kanji: 0, bunpo: 0 });
  const [quizScores, setQuizScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      try {
        const [progressData, scoresData] = await Promise.all([
          getProgressStats(user.id),
          getQuizScores(user.id)
        ]);
        setStats(progressData);
        setQuizScores(scoresData);
      } catch (err) {
        console.error("Error loading profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

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
      <div className="profile-header">
        <div className="profile-avatar">👤</div>
        <h2>{user.email?.split('@')[0]}</h2>
        <p className="profile-email">{user.email}</p>
        <div className="profile-badge">Pejuang JLPT</div>
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
