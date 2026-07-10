import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import WritingCanvas from '../components/WritingCanvas';
import './Kanji.css';

export default function Kanji() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [writingChar, setWritingChar] = useState(null);

  const validLevels = ['n5', 'n4'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const module = await import(`../data/kanji${level.toUpperCase()}.json`);
        setData(module.default);
      } catch (err) {
        console.error("Failed to load Kanji data", err);
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
    item.kanji.includes(search) || 
    item.onyomi.includes(search) ||
    item.kunyomi.includes(search)
  );

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
        <div className="kanji-grid">
          {filteredData.map(kanji => (
            <div key={kanji.id} className="kanji-card glass-panel">
              <div className="kanji-main">
                <span className="kanji-char">{kanji.kanji}</span>
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
                  onClick={() => setWritingChar(kanji.kanji)}
                >
                  ✍️ Latihan Menulis
                </button>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="no-results">Tidak ada kanji yang cocok.</div>
          )}
        </div>
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
