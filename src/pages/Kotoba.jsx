import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './Kotoba.css';

export default function Kotoba() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const validLevels = ['n5', 'n4'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const module = await import(`../data/kotoba${level.toUpperCase()}.json`);
        setData(module.default);
      } catch (err) {
        console.error("Failed to load Kotoba data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [level]);

  if (!validLevels.includes(level?.toLowerCase())) {
    return <Navigate to="/learn" replace />;
  }

  const filteredData = data.filter(item => 
    item.arti.toLowerCase().includes(search.toLowerCase()) || 
    item.kana.includes(search) || 
    item.romaji.toLowerCase().includes(search.toLowerCase()) ||
    (item.kanji && item.kanji.includes(search))
  );

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
        <div className="kotoba-grid">
          {filteredData.map(word => (
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
      )}
    </div>
  );
}
