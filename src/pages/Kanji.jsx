import { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMasteredItems, toggleMasteredItem } from '../services/progressService';
import WritingCanvas from '../components/WritingCanvas';
import SpeechPracticeModal from '../components/SpeechPracticeModal';
import './Kanji.css';

import kanjiN5 from '../data/kanjiN5.json';
import kanjiN4 from '../data/kanjiN4.json';
import kanjiN3 from '../data/kanjiN3.json';
import kanjiN2 from '../data/kanjiN2.json';
import kanjiN1 from '../data/kanjiN1.json';

const kanjiDataMap = {
  n5: kanjiN5,
  n4: kanjiN4,
  n3: kanjiN3,
  n2: kanjiN2,
  n1: kanjiN1
};

export default function Kanji() {
  const { level } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [writingChar, setWritingChar] = useState(null);
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

  const speakKanji = (text) => {
    if (!('speechSynthesis' in window) || !text) return;
    
    // Hilangkan karakter non-huruf Jepang seperti tanda strip pada kunyomi ("-masu")
    const cleanText = text.replace(/[-]/g, '');
    
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanText);
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
      setData(kanjiDataMap[level.toLowerCase()] || []);
      
      if (user) {
        try {
          const ids = await getMasteredItems(user.id, level.toLowerCase(), 'kanji');
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
      await toggleMasteredItem(user.id, level.toLowerCase(), 'kanji', id, newMastered);
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredData = data.filter(item => {
    const char = item.kanji || item.karakter || '';
    const arti = item.arti || '';
    const onyomi = item.onyomi || '';
    const kunyomi = item.kunyomi || '';
    
    const searchLower = search.toLowerCase();
    
    return arti.toLowerCase().includes(searchLower) || 
           char.includes(search) || 
           onyomi.toLowerCase().includes(searchLower) ||
           kunyomi.toLowerCase().includes(searchLower);
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
    <div className="kanji-container">
      <div className="kanji-header glass-panel">
        <h1>Kanji (漢字) {level.toUpperCase()}</h1>
        <p>Kumpulan Kanji dasar untuk JLPT {level.toUpperCase()}.</p>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari kanji, onyomi, kunyomi, atau arti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Memuat data...</div>
      ) : (
        <>
          <div className="kanji-grid">
            {currentData.map(kanji => {
              const char = kanji.kanji || kanji.karakter || '';
              const id = kanji.id || char;
              const isMastered = masteredIds.has(id);
              
              return (
              <div key={id} className={`kanji-card glass-panel ${isMastered ? 'mastered' : ''}`}>
                <button 
                  className={`mastered-btn ${isMastered ? 'active' : ''}`}
                  onClick={() => handleToggleMaster(id)}
                  title={isMastered ? "Batal tandai" : "Tandai sudah dikuasai"}
                >
                  {isMastered ? '✅ Dikuasai' : '⬜ Tandai'}
                </button>
                <div className="kanji-main">
                  <span className="kanji-char">{char}</span>
                </div>
                <div className="kanji-details">
                  <div className="kanji-arti">{kanji.arti}</div>
                  <div className="kanji-reading">
                    <div className="reading-row">
                      <span className="reading-label">On:</span>
                      <span className="reading-value">{kanji.onyomi}</span>
                    </div>
                    <div className="reading-row">
                      <span className="reading-label">Kun:</span>
                      <span className="reading-value">{kanji.kunyomi}</span>
                    </div>
                  </div>
                  <div className="kanji-contoh">
                    Contoh: <strong>{kanji.contoh}</strong>
                  </div>
                </div>
                
                <div className="kanji-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button 
                    className="audio-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Baca onyomi jika ada, atau kunyomi
                      speakKanji(kanji.onyomi !== '-' ? kanji.onyomi : kanji.kunyomi);
                    }}
                    title="Dengar Pengucapan"
                    style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🔊
                  </button>
                  <button 
                    className="write-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpeechTarget({
                        text: char,
                        reading: kanji.onyomi !== '-' ? kanji.onyomi + ' / ' + kanji.kunyomi : kanji.kunyomi
                      });
                    }}
                    title="Latihan Pengucapan"
                    style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    🎙️
                  </button>
                  <button 
                    className="write-kanji-btn"
                    onClick={() => setWritingChar(char)}
                  >
                    ✍️ Latihan Menulis
                  </button>
                </div>
              </div>
              );
            })}
            {filteredData.length === 0 && (
              <div className="no-results">Tidak ada kanji yang cocok.</div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                &laquo; Prev
              </button>
              <span className="page-info">Halaman {currentPage} dari {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next &raquo;
              </button>
            </div>
          )}
        </>
      )}

      {writingChar && (
        <WritingCanvas 
          character={writingChar} 
          onClose={() => setWritingChar(null)} 
        />
      )}

      {speechTarget && (
        <SpeechPracticeModal 
          isOpen={!!speechTarget} 
          onClose={() => setSpeechTarget(null)}
          targetText={speechTarget.text}
          targetReading={speechTarget.reading}
          type="kanji"
        />
      )}
    </div>
  );
}
