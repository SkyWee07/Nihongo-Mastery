import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../services/profileService';
import DictionaryModal from './DictionaryModal';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDictOpen, setIsDictOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const data = await getProfile(user.id);
        setProfile(data);
      } else {
        setProfile(null);
      }
    };
    
    fetchProfile();

    // Listen for profile updates from Profile.jsx
    window.addEventListener('profileUpdated', fetchProfile);
    return () => window.removeEventListener('profileUpdated', fetchProfile);
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setProfile(null);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center px-4 md:px-10 py-4 mx-2 md:mx-auto mt-2 md:mt-6 max-w-7xl sticky top-2 md:top-6 z-[100] bg-bg-dark/70 backdrop-blur-xl border border-white/10 rounded-full shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-white/20">
        <div className="text-xl md:text-2xl font-extrabold">
          <Link 
            to="/" 
            onClick={() => setIsMenuOpen(false)}
            className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            ⛩️ Nihongo Mastery
          </Link>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 z-[101]">
          {/* Dictionary Search Button */}
          <button 
            className="text-2xl cursor-pointer transition-transform duration-200 text-text-main grayscale hover:grayscale-0 hover:scale-110 flex items-center justify-center p-0 bg-transparent border-none"
            onClick={() => setIsDictOpen(true)}
            title="Buka Kamus"
          >
            🔍
          </button>

          {/* Hamburger Toggle Button */}
          <button 
            className="flex flex-col justify-between w-[30px] h-[21px] bg-transparent border-none cursor-pointer group" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`w-full h-[3px] bg-text-main rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'translate-y-[9px] rotate-45' : ''}`}></span>
            <span className={`w-full h-[3px] bg-text-main rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`w-full h-[3px] bg-text-main rounded-full transition-all duration-300 ease-in-out ${isMenuOpen ? '-translate-y-[9px] -rotate-45' : ''}`}></span>
          </button>
        </div>

        {/* Flyout Menu */}
        <div className={`absolute top-[calc(100%+15px)] right-0 p-6 rounded-2xl min-w-[250px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out bg-[#0f172a]/95 backdrop-blur-[24px] border border-white/10 ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4'}`}>
          <div className="flex flex-col gap-2">
            {[
              { to: '/learn', label: '🗺️ Roadmap' },
              { to: '/hiragana', label: 'あ Hiragana' },
              { to: '/katakana', label: 'カ Katakana' },
              { to: '/quiz', label: '🎯 Kuis Kana' },
              { to: '/kotoba/n5', label: '📖 Kotoba N5' },
              { to: '/bunpo/n5', label: '✏️ Bunpo N5' },
              { to: '/kanji/n5', label: '漢 Kanji N5' },
              { to: '/video', label: '🎬 Video' },
              { to: '/game', label: '🎮 Smart Game' },
              { to: '/leaderboard', label: '🏆 Papan Peringkat' },
            ].map((link) => (
              <Link 
                key={link.to}
                to={link.to} 
                onClick={() => setIsMenuOpen(false)}
                className="text-text-muted font-medium px-4 py-3 rounded-lg transition-all duration-300 hover:text-text-main hover:bg-white/5 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              >
                {link.label}
              </Link>
            ))}
            
            <div className="h-px bg-white/10 my-2"></div>
            
            {user ? (
              <div className="flex flex-col gap-2">
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-text-muted font-medium px-4 py-3 rounded-lg flex items-center gap-2 truncate hover:text-text-main hover:bg-white/5"
                >
                  {profile?.avatar_url || '👤'} {profile?.username || user.email?.split('@')[0]}
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-2 w-full px-4 py-3 rounded-xl border-2 border-danger/50 text-danger bg-transparent font-bold cursor-pointer transition-all duration-300 hover:bg-danger/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:-translate-y-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 text-center w-full px-4 py-3 rounded-xl border-none bg-gradient-to-r from-primary to-purple-500 text-white font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_25px_rgba(99,102,241,0.6)]"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      <DictionaryModal isOpen={isDictOpen} onClose={() => setIsDictOpen(false)} />
    </>
  );
}
