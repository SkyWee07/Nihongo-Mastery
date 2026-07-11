import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMasteredItems, toggleMasteredItem } from '../services/progressService';
import './Kotoba.css';

import kotobaN5 from '../data/kotobaN5.json';
import kotobaN4 from '../data/kotobaN4.json';
import kotobaN3 from '../data/kotobaN3.json';
import kotobaN2 from '../data/kotobaN2.json';
import kotobaN1 from '../data/kotobaN1.json';

const levelMap = {
  n5: { title: 'Kotoba (Kosakata) N5', desc: 'Kosakata dasar JLPT N5', data: kotobaN5 },
  n4: { title: 'Kotoba (Kosakata) N4', desc: 'Kosakata lanjutan JLPT N4', data: kotobaN4 },
  n3: { title: 'Kotoba (Kosakata) N3', desc: 'Kosakata menengah JLPT N3', data: kotobaN3 },
  n2: { title: 'Kotoba (Kosakata) N2', desc: 'Kosakata bisnis JLPT N2', data: kotobaN2 },
  n1: { title: 'Kotoba (Kosakata) N1', desc: 'Kosakata native JLPT N1', data: kotobaN1 }
};

const kotobaDataMap = {
  n5: kotobaN5,
  n4: kotobaN4,
  n3: kotobaN3,
  n2: kotobaN2,
  n1: kotobaN1
};

export default function Kotoba() {
  const { level } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [masteredIds, setMasteredIds] = useState(new Set());
  
  const validLevels = ['n5', 'n4', 'n3', 'n2', 'n1'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const fetchData = async () => {
      setLoading(true);
      setData(kotobaDataMap[level.toLowerCase()] || []);
      
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
    
    // Optimistic UI update
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
      // Revert on fail
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
            {currentData.map(word => {
              const isMastered = masteredIds.has(word.id);
              return (
                <div key={word.id} className={`kotoba-card glass-panel ${isMastered ? 'mastered' : ''}`}>
                  <button 
                    className={`mastered-btn ${isMastered ? 'active' : ''}`}
                    onClick={() => handleToggleMaster(word.id)}
                    title={isMastered ? "Batal tandai" : "Tandai sudah dikuasai"}
                  >
                    {isMastered ? '✅ Dikuasai' : '⬜ Tandai'}
                  </button>
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
              );
            })}
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
