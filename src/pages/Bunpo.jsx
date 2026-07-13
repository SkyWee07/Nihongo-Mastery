import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMasteredItems, toggleMasteredItem } from '../services/progressService';

import bunpoN5 from '../data/bunpoN5.json';
import bunpoN4 from '../data/bunpoN4.json';
import bunpoN3 from '../data/bunpoN3.json';
import bunpoN2 from '../data/bunpoN2.json';
import bunpoN1 from '../data/bunpoN1.json';

const bunpoDataMap = {
  n5: bunpoN5,
  n4: bunpoN4,
  n3: bunpoN3,
  n2: bunpoN2,
  n1: bunpoN1
};

export default function Bunpo() {
  const { level } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [masteredIds, setMasteredIds] = useState(new Set());

  const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const fetchData = async () => {
      setLoading(true);
      setData(bunpoDataMap[level.toLowerCase()] || []);
      
      if (user) {
        try {
          const ids = await getMasteredItems(user.id, level.toLowerCase(), 'bunpo');
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
      await toggleMasteredItem(user.id, level.toLowerCase(), 'bunpo', id, newMastered);
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

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredData = data.filter(item => {
    const pattern = item.pattern || '';
    const arti = item.arti || '';
    const penjelasan = item.penjelasan || '';
    
    const searchLower = search.toLowerCase();
    
    return pattern.toLowerCase().includes(searchLower) || 
           arti.toLowerCase().includes(searchLower) ||
           penjelasan.toLowerCase().includes(searchLower);
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

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  return (
    <div className="flex flex-col gap-8 max-w-[900px] mx-auto w-full">
      <div className="glass-panel p-8 text-center rounded-2xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Tata Bahasa (Bunpō) {level.toUpperCase()}
        </h1>
        <p className="text-text-muted text-base mb-6">
          Pola tata bahasa untuk menyusun kalimat JLPT {level.toUpperCase()}.
        </p>
        <div className="max-w-[500px] mx-auto">
          <input 
            type="text" 
            placeholder="Cari pola, arti, atau penjelasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/60 border border-white/10 text-text-main py-3 px-4 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center p-8 text-text-muted text-lg animate-pulse">Memuat data...</div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {currentData.map(bunpo => {
              const isMastered = masteredIds.has(bunpo.id);
              return (
              <div key={bunpo.id} className={`glass-panel p-6 md:p-8 flex flex-col gap-6 relative transition-colors duration-300 ${isMastered ? 'border-emerald-400 bg-emerald-500/5' : ''}`}>
                <button 
                  className={`absolute top-4 right-4 py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 z-10 ${isMastered ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/10 border border-white/20 text-text-muted hover:bg-white/20'}`}
                  onClick={() => handleToggleMaster(bunpo.id)}
                  title={isMastered ? "Batal tandai" : "Tandai sudah dikuasai"}
                >
                  {isMastered ? '✅ Dikuasai' : '⬜ Tandai'}
                </button>
                <div className="flex items-baseline gap-4 border-b border-white/10 pb-4 flex-wrap pr-24">
                  <h2 className="text-2xl md:text-[2rem] text-text-main m-0 font-bold">{bunpo.pattern}</h2>
                  <span className="text-lg md:text-[1.2rem] text-pink-500 font-medium">{bunpo.arti}</span>
                </div>
                <div className="text-text-muted text-base md:text-[1.1rem] leading-relaxed">
                  <p>{bunpo.penjelasan}</p>
                </div>
                
                <div className="mt-2">
                  <h3 className="text-[1.1rem] text-text-main mb-4 font-semibold">Contoh Kalimat:</h3>
                  <div className="flex flex-col gap-4">
                    {bunpo.contoh.map((c, idx) => (
                      <div key={idx} className="bg-black/20 p-4 rounded-xl border-l-4 border-purple-500">
                        <div className="text-xl md:text-[1.3rem] text-text-main mb-1.5 flex items-center gap-2.5 font-medium">
                          <span>{c.jp}</span>
                          <button 
                            className="bg-transparent border-none cursor-pointer text-base opacity-70 hover:opacity-100 hover:scale-110 transition-all" 
                            onClick={() => speak(c.jp)}
                            title="Dengarkan"
                          >
                            🔊
                          </button>
                        </div>
                        <div className="text-[0.95rem] text-text-muted italic mb-1.5">{c.id}</div>
                        <div className="text-base text-purple-300 font-medium">{c.id_arti}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              );
            })}
            {filteredData.length === 0 && (
              <div className="text-center p-8 text-text-muted italic bg-black/20 rounded-xl">Tidak ada tata bahasa yang cocok.</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12 p-4">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="bg-purple-500/20 border border-purple-500/50 text-purple-300 py-2 px-4 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:bg-purple-500 hover:text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500/20 disabled:hover:translate-y-0 disabled:hover:text-purple-300"
              >
                &laquo; Prev
              </button>
              <span className="text-[0.9rem] text-text-muted bg-black/30 py-2 px-4 rounded-full">Halaman {currentPage} dari {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="bg-purple-500/20 border border-purple-500/50 text-purple-300 py-2 px-4 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:bg-purple-500 hover:text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-500/20 disabled:hover:translate-y-0 disabled:hover:text-purple-300"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
