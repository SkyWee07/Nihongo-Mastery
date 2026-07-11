import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './Bunpo.css';

import bunpoN5 from '../data/bunpoN5.json';
import bunpoN4 from '../data/bunpoN4.json';
import bunpoN3 from '../data/bunpoN3.json';

const bunpoDataMap = {
  n5: bunpoN5,
  n4: bunpoN4,
  n3: bunpoN3
};

export default function Bunpo() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const validLevels = ['n5', 'n4', 'n3'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setData(bunpoDataMap[level.toLowerCase()] || []);
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [level]);

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
    <div className="bunpo-container">
      <div className="bunpo-header glass-panel">
        <h1>Tata Bahasa (Bunpō) {level.toUpperCase()}</h1>
        <p>Pola tata bahasa untuk menyusun kalimat JLPT {level.toUpperCase()}.</p>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari pola, arti, atau penjelasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Memuat data...</div>
      ) : (
        <>
          <div className="bunpo-list">
            {currentData.map(bunpo => (
              <div key={bunpo.id} className="bunpo-card glass-panel">
                <div className="bunpo-card-header">
                  <h2 className="bunpo-pattern">{bunpo.pattern}</h2>
                  <span className="bunpo-arti">{bunpo.arti}</span>
                </div>
                <div className="bunpo-penjelasan">
                  <p>{bunpo.penjelasan}</p>
                </div>
                
                <div className="bunpo-contoh-list">
                  <h3>Contoh Kalimat:</h3>
                  {bunpo.contoh.map((c, idx) => (
                    <div key={idx} className="contoh-item">
                      <div className="contoh-jp">
                        <span>{c.jp}</span>
                        <button 
                          className="play-audio-btn" 
                          onClick={() => speak(c.jp)}
                          title="Dengarkan"
                        >
                          🔊
                        </button>
                      </div>
                      <div className="contoh-romaji">{c.id}</div>
                      <div className="contoh-arti-id">{c.id_arti}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="no-results">Tidak ada tata bahasa yang cocok.</div>
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
    </div>
  );
}
