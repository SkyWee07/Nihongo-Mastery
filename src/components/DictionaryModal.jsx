import { useState, useRef, useEffect } from 'react';
import './DictionaryModal.css';

export default function DictionaryModal({ isOpen, onClose }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Jisho API melalui CORS proxy
      const jishoUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(jishoUrl)}`;
      
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      setResults(data.data || []);
      if (data.data && data.data.length === 0) {
        setError('Kata tidak ditemukan.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Jisho. Coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dict-overlay" onClick={onClose}>
      <div className="dict-modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <button className="dict-close-btn" onClick={onClose}>&times;</button>
        <h2 className="dict-title">📖 Kamus Jisho</h2>
        
        <form onSubmit={handleSearch} className="dict-form">
          <input
            ref={inputRef}
            type="text"
            className="dict-input glass-panel"
            placeholder="Ketik dalam Romaji, Inggris, Kana, atau Kanji..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="dict-search-btn" disabled={isLoading}>
            {isLoading ? '⏳' : 'Cari'}
          </button>
        </form>

        <div className="dict-results">
          {error && <p className="dict-error">{error}</p>}
          
          {results.map((item, index) => {
            const jp = item.japanese[0] || {};
            const meanings = item.senses[0]?.english_definitions.join(', ') || '';
            const pos = item.senses[0]?.parts_of_speech.join(', ') || '';
            
            return (
              <div key={index} className="dict-card glass-panel">
                <div className="dict-jp">
                  <span className="dict-word">{jp.word || jp.reading}</span>
                  {jp.word && <span className="dict-reading">({jp.reading})</span>}
                </div>
                <div className="dict-en">
                  <strong>Arti:</strong> {meanings}
                </div>
                {pos && (
                  <div className="dict-pos">
                    <small>{pos}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
