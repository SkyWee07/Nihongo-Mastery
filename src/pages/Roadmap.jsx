import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import roadmapData from '../data/roadmapData.json';
import './Roadmap.css';

export default function Roadmap() {
  const { progress, toggleProgress, getProgressPercentage } = useStore();
  const navigate = useNavigate();

  const toggleCheck = (e, id) => {
    e.stopPropagation();
    toggleProgress(id);
  };

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const percentage = getProgressPercentage(roadmapData.length);

  return (
    <div className="roadmap-container">
      <div className="roadmap-header glass-panel">
        <h1>Peta Perjalanan Belajar</h1>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${percentage}%` }}></div>
        </div>
        <p>{percentage}% Selesai ({progress.length} dari {roadmapData.length} langkah)</p>
      </div>

      <div className="roadmap-list">
        {roadmapData.map((item) => {
          const isCompleted = progress.includes(item.id);
          return (
            <div 
              key={item.id} 
              className={`roadmap-item glass-panel ${isCompleted ? 'completed' : ''}`}
            >
              <div className="item-number">{item.id}</div>
              <div className="item-content">
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
                <span className="item-target">Target: {item.target}</span>
              </div>
              <div className="item-actions">
                {item.path && (
                  <button 
                    className="start-learning-btn"
                    onClick={(e) => { e.stopPropagation(); handleCardClick(item.path); }}
                  >
                    Mulai Belajar 🚀
                  </button>
                )}
                <button 
                  className={`check-btn ${isCompleted ? 'checked' : ''}`}
                  onClick={(e) => toggleCheck(e, item.id)}
                >
                  {isCompleted ? '✓ Selesai' : 'Tandai Selesai'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
