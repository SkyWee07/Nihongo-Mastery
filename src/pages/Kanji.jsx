import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import WritingCanvas from '../components/WritingCanvas';
import './Kanji.css';

import kanjiN5 from '../data/kanjiN5.json';
import kanjiN4 from '../data/kanjiN4.json';

const kanjiDataMap = {
  n5: kanjiN5,
  n4: kanjiN4
};

export default function Kanji() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [writingChar, setWritingChar] = useState(null);

  const validLevels = ['n5', 'n4'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    setLoading(true);
    // Simulate a tiny network delay so the loading spinner shows briefly
    const timer = setTimeout(() => {
      setData(kanjiDataMap[level.toLowerCase()] || []);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [level]);

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
              return (
              <div key={kanji.id || char} className="kanji-card glass-panel">
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
                
                <div className="kanji-actions">
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
    </div>
  );
}
