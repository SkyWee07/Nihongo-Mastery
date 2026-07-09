import { useState, useEffect, useCallback } from 'react';
import hiraganaData from '../data/hiraganaData.json';
import katakanaData from '../data/katakanaData.json';
import './Quiz.css';

// Flatten all kana data into a single pool
const buildPool = (data) => {
  return [...data.basic, ...data.dakuon, ...data.yoon].filter(c => c.kana !== '');
};

const HIRAGANA_POOL = buildPool(hiraganaData);
const KATAKANA_POOL = buildPool(katakanaData);

export default function Quiz() {
  const [quizType, setQuizType] = useState('hiragana');
  const [mode, setMode] = useState('kana-to-romaji'); // 'kana-to-romaji' or 'romaji-to-kana'
  const [questionCount, setQuestionCount] = useState(10);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);

  const getPool = useCallback(() => {
    if (quizType === 'hiragana') return HIRAGANA_POOL;
    if (quizType === 'katakana') return KATAKANA_POOL;
    return [...HIRAGANA_POOL, ...KATAKANA_POOL]; // campur
  }, [quizType]);

  const generateQuestions = useCallback(() => {
    const pool = getPool();
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    return selected.map(correctChar => {
      // Buat 3 jawaban salah dari pool (tanpa duplikat)
      const wrongAnswers = pool
        .filter(c => c.id !== correctChar.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [...wrongAnswers, correctChar].sort(() => Math.random() - 0.5);

      return {
        correct: correctChar,
        options,
      };
    });
  }, [getPool, questionCount]);

  const startQuiz = () => {
    const q = generateQuestions();
    setQuestions(q);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFinished(false);
    setAnswerHistory([]);
    setStarted(true);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer) return; // Sudah memilih
    setSelectedAnswer(option);
    const isCorrect = option.id === questions[currentIndex].correct.id;
    if (isCorrect) setScore(prev => prev + 1);
    setAnswerHistory(prev => [...prev, { 
      question: questions[currentIndex].correct, 
      selected: option, 
      isCorrect 
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
    }
  };

  const speakKana = (kana) => {
    if ('speechSynthesis' in window && kana) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(kana);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Setup Screen
  if (!started) {
    return (
      <div className="quiz-container">
        <div className="quiz-setup glass-panel">
          <h1>🎯 Kuis Kana</h1>
          <p>Uji kemampuan membaca Hiragana & Katakana kamu!</p>

          <div className="setup-group">
            <label>Pilih Jenis Huruf:</label>
            <div className="setup-options">
              <button className={`setup-btn ${quizType === 'hiragana' ? 'active' : ''}`} onClick={() => setQuizType('hiragana')}>ひ Hiragana</button>
              <button className={`setup-btn ${quizType === 'katakana' ? 'active' : ''}`} onClick={() => setQuizType('katakana')}>カ Katakana</button>
              <button className={`setup-btn ${quizType === 'mixed' ? 'active' : ''}`} onClick={() => setQuizType('mixed')}>🔀 Campur</button>
            </div>
          </div>

          <div className="setup-group">
            <label>Mode Kuis:</label>
            <div className="setup-options">
              <button className={`setup-btn ${mode === 'kana-to-romaji' ? 'active' : ''}`} onClick={() => setMode('kana-to-romaji')}>Kana → Romaji</button>
              <button className={`setup-btn ${mode === 'romaji-to-kana' ? 'active' : ''}`} onClick={() => setMode('romaji-to-kana')}>Romaji → Kana</button>
            </div>
          </div>

          <div className="setup-group">
            <label>Jumlah Soal:</label>
            <div className="setup-options">
              {[10, 20, 30, 50].map(n => (
                <button key={n} className={`setup-btn ${questionCount === n ? 'active' : ''}`} onClick={() => setQuestionCount(n)}>{n}</button>
              ))}
            </div>
          </div>

          <button className="start-btn" onClick={startQuiz}>Mulai Kuis! 🚀</button>
        </div>
      </div>
    );
  }

  // Result Screen
  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    let grade = '';
    let emoji = '';
    if (percentage >= 90) { grade = 'Luar Biasa!'; emoji = '🏆'; }
    else if (percentage >= 70) { grade = 'Bagus Sekali!'; emoji = '🌟'; }
    else if (percentage >= 50) { grade = 'Lumayan!'; emoji = '💪'; }
    else { grade = 'Terus Berlatih!'; emoji = '📚'; }

    return (
      <div className="quiz-container">
        <div className="quiz-result glass-panel">
          <h1>{emoji} {grade}</h1>
          <div className="result-score">
            <span className="big-score">{score}/{questions.length}</span>
            <span className="big-percent">{percentage}%</span>
          </div>

          <div className="result-review">
            <h2>Rincian Jawaban:</h2>
            {answerHistory.map((item, i) => (
              <div key={i} className={`review-item ${item.isCorrect ? 'correct' : 'wrong'}`}>
                <span className="review-num">#{i + 1}</span>
                <span className="review-question">{item.question.kana}</span>
                <span className="review-answer">
                  {item.isCorrect ? '✅' : '❌'} Jawabanmu: {mode === 'kana-to-romaji' ? item.selected.romaji : item.selected.kana}
                </span>
                {!item.isCorrect && (
                  <span className="review-correct">Jawaban benar: {mode === 'kana-to-romaji' ? item.question.romaji : item.question.kana}</span>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="start-btn" onClick={startQuiz}>Ulangi Kuis 🔄</button>
            <button className="setup-btn back-btn" onClick={() => setStarted(false)}>Kembali ke Pengaturan</button>
          </div>
        </div>
      </div>
    );
  }

  // Question Screen
  const currentQuestion = questions[currentIndex];
  const questionDisplay = mode === 'kana-to-romaji' ? currentQuestion.correct.kana : currentQuestion.correct.romaji;

  return (
    <div className="quiz-container">
      <div className="quiz-header glass-panel">
        <div className="quiz-progress-info">
          <span>Soal {currentIndex + 1} / {questions.length}</span>
          <span>Skor: {score}</span>
        </div>
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="quiz-question glass-panel">
        <span 
          className="question-char" 
          onClick={() => mode === 'kana-to-romaji' && speakKana(currentQuestion.correct.kana)}
          title={mode === 'kana-to-romaji' ? 'Klik untuk mendengar' : ''}
        >
          {questionDisplay}
          {mode === 'kana-to-romaji' && <span className="question-audio-hint">🔊</span>}
        </span>
        <p className="question-prompt">
          {mode === 'kana-to-romaji' ? 'Apa bacaan romaji yang benar?' : 'Manakah huruf kana yang benar?'}
        </p>
      </div>

      <div className="quiz-options">
        {currentQuestion.options.map(option => {
          let btnClass = 'option-btn glass-panel';
          if (selectedAnswer) {
            if (option.id === currentQuestion.correct.id) btnClass += ' correct';
            else if (option.id === selectedAnswer.id) btnClass += ' wrong';
          }
          const displayText = mode === 'kana-to-romaji' ? option.romaji : option.kana;
          return (
            <button key={option.id} className={btnClass} onClick={() => handleAnswer(option)}>
              {displayText}
            </button>
          );
        })}
      </div>

      {selectedAnswer && (
        <button className="next-btn" onClick={nextQuestion}>
          {currentIndex + 1 >= questions.length ? 'Lihat Hasil 📊' : 'Soal Berikutnya →'}
        </button>
      )}
    </div>
  );
}
