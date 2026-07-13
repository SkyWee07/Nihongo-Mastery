import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSrsProgress, updateSrsProgress } from '../services/srsService';
import kanjiN5 from '../data/kanjiN5.json';
import kotobaN5 from '../data/kotobaN5.json';
import kanjiN4 from '../data/kanjiN4.json';
import kotobaN4 from '../data/kotobaN4.json';

const GAME_STATES = {
  START: 'START',
  PLAYING: 'PLAYING',
  GAMEOVER: 'GAMEOVER'
};

const TIME_PER_QUESTION = 10; // seconds

export default function MiniGame() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState(GAME_STATES.START);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [lives, setLives] = useState(3);
  const [correctCount, setCorrectCount] = useState(0);
  
  const poolRef = useRef([]);
  const livesRef = useRef(3);
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const timerRef = useRef(null);
  const [allItems, setAllItems] = useState([]);

  // Initialize pool data once
  useEffect(() => {
    const allKanji = [...kanjiN5, ...kanjiN4];
    const allKotoba = [...kotobaN5, ...kotobaN4];
    
    const items = [
      ...allKanji.map(k => ({ id: k.id, type: 'kanji', display: k.karakter, answer: k.arti, reading: k.onyomi + ' / ' + k.kunyomi })),
      ...allKotoba.map(k => ({ id: k.id, type: 'kosakata', display: k.kanji !== '-' ? k.kanji : k.kana, answer: k.arti, reading: k.kana }))
    ];
    setAllItems(items);
  }, []);

  const prepareGame = async () => {
    if (!user) return;
    const srsData = await getSrsProgress(user.id);
    const now = new Date();
    
    const dueItems = srsData.filter(item => new Date(item.next_review) <= now);
    
    let pool = [];
    dueItems.forEach(due => {
      const itemData = allItems.find(i => i.id === due.item_id && i.type === due.item_type);
      if (itemData) {
        pool.push({ ...itemData, isDue: true });
      }
    });
    
    const newItems = allItems.filter(i => !pool.find(p => p.id === i.id && p.type === i.type));
    newItems.sort(() => 0.5 - Math.random());
    
    pool = [...pool, ...newItems.slice(0, 50 - pool.length)];
    pool.sort(() => 0.5 - Math.random());
    poolRef.current = pool;
  };

  const startGame = async () => {
    if (!user) {
      alert("Anda harus login untuk bermain dan menyimpan progres memori otak Anda!");
      return;
    }
    await prepareGame();
    setScore(0);
    setCombo(0);
    setCorrectCount(0);
    livesRef.current = 3;
    setLives(3);
    setGameState(GAME_STATES.PLAYING);
    nextQuestion();
  };

  const nextQuestion = () => {
    if (poolRef.current.length === 0 || livesRef.current <= 0) {
      setGameState(GAME_STATES.GAMEOVER);
      return;
    }

    const current = poolRef.current[0];
    setCurrentQuestion(current);
    
    // Generate 3 wrong options
    const allMeanings = allItems.map(p => p.answer).filter(a => a !== current.answer);
    allMeanings.sort(() => 0.5 - Math.random());
    const wrongOptions = allMeanings.slice(0, 3);
    
    const finalOptions = [current.answer, ...wrongOptions].sort(() => 0.5 - Math.random());
    setOptions(finalOptions);
    
    // Update pool
    poolRef.current = poolRef.current.slice(1);
    
    setTimeLeft(TIME_PER_QUESTION);
    setSelectedAnswer(null);
    setIsCorrect(null);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeOut(current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = async (current) => {
    setIsCorrect(false);
    setSelectedAnswer('TIMEOUT');
    setCombo(0);
    
    livesRef.current -= 1;
    setLives(livesRef.current);
    
    // Save to SRS (Quality = 0)
    await updateSrsProgress(user.id, current.type, current.id, 0);
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer) return; // prevent double click
    
    clearInterval(timerRef.current);
    setSelectedAnswer(answer);
    
    const correct = answer === currentQuestion.answer;
    setIsCorrect(correct);
    
    let quality = 0;
    if (correct) {
      setCombo(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      
      const points = 10 + (combo * 2) + timeLeft; // Faster = more points
      setScore(prev => prev + points);
      
      const timeSpent = TIME_PER_QUESTION - timeLeft;
      if (timeSpent <= 3) quality = 5;
      else if (timeSpent <= 6) quality = 4;
      else quality = 3;
    } else {
      setCombo(0);
      livesRef.current -= 1;
      setLives(livesRef.current);
      quality = 0; // Wrong
    }
    
    // Save to SRS
    await updateSrsProgress(user.id, currentQuestion.type, currentQuestion.id, quality);
    
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="max-w-[800px] mx-auto p-4 sm:p-8 min-h-[80vh] flex flex-col justify-center">
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
          }
          @keyframes popIn {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      
      {gameState === GAME_STATES.START && (
        <div className="text-center py-12 px-8 rounded-2xl glass-panel">
          <h1 className="text-[2.5rem] bg-gradient-to-br from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 font-bold">⚔️ Time Attack Match ⚔️</h1>
          <p className="text-[1.1rem] text-text-muted mb-8 leading-relaxed max-w-[600px] mx-auto">
            Uji seberapa kuat ingatan Anda! Algoritma <strong className="text-white">Spaced Repetition (SRS)</strong> akan 
            menyesuaikan pertanyaan berdasarkan kata-kata yang paling Anda butuhkan untuk diulang.
          </p>
          <div className="bg-black/20 p-6 rounded-xl text-left mb-8 inline-block shadow-inner">
            <ul className="list-none p-0 m-0 space-y-3">
              <li className="text-[1.05rem] text-text-main">⏱️ Anda punya <span className="font-bold text-amber-400">{TIME_PER_QUESTION} detik</span> per soal.</li>
              <li className="text-[1.05rem] text-text-main">❤️ Anda dibekali <span className="font-bold text-red-400">3 Hati</span> (Lives).</li>
              <li className="text-[1.05rem] text-text-main">🔥 Jawab cepat & benar untuk Combo Multiplier!</li>
              <li className="text-[1.05rem] text-text-main">🧠 Sistem otomatis mengingat kesalahan Anda.</li>
            </ul>
          </div>
          <div>
            <button className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none py-4 px-12 text-[1.2rem] font-bold rounded-full cursor-pointer transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)] hover:-translate-y-1 hover:scale-105 hover:shadow-[0_15px_25px_-10px_rgba(139,92,246,0.7)]" onClick={startGame}>Mulai Bermain</button>
          </div>
        </div>
      )}

      {gameState === GAME_STATES.PLAYING && currentQuestion && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center py-4 px-8 rounded-2xl glass-panel">
            <div className="flex flex-col items-center">
              <span className="text-[0.8rem] text-text-muted font-semibold tracking-widest mb-1">SKOR</span>
              <span className="text-[1.8rem] font-extrabold text-white leading-none">{score}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[0.8rem] text-text-muted font-semibold tracking-widest mb-1">HATI</span>
              <span className="text-[1.8rem] font-extrabold text-white flex gap-1 leading-none">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`transition-opacity duration-300 ${i < lives ? 'opacity-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'opacity-20 grayscale'}`}>❤️</span>
                ))}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[0.8rem] text-text-muted font-semibold tracking-widest mb-1">COMBO</span>
              <span className={`text-[1.8rem] font-extrabold leading-none transition-all duration-200 ${combo > 3 ? 'text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)] scale-110' : 'text-amber-400'}`}>x{combo}</span>
            </div>
          </div>
          
          <div className="h-2 bg-white/10 rounded-full overflow-hidden w-full shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 3 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_10px_#22c55e]'}`}
              style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
            ></div>
          </div>

          <div className="text-center p-8 sm:py-16 sm:px-8 rounded-2xl relative flex flex-col items-center justify-center min-h-[250px] glass-panel border border-white/10 shadow-[inset_0_0_50px_rgba(0,0,0,0.2)]">
            {currentQuestion.isDue && <div className="absolute top-4 right-4 bg-pink-500 text-white py-1.5 px-3.5 rounded-full text-[0.8rem] font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-[pulse_2s_infinite] tracking-wide">REVIEW TIME 🧠</div>}
            <div className="text-text-muted text-base uppercase tracking-widest mb-4 font-semibold">{currentQuestion.type === 'kanji' ? 'Kanji' : 'Kosakata'}</div>
            <h2 className="text-[4rem] sm:text-[5rem] font-black m-0 mb-4 text-white leading-tight drop-shadow-md">{currentQuestion.display}</h2>
            <p className="text-[1.5rem] text-slate-400 m-0 font-medium tracking-wide">{currentQuestion.reading}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((opt, i) => {
              let btnClass = "glass-panel p-6 text-[1.1rem] sm:text-[1.2rem] font-bold rounded-2xl border-2 border-transparent text-white cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] text-center hover:not(:disabled):bg-white/10 hover:not(:disabled):-translate-y-1 hover:not(:disabled):shadow-[0_10px_15px_-5px_rgba(0,0,0,0.3)] hover:not(:disabled):border-white/20 active:not(:disabled):translate-y-0 disabled:opacity-90";
              if (selectedAnswer) {
                if (opt === currentQuestion.answer) btnClass += " !bg-emerald-500/20 !border-emerald-500 !text-emerald-400 scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.3)] z-10";
                else if (opt === selectedAnswer) btnClass += " !bg-red-500/20 !border-red-500 !text-red-400 animate-[shake_0.5s] z-10";
              }
              
              return (
                <button 
                  key={i} 
                  className={btnClass}
                  onClick={() => handleAnswer(opt)}
                  disabled={selectedAnswer !== null}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          
          {selectedAnswer === 'TIMEOUT' && (
            <div className="text-center text-red-500 text-[1.5rem] font-extrabold mt-4 animate-[popIn_0.3s_cubic-bezier(0.175,0.885,0.32,1.275)] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">WAKTU HABIS! ⏱️</div>
          )}
        </div>
      )}

      {gameState === GAME_STATES.GAMEOVER && (
        <div className="text-center py-12 px-8 rounded-2xl glass-panel animate-[popIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)]">
          <h1 className="text-[2.5rem] font-bold text-white mb-2">{lives <= 0 ? "Game Over! 💔" : "Sesi Selesai! 🎉"}</h1>
          <p className="text-text-muted text-lg mb-8">Sesi review Anda telah berakhir.</p>
          <div className="text-[2rem] my-8 flex flex-col items-center bg-black/20 py-8 px-4 rounded-2xl">
            <span className="text-slate-400 text-lg uppercase tracking-widest font-semibold mb-2">Skor Akhir</span>
            <strong className="text-[5rem] bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent leading-none drop-shadow-lg">{score}</strong>
            <span className="text-[1.1rem] mt-6 text-slate-400 bg-slate-800/50 py-2 px-6 rounded-full border border-white/5">
              Berhasil menjawab: <b className="text-emerald-400 text-[1.3rem] mx-1">{correctCount}</b> soal
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <button className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none py-3.5 px-8 text-[1.1rem] font-bold rounded-full cursor-pointer transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(139,92,246,0.5)] hover:-translate-y-1 hover:shadow-[0_15px_25px_-10px_rgba(139,92,246,0.7)]" onClick={() => setGameState(GAME_STATES.START)}>Ulangi Permainan</button>
            <button className="bg-slate-700 text-white border-none py-3.5 px-8 text-[1.1rem] font-bold rounded-full cursor-pointer transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:bg-slate-600 hover:shadow-[0_15px_25px_-10px_rgba(0,0,0,0.7)]" onClick={() => navigate('/learn')}>Kembali ke Roadmap</button>
          </div>
        </div>
      )}
    </div>
  );
}
