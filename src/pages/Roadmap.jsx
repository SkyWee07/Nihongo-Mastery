import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roadmapData from '../data/roadmapData.json';
import './Roadmap.css';

export default function Roadmap() {
  const [progress, setProgress] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('nihongo-roadmap');
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const toggleCheck = (e, id) => {
    e.stopPropagation(); // Mencegah klik menembus ke kotak (card)
    let newProgress;
    if (progress.includes(id)) {
      newProgress = progress.filter(item => item !== id);
    } else {
      newProgress = [...progress, id];
    }
    setProgress(newProgress);
    localStorage.setItem('nihongo-roadmap', JSON.stringify(newProgress));
  };

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const calculatePercentage = () => {
    if (roadmapData.length === 0) return 0;
    return Math.round((progress.length / roadmapData.length) * 100);
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-header glass-panel">
        <h1>Peta Perjalanan Belajar</h1>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${calculatePercentage()}%` }}></div>
        </div>
        <p>{calculatePercentage()}% Selesai ({progress.length} dari {roadmapData.length} langkah)</p>
      </div>

      <div className="roadmap-list">
        {roadmapData.map((item) => {
          const isCompleted = progress.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`roadmap-item glass-panel ${isCompleted ? 'completed' : ''}`}
              onClick={() => handleCardClick(item.path)}
              title={`Buka materi ${item.title}`}
            >
              <div className="item-number">{item.id}</div>
              <div className="item-content">
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
                <span className="item-target">Target: {item.target}</span>
              </div>
              <button 
                className={`check-btn ${isCompleted ? 'checked' : ''}`}
                onClick={(e) => toggleCheck(e, item.id)}
              >
                {isCompleted ? '✓ Selesai' : 'Tandai Selesai'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  );
}
