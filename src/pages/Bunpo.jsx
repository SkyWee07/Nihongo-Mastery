import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import './Bunpo.css';

export default function Bunpo() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const validLevels = ['n5', 'n4'];

  useEffect(() => {
    if (!validLevels.includes(level?.toLowerCase())) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const module = await import(`../data/bunpo${level.toUpperCase()}.json`);
        setData(module.default);
      } catch (err) {
        console.error("Failed to load Bunpo data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [level]);

  if (!validLevels.includes(level?.toLowerCase())) {
    return <Navigate to="/learn" replace />;
  }

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
      </div>

      {loading ? (
        <div className="loading">Memuat data...</div>
      ) : (
        <div className="bunpo-list">
          {data.map(bunpo => (
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
        </div>
      )}
    </div>
  );
}
