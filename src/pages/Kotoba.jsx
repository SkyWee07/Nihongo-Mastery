import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './Kotoba.css';

import kotobaN5 from '../data/kotobaN5.json';
import kotobaN4 from '../data/kotobaN4.json';
import kotobaN3 from '../data/kotobaN3.json';

const kotobaDataMap = {
  n5: kotobaN5,
  n4: kotobaN4,
  n3: kotobaN3
};

export default function Kotoba() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const validLevels = ['n5', 'n4', 'n3'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setData(kotobaDataMap[level.toLowerCase()] || []);
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
    <div className="kotoba-container">
      <div className="kotoba-header glass-panel">
        <h1>Kosakata (Kotoba) {level.toUpperCase()}</h1>
        <p>Kumpulan kosakata dasar untuk JLPT {level.toUpperCase()}.</p>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Cari arti, romaji, atau kana..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Memuat data...</div>
      ) : (
        <>
          <div className="kotoba-grid">
            {currentData.map(word => (
              <div key={word.id} className="kotoba-card glass-panel">
                <div className="kotoba-main">
                  <span className="kotoba-kanji">{word.kanji !== word.kana ? word.kanji : word.kana}</span>
                  <span className="kotoba-kana">{word.kanji !== word.kana ? word.kana : ''}</span>
                </div>
                <div className="kotoba-details">
                  <span className="kotoba-arti">{word.arti}</span>
                  <span className="kotoba-tipe">{word.tipe}</span>
                </div>
                <div className="kotoba-contoh">
                  <em>{word.contoh}</em>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="no-results">Tidak ada kosakata yang cocok.</div>
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
