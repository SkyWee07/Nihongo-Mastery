import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSrsProgress, updateSrsProgress } from '../services/srsService';
import kanjiN5 from '../data/kanjiN5.json';
import kotobaN5 from '../data/kotobaN5.json';
import kanjiN4 from '../data/kanjiN4.json';
import kotobaN4 from '../data/kotobaN4.json';
import './MiniGame.css';

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
    <div className="minigame-page">
      {gameState === GAME_STATES.START && (
        <div className="game-start-container glass-panel">
          <h1 className="game-title">⚔️ Time Attack Match ⚔️</h1>
          <p className="game-desc">
            Uji seberapa kuat ingatan Anda! Algoritma <strong>Spaced Repetition (SRS)</strong> akan 
            menyesuaikan pertanyaan berdasarkan kata-kata yang paling Anda butuhkan untuk diulang.
          </p>
          <div className="game-rules">
            <ul>
              <li>⏱️ Anda punya {TIME_PER_QUESTION} detik per soal.</li>
              <li>❤️ Anda dibekali 3 Hati (Lives).</li>
              <li>🔥 Jawab cepat & benar untuk Combo Multiplier!</li>
              <li>🧠 Sistem otomatis mengingat kesalahan Anda.</li>
            </ul>
          </div>
          <button className="start-btn" onClick={startGame}>Mulai Bermain</button>
        </div>
      )}

      {gameState === GAME_STATES.PLAYING && currentQuestion && (
        <div className="game-play-container">
          <div className="game-header glass-panel">
            <div className="game-stat">
              <span className="stat-label">SKOR</span>
              <span className="stat-value">{score}</span>
            </div>
            <div className="game-stat">
              <span className="stat-label">HATI</span>
              <span className="stat-value lives">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
                ))}
              </span>
            </div>
            <div className="game-stat">
              <span className="stat-label">COMBO</span>
              <span className={`stat-value combo ${combo > 3 ? 'high-combo' : ''}`}>x{combo}</span>
            </div>
          </div>
          
          <div className="timer-bar-container">
            <div 
              className={`timer-bar ${timeLeft <= 3 ? 'danger' : ''}`}
              style={{ width: `${(timeLeft / TIME_PER_QUESTION) * 100}%` }}
            ></div>
          </div>

          <div className="question-card glass-panel">
            {currentQuestion.isDue && <div className="due-badge">REVIEW TIME 🧠</div>}
            <div className="question-type">{currentQuestion.type === 'kanji' ? 'Kanji' : 'Kosakata'}</div>
            <h2 className="question-display">{currentQuestion.display}</h2>
            <p className="question-reading">{currentQuestion.reading}</p>
          </div>

          <div className="options-grid">
            {options.map((opt, i) => {
              let btnClass = "option-btn glass-panel";
              if (selectedAnswer) {
                if (opt === currentQuestion.answer) btnClass += " correct";
                else if (opt === selectedAnswer) btnClass += " wrong";
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
            <div className="timeout-msg">WAKTU HABIS! ⏱️</div>
          )}
        </div>
      )}

      {gameState === GAME_STATES.GAMEOVER && (
        <div className="game-over-container glass-panel">
          <h1>{lives <= 0 ? "Game Over! 💔" : "Sesi Selesai! 🎉"}</h1>
          <p>Sesi review Anda telah berakhir.</p>
          <div className="final-score">
            <span>Skor Akhir:</span>
            <strong>{score}</strong>
            <span style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#94a3b8' }}>
              Berhasil menjawab: <b style={{color: '#fff'}}>{correctCount}</b> soal
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="start-btn" onClick={() => setGameState(GAME_STATES.START)}>Ulangi Permainan</button>
            <button className="start-btn" style={{ background: 'linear-gradient(135deg, #475569 0%, #334155 100%)' }} onClick={() => navigate('/learn')}>Kembali ke Roadmap</button>
          </div>
        </div>
      )}
    </div>
  );
}
