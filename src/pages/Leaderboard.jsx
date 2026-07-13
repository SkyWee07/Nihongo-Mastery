import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/leaderboardService';
import { useAuth } from '../contexts/AuthContext';

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
    <div className="max-w-[800px] mx-auto py-8 px-4 animate-[fadeIn_0.5s_ease-out]">
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
      <div className="text-center p-8 mb-12 glass-panel rounded-2xl">
        <h1 className="text-[2.5rem] font-bold mb-2 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">🏆 Hall of Fame</h1>
        <p className="text-text-muted">Papan Peringkat Global Pelajar Bahasa Jepang Terbaik</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      ) : leaders.length === 0 ? (
        <div className="glass-panel text-center p-8 text-text-muted">
          <p>Belum ada data di papan peringkat. Jadilah yang pertama mendapatkan XP!</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center items-end gap-2 sm:gap-4 mb-12 h-[250px]">
            {/* 2nd Place */}
            {top3[1] && (
              <div className="flex flex-col items-center w-[90px] sm:w-[120px] animate-[slideUp_0.8s_ease-out_forwards]">
                <div className="text-[2rem] sm:text-[3rem] mb-2">🥈</div>
                <div className="font-bold text-text-main text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{top3[1].username}</div>
                <div className="text-[0.85rem] text-text-muted mb-2">{top3[1].total_xp} XP</div>
                <div className="w-full rounded-t-lg shadow-[0_-5px_15px_rgba(0,0,0,0.3)] h-[100px] bg-gradient-to-b from-slate-400 to-slate-600"></div>
              </div>
            )}
            
            {/* 1st Place */}
            {top3[0] && (
              <div className="flex flex-col items-center w-[90px] sm:w-[120px] animate-[slideUp_0.8s_ease-out_forwards]">
                <div className="text-[2rem] sm:text-[3rem] mb-2">👑</div>
                <div className="font-bold text-text-main text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{top3[0].username}</div>
                <div className="text-[0.85rem] text-text-muted mb-2">{top3[0].total_xp} XP</div>
                <div className="w-full rounded-t-lg shadow-[0_-5px_15px_rgba(0,0,0,0.3)] h-[140px] bg-gradient-to-b from-amber-400 to-amber-700"></div>
              </div>
            )}
            
            {/* 3rd Place */}
            {top3[2] && (
              <div className="flex flex-col items-center w-[90px] sm:w-[120px] animate-[slideUp_0.8s_ease-out_forwards]">
                <div className="text-[2rem] sm:text-[3rem] mb-2">🥉</div>
                <div className="font-bold text-text-main text-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-1">{top3[2].username}</div>
                <div className="text-[0.85rem] text-text-muted mb-2">{top3[2].total_xp} XP</div>
                <div className="w-full rounded-t-lg shadow-[0_-5px_15px_rgba(0,0,0,0.3)] h-[70px] bg-gradient-to-b from-amber-700 to-amber-900"></div>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col gap-2 glass-panel rounded-2xl">
            {top3.map((leader, index) => (
              <div key={leader.user_id} className={`flex items-center p-4 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:translate-x-1 ${user?.id === leader.user_id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-slate-900/40'}`}>
                <div className="w-[50px] font-bold text-text-muted text-[1.5rem] text-center">{getRankMedal(index)}</div>
                <div className="flex-1 text-text-main flex items-center gap-2">
                  <strong>{leader.username}</strong>
                  {user?.id === leader.user_id && <span className="bg-primary text-white py-0.5 px-2 rounded-full text-[0.7rem] font-bold">You</span>}
                </div>
                <div className="font-extrabold text-emerald-400">{leader.total_xp} XP</div>
              </div>
            ))}
            
            {others.map((leader, index) => (
              <div key={leader.user_id} className={`flex items-center p-4 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:translate-x-1 ${user?.id === leader.user_id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'bg-slate-900/40'}`}>
                <div className="w-[50px] font-bold text-text-muted text-[1.2rem] text-center">{index + 4}</div>
                <div className="flex-1 text-text-main flex items-center gap-2">
                  {leader.username}
                  {user?.id === leader.user_id && <span className="bg-primary text-white py-0.5 px-2 rounded-full text-[0.7rem] font-bold">You</span>}
                </div>
                <div className="font-extrabold text-emerald-400">{leader.total_xp} XP</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
