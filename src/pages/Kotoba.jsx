import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMasteredItems, toggleMasteredItem } from '../services/progressService';
import SpeechPracticeModal from '../components/SpeechPracticeModal';

// Dynamic imports to reduce initial bundle size
const loadKotobaData = async (level) => {
  switch (level.toLowerCase()) {
    case 'n5': return (await import('../data/kotobaN5.json')).default;
    case 'n4': return (await import('../data/kotobaN4.json')).default;
    case 'n3': return (await import('../data/kotobaN3.json')).default;
    case 'n2': return (await import('../data/kotobaN2.json')).default;
    case 'n1': return (await import('../data/kotobaN1.json')).default;
    default: return [];
  }
};

export default function Kotoba() {
  const { level } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [masteredIds, setMasteredIds] = useState(new Set());
  const [speechTarget, setSpeechTarget] = useState(null);
  const [voicesReady, setVoicesReady] = useState(false);
  const japaneseVoiceRef = useRef(null);
  
  const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const jpVoice = voices.find(v => v.lang.startsWith('ja'));
        japaneseVoiceRef.current = jpVoice || null;
        setVoicesReady(true);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakKotoba = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.volume = 1;
      
      if (japaneseVoiceRef.current) {
        utterance.voice = japaneseVoiceRef.current;
      }

      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const kotobaData = await loadKotobaData(level);
        setData(kotobaData);
      } catch (err) {
        console.error("Failed to load kotoba data", err);
        setData([]);
      }
      
      if (user) {
        try {
          const ids = await getMasteredItems(user.id, level.toLowerCase(), 'kotoba');
          setMasteredIds(new Set(ids));
        } catch (err) {
          console.error("Failed to load mastered items", err);
        }
      } else {
        setMasteredIds(new Set());
      }
      setLoading(false);
    };

    fetchData();
  }, [level, user]);

  const handleToggleMaster = async (id) => {
    if (!user) {
      alert("Silakan Login terlebih dahulu untuk menyimpan progres!");
      return;
    }
    const isMastered = masteredIds.has(id);
    const newMastered = !isMastered;
    
    setMasteredIds(prev => {
      const next = new Set(prev);
      if (newMastered) next.add(id);
      else next.delete(id);
      return next;
    });

    try {
      await toggleMasteredItem(user.id, level.toLowerCase(), 'kotoba', id, newMastered);
    } catch (err) {
      console.error("Failed to toggle mastered state", err);
      setMasteredIds(prev => {
        const next = new Set(prev);
        if (isMastered) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  if (!validLevels.includes(level?.toLowerCase())) {
    return <Navigate to="/learn" replace />;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 30;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredData = data.filter(item => {
    const arti = item.arti || '';
    const kana = item.kana || '';
    const romaji = item.romaji || '';
    const kanji = item.kanji || '';
    
    const searchLower = search.toLowerCase();
    
    return arti.toLowerCase().includes(searchLower) || 
           kana.includes(search) || 
           romaji.toLowerCase().includes(searchLower) ||
           kanji.includes(search);
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-4 md:px-6">
      <div className="glass-panel p-8 text-center rounded-[20px]">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Kosakata (Kotoba) {level.toUpperCase()}</h1>
        <p className="text-text-muted mb-6">Kumpulan kosakata dasar untuk JLPT {level.toUpperCase()}.</p>
        <div className="max-w-2xl mx-auto relative">
          <input 
            type="text" 
            placeholder="Cari arti, romaji, atau kana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-4 rounded-xl border border-white/20 bg-bg-dark/50 text-text-main text-base outline-none transition-all duration-300 focus:border-primary focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] placeholder:text-text-muted/70"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center text-text-muted py-12 text-xl font-medium animate-pulse">Memuat data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map(word => {
              const isMastered = masteredIds.has(word.id);
              return (
                <div key={word.id} className={`group relative flex flex-col p-6 min-h-[220px] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] glass-panel border border-white/5 border-t-white/10 border-l-white/10 ${isMastered ? 'border-accent/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : ''} hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_15px_rgba(16,185,129,0.2)] hover:border-accent/50`}>
                  <button 
                    className={`absolute top-4 right-4 bg-bg-dark/50 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-300 hover:scale-105 z-10 ${isMastered ? 'bg-accent text-white border-accent shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'text-text-muted hover:border-text-main'}`}
                    onClick={() => handleToggleMaster(word.id)}
                    title={isMastered ? "Batal tandai" : "Tandai sudah dikuasai"}
                  >
                    {isMastered ? '✅ Dikuasai' : '⬜ Tandai'}
                  </button>
                  <div className="mb-4">
                    <span className="block text-4xl font-bold text-text-main mb-2 tracking-wide">{word.kanji !== word.kana ? word.kanji : word.kana}</span>
                    <span className="block text-lg text-primary min-h-[1.75rem]">{word.kanji !== word.kana ? word.kana : ''}</span>
                  </div>
                  <div className="mb-4 pt-4 border-t border-white/10">
                    <span className="block text-xl text-text-main font-medium mb-1">{word.arti}</span>
                    <span className="inline-block bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-xs text-text-muted uppercase tracking-wider">{word.tipe}</span>
                  </div>
                  <div className="mt-auto text-text-muted/80 text-sm leading-relaxed pb-8">
                    <em>{word.contoh}</em>
                  </div>
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        speakKotoba(word.kana);
                      }}
                      title="Dengar Pengucapan"
                      className="bg-white/10 border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 hover:bg-primary hover:border-primary hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    >
                      🔊
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpeechTarget({
                          text: word.kanji !== word.kana ? word.kanji : word.kana,
                          kana: word.kana,
                          arti: word.arti
                        });
                      }}
                      title="Latihan Pengucapan"
                      className="bg-white/10 border border-white/20 rounded-full w-10 h-10 flex items-center justify-center text-lg cursor-pointer transition-all duration-200 hover:bg-primary hover:border-primary hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    >
                      🎙️
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredData.length === 0 && (
              <div className="col-span-full text-center p-12 text-text-muted bg-white/5 rounded-xl border border-white/10">Tidak ada kosakata yang cocok.</div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 mt-8 p-4 glass-panel rounded-xl">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="bg-bg-dark border border-white/20 text-text-main px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-white/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                &laquo; Prev
              </button>
              <span className="text-text-muted font-medium">Halaman <strong className="text-text-main">{currentPage}</strong> dari {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="bg-bg-dark border border-white/20 text-text-main px-5 py-2.5 rounded-lg cursor-pointer transition-all duration-300 font-semibold hover:bg-white/10 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}

      {speechTarget && (
        <SpeechPracticeModal 
          isOpen={!!speechTarget} 
          onClose={() => setSpeechTarget(null)}
          targetText={speechTarget.text}
          targetReading={speechTarget.kana}
          type="word"
        />
      )}
    </div>
  );
}
