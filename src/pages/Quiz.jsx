import { useState, useEffect, useCallback } from 'react';
import hiraganaData from '../data/hiraganaData.json';
import katakanaData from '../data/katakanaData.json';
import kanjiN5 from '../data/kanjiN5.json';
import kanjiN4 from '../data/kanjiN4.json';
import kanjiN3 from '../data/kanjiN3.json';
import kanjiN2 from '../data/kanjiN2.json';
import kanjiN1 from '../data/kanjiN1.json';
import kotobaN5 from '../data/kotobaN5.json';
import kotobaN4 from '../data/kotobaN4.json';
import kotobaN3 from '../data/kotobaN3.json';
import kotobaN2 from '../data/kotobaN2.json';
import kotobaN1 from '../data/kotobaN1.json';
import './Quiz.css';

// Flatten kana
const buildKanaPool = (data) => [...data.basic, ...data.dakuon, ...data.yoon].filter(c => c.kana !== '');

const POOLS = {
  kana: {
    hiragana: buildKanaPool(hiraganaData),
    katakana: buildKanaPool(katakanaData),
    mixed: [...buildKanaPool(hiraganaData), ...buildKanaPool(katakanaData)]
  },
  kotoba: {
    n5: kotobaN5,
    n4: kotobaN4,
    n3: kotobaN3,
    n2: kotobaN2,
    n1: kotobaN1,
    mixed: [...kotobaN5, ...kotobaN4, ...kotobaN3, ...kotobaN2, ...kotobaN1]
  },
  kanji: {
    n5: kanjiN5,
    n4: kanjiN4,
    n3: kanjiN3,
    n2: kanjiN2,
    n1: kanjiN1,
    mixed: [...kanjiN5, ...kanjiN4, ...kanjiN3, ...kanjiN2, ...kanjiN1]
  }
};

export default function Quiz() {
  const [category, setCategory] = useState('kana'); // kana, kotoba, kanji
  const [level, setLevel] = useState('hiragana'); // kana: hiragana/katakana/mixed, others: n5/n4/mixed
  const [mode, setMode] = useState('kana-to-romaji');
  const [questionCount, setQuestionCount] = useState(10);
  
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);

  // Reset level & mode when category changes
  useEffect(() => {
    if (category === 'kana') {
      setLevel('hiragana');
      setMode('kana-to-romaji');
    } else if (category === 'kotoba') {
      setLevel('n5');
      setMode('jepang-to-arti');
    } else if (category === 'kanji') {
      setLevel('n5');
      setMode('kanji-to-arti');
    }
  }, [category]);

  const generateQuestions = useCallback(() => {
    const pool = POOLS[category][level];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    return selected.map(correctItem => {
      // Pick 3 wrong options
      const wrongOptions = pool
        .filter(item => item.id !== correctItem.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [...wrongOptions, correctItem].sort(() => Math.random() - 0.5);
      return { correct: correctItem, options };
    });
  }, [category, level, questionCount]);

  const startQuiz = () => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFinished(false);
    setAnswerHistory([]);
    setStarted(true);
  };

  const handleAnswer = (option) => {
    if (selectedAnswer) return;
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

  const speak = (text) => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Renderer helpers
  const getQuestionText = (item) => {
    if (category === 'kana') {
      return mode === 'kana-to-romaji' ? item.kana : item.romaji;
    } else if (category === 'kotoba') {
      return mode === 'jepang-to-arti' ? (item.kanji || item.kana) : item.arti;
    } else if (category === 'kanji') {
      return mode === 'kanji-to-arti' ? item.karakter : item.arti;
    }
  };

  const getOptionText = (item) => {
    if (category === 'kana') {
      return mode === 'kana-to-romaji' ? item.romaji : item.kana;
    } else if (category === 'kotoba') {
      return mode === 'jepang-to-arti' ? item.arti : (item.kanji || item.kana);
    } else if (category === 'kanji') {
      return mode === 'kanji-to-arti' ? item.arti : item.karakter;
    }
  };

  const getAudioText = (item) => {
    if (category === 'kana') return item.kana;
    if (category === 'kotoba') return item.kanji || item.kana;
    if (category === 'kanji') return item.karakter;
    return '';
  };

  if (!started) {
    return (
      <div className="quiz-container">
        <div className="quiz-setup glass-panel">
          <h1>🎯 Kuis Interaktif</h1>
          <p>Uji kemampuan Kana, Kosakata, dan Kanji kamu secara acak!</p>

          <div className="setup-group">
            <label>Pilih Kategori:</label>
            <div className="setup-options">
              <button className={`setup-btn ${category === 'kana' ? 'active' : ''}`} onClick={() => setCategory('kana')}>あ Kana</button>
              <button className={`setup-btn ${category === 'kotoba' ? 'active' : ''}`} onClick={() => setCategory('kotoba')}>📝 Kosakata</button>
              <button className={`setup-btn ${category === 'kanji' ? 'active' : ''}`} onClick={() => setCategory('kanji')}>漢 Kanji</button>
            </div>
          </div>

          <div className="setup-group">
            <label>Pilih Level/Materi:</label>
            <div className="setup-options">
              {category === 'kana' ? (
                <>
                  <button className={`setup-btn ${level === 'hiragana' ? 'active' : ''}`} onClick={() => setLevel('hiragana')}>Hiragana</button>
                  <button className={`setup-btn ${level === 'katakana' ? 'active' : ''}`} onClick={() => setLevel('katakana')}>Katakana</button>
                  <button className={`setup-btn ${level === 'mixed' ? 'active' : ''}`} onClick={() => setLevel('mixed')}>Campur</button>
                </>
              ) : (
                <>
                  <button className={`setup-btn ${level === 'n5' ? 'active' : ''}`} onClick={() => setLevel('n5')}>JLPT N5</button>
                  <button className={`setup-btn ${level === 'n4' ? 'active' : ''}`} onClick={() => setLevel('n4')}>JLPT N4</button>
                  <button className={`setup-btn ${level === 'n3' ? 'active' : ''}`} onClick={() => setLevel('n3')}>JLPT N3</button>
                  <button className={`setup-btn ${level === 'n2' ? 'active' : ''}`} onClick={() => setLevel('n2')}>JLPT N2</button>
                  <button className={`setup-btn ${level === 'n1' ? 'active' : ''}`} onClick={() => setLevel('n1')}>JLPT N1</button>
                  <button className={`setup-btn ${level === 'mixed' ? 'active' : ''}`} onClick={() => setLevel('mixed')}>Campur Semua</button>
                </>
              )}
            </div>
          </div>

          <div className="setup-group">
            <label>Mode Kuis:</label>
            <div className="setup-options">
              {category === 'kana' ? (
                <>
                  <button className={`setup-btn ${mode === 'kana-to-romaji' ? 'active' : ''}`} onClick={() => setMode('kana-to-romaji')}>Kana → Romaji</button>
                  <button className={`setup-btn ${mode === 'romaji-to-kana' ? 'active' : ''}`} onClick={() => setMode('romaji-to-kana')}>Romaji → Kana</button>
                </>
              ) : (
                <>
                  <button className={`setup-btn ${mode === 'jepang-to-arti' || mode === 'kanji-to-arti' ? 'active' : ''}`} onClick={() => setMode(category === 'kanji' ? 'kanji-to-arti' : 'jepang-to-arti')}>Jepang → Arti</button>
                  <button className={`setup-btn ${mode === 'arti-to-jepang' || mode === 'arti-to-kanji' ? 'active' : ''}`} onClick={() => setMode(category === 'kanji' ? 'arti-to-kanji' : 'arti-to-jepang')}>Arti → Jepang</button>
                </>
              )}
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

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    let grade = ''; let emoji = '';
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
                <span className="review-question">{getQuestionText(item.question)}</span>
                <span className="review-answer">
                  {item.isCorrect ? '✅' : '❌'} {getOptionText(item.selected)}
                </span>
                {!item.isCorrect && (
                  <span className="review-correct">Benar: {getOptionText(item.question)}</span>
                )}
              </div>
            ))}
          </div>

          <div className="result-actions">
            <button className="start-btn" onClick={startQuiz}>Ulangi Kuis 🔄</button>
            <button className="setup-btn back-btn" onClick={() => setStarted(false)}>Kembali ke Menu</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

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
          onClick={() => (mode === 'kana-to-romaji' || mode === 'jepang-to-arti' || mode === 'kanji-to-arti') && speak(getAudioText(currentQ.correct))}
          title="Klik untuk mendengar"
        >
          {getQuestionText(currentQ.correct)}
          {(mode === 'kana-to-romaji' || mode === 'jepang-to-arti' || mode === 'kanji-to-arti') && <span className="question-audio-hint">🔊</span>}
        </span>
        <p className="question-prompt">Pilih jawaban yang paling tepat!</p>
      </div>

      <div className="quiz-options">
        {currentQ.options.map(option => {
          let btnClass = 'option-btn glass-panel';
          if (selectedAnswer) {
            if (option.id === currentQ.correct.id) btnClass += ' correct';
            else if (option.id === selectedAnswer.id) btnClass += ' wrong';
          }
          return (
            <button key={option.id} className={btnClass} onClick={() => handleAnswer(option)}>
              {getOptionText(option)}
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
