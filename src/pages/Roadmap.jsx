import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import roadmapData from '../data/roadmapData.json';

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
    <div className="flex flex-col gap-8 max-w-[1000px] mx-auto w-full">
      <div className="glass-panel p-6 md:p-8 text-center">
        <h1 className="text-2xl md:text-[2.5rem] font-bold mb-4 md:mb-6 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Peta Perjalanan Belajar</h1>
        <div className="bg-white/10 h-3 md:h-5 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500 ease-out" style={{ width: `${percentage}%` }}></div>
        </div>
        <p className="text-text-muted">{percentage}% Selesai ({progress.length} dari {roadmapData.length} langkah)</p>
      </div>

      <div className="flex flex-col gap-4">
        {roadmapData.map((item, index) => {
          const isCompleted = progress.includes(item.id);
          // Menemukan langkah pertama yang belum selesai sebagai langkah 'aktif'
          const isNextStep = !isCompleted && roadmapData.findIndex(r => !progress.includes(r.id)) === index;
          
          return (
            <div 
              key={item.id} 
              className={`glass-panel flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 gap-3 md:gap-6 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-white/30 ${isCompleted ? 'opacity-70 border-l-4 border-l-emerald-500' : isNextStep ? 'border-l-4 border-l-indigo-500 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : ''}`}
            >
              <div className={`text-[1.4rem] md:text-[2rem] font-extrabold min-w-[35px] md:min-w-[50px] ${isCompleted ? 'text-emerald-500' : 'text-indigo-400/50'}`}>{index + 1}</div>
              <div className="flex-1">
                <h2 className="text-base md:text-xl font-bold mb-2 text-text-main flex items-center gap-2">
                  {item.title}
                  {isNextStep && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Langkah Saat Ini</span>}
                </h2>
                <p className="text-sm md:text-[0.95rem] text-text-muted mb-3">{item.desc}</p>
                <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs md:text-sm text-indigo-300">Target: {item.target}</span>
              </div>
              <div className="flex flex-row md:flex-col gap-3 items-center md:items-end w-full md:w-auto mt-4 md:mt-0 justify-between md:justify-start">
                {item.path && (
                  <button 
                    className="py-2.5 px-5 rounded-xl border-none font-semibold text-sm cursor-pointer transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,92,246,0.5)]"
                    onClick={(e) => { e.stopPropagation(); handleCardClick(item.path); }}
                  >
                    Mulai Belajar 🚀
                  </button>
                )}
                <button 
                  className={`bg-transparent border py-2.5 px-5 rounded-lg cursor-pointer font-semibold transition-all duration-300 whitespace-nowrap shrink-0 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-text-muted text-text-main hover:bg-white/10'}`}
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
