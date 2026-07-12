import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (err) {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getRankMedal = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const top3 = leaders.slice(0, 3);
  const others = leaders.slice(3);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header glass-panel">
        <h1>🏆 Hall of Fame</h1>
        <p>Papan Peringkat Global Pelajar Bahasa Jepang Terbaik</p>
      </div>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : leaders.length === 0 ? (
        <div className="glass-panel text-center">
          <p>Belum ada data di papan peringkat. Jadilah yang pertama mendapatkan XP!</p>
        </div>
      ) : (
        <>
          <div className="podium-container">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="podium-item silver">
                <div className="podium-avatar">🥈</div>
                <div className="podium-name">{top3[1].username}</div>
                <div className="podium-xp">{top3[1].total_xp} XP</div>
                <div className="podium-bar"></div>
              </div>
            )}
            
            {/* 1st Place */}
            {top3[0] && (
              <div className="podium-item gold">
                <div className="podium-avatar">👑</div>
                <div className="podium-name">{top3[0].username}</div>
                <div className="podium-xp">{top3[0].total_xp} XP</div>
                <div className="podium-bar"></div>
              </div>
            )}
            
            {/* 3rd Place */}
            {top3[2] && (
              <div className="podium-item bronze">
                <div className="podium-avatar">🥉</div>
                <div className="podium-name">{top3[2].username}</div>
                <div className="podium-xp">{top3[2].total_xp} XP</div>
                <div className="podium-bar"></div>
              </div>
            )}
          </div>

          <div className="leaderboard-list glass-panel">
            {top3.map((leader, index) => (
              <div key={leader.user_id} className={`leaderboard-row ${user?.id === leader.user_id ? 'current-user' : ''}`}>
                <div className="rank-col top-rank">{getRankMedal(index)}</div>
                <div className="name-col">
                  <strong>{leader.username}</strong>
                  {user?.id === leader.user_id && <span className="you-badge">You</span>}
                </div>
                <div className="xp-col">{leader.total_xp} XP</div>
              </div>
            ))}
            
            {others.map((leader, index) => (
              <div key={leader.user_id} className={`leaderboard-row ${user?.id === leader.user_id ? 'current-user' : ''}`}>
                <div className="rank-col">{index + 4}</div>
                <div className="name-col">
                  {leader.username}
                  {user?.id === leader.user_id && <span className="you-badge">You</span>}
                </div>
                <div className="xp-col">{leader.total_xp} XP</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
