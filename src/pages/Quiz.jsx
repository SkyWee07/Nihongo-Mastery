import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { saveQuizScore } from '../services/progressService';
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
  const { user } = useAuth();
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

  const nextQuestion = async () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      // Save score to DB
      if (user) {
        try {
          const finalScore = selectedAnswer?.id === questions[currentIndex].correct.id ? score + 1 : score;
          await saveQuizScore(user.id, level, category, finalScore);
        } catch (err) {
          console.error('Failed to save score', err);
        }
      }
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
      <div className="flex flex-col items-center gap-8 max-w-[700px] mx-auto w-full">
        <div className="glass-panel p-6 md:p-12 text-center w-full">
          <h1 className="text-3xl md:text-4xl mb-2 bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent font-bold">🎯 Kuis Interaktif</h1>
          <p className="text-text-muted mb-8">Uji kemampuan Kana, Kosakata, dan Kanji kamu secara acak!</p>

          <div className="mb-6 text-left">
            <label className="block font-semibold mb-3 text-text-main">Pilih Kategori:</label>
            <div className="flex gap-3 flex-wrap">
              <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${category === 'kana' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setCategory('kana')}>あ Kana</button>
              <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${category === 'kotoba' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setCategory('kotoba')}>📝 Kosakata</button>
              <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${category === 'kanji' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setCategory('kanji')}>漢 Kanji</button>
            </div>
          </div>

          <div className="mb-6 text-left">
            <label className="block font-semibold mb-3 text-text-main">Pilih Level/Materi:</label>
            <div className="flex gap-3 flex-wrap">
              {category === 'kana' ? (
                <>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'hiragana' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('hiragana')}>Hiragana</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'katakana' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('katakana')}>Katakana</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'mixed' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('mixed')}>Campur</button>
                </>
              ) : (
                <>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'n5' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('n5')}>JLPT N5</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'n4' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('n4')}>JLPT N4</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'n3' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('n3')}>JLPT N3</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'n2' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('n2')}>JLPT N2</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'n1' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('n1')}>JLPT N1</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${level === 'mixed' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setLevel('mixed')}>Campur Semua</button>
                </>
              )}
            </div>
          </div>

          <div className="mb-6 text-left">
            <label className="block font-semibold mb-3 text-text-main">Mode Kuis:</label>
            <div className="flex gap-3 flex-wrap">
              {category === 'kana' ? (
                <>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${mode === 'kana-to-romaji' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setMode('kana-to-romaji')}>Kana → Romaji</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${mode === 'romaji-to-kana' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setMode('romaji-to-kana')}>Romaji → Kana</button>
                </>
              ) : (
                <>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${mode === 'jepang-to-arti' || mode === 'kanji-to-arti' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setMode(category === 'kanji' ? 'kanji-to-arti' : 'jepang-to-arti')}>Jepang → Arti</button>
                  <button className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${mode === 'arti-to-jepang' || mode === 'arti-to-kanji' ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setMode(category === 'kanji' ? 'arti-to-kanji' : 'arti-to-jepang')}>Arti → Jepang</button>
                </>
              )}
            </div>
          </div>

          <div className="mb-6 text-left">
            <label className="block font-semibold mb-3 text-text-main">Jumlah Soal:</label>
            <div className="flex gap-3 flex-wrap">
              {[10, 20, 30, 50].map(n => (
                <button key={n} className={`flex-1 min-w-[80px] bg-transparent py-2.5 px-4 rounded-xl font-semibold cursor-pointer transition-all duration-300 border ${questionCount === n ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`} onClick={() => setQuestionCount(n)}>{n}</button>
              ))}
            </div>
          </div>

          <button className="mt-6 w-full md:w-auto bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none py-4 px-10 rounded-xl text-lg font-bold cursor-pointer transition-all duration-300 shadow-[0_5px_20px_rgba(99,102,241,0.4)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(99,102,241,0.6)]" onClick={startQuiz}>Mulai Kuis! 🚀</button>
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
      <div className="flex flex-col items-center gap-8 max-w-[700px] mx-auto w-full">
        <div className="glass-panel p-6 md:p-12 text-center w-full">
          <h1 className="text-3xl md:text-4xl mb-4">{emoji} {grade}</h1>
          <div className="flex justify-center gap-8 mb-8">
            <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">{score}/{questions.length}</span>
            <span className="text-4xl md:text-5xl font-extrabold text-text-muted">{percentage}%</span>
          </div>

          <div className="text-left my-8">
            <h2 className="text-xl mb-4 font-semibold text-text-main">Rincian Jawaban:</h2>
            {answerHistory.map((item, i) => (
              <div key={i} className={`flex items-center gap-4 p-3 md:p-4 rounded-xl mb-2 flex-wrap ${item.isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                <span className="font-bold text-text-muted min-w-[30px]">#{i + 1}</span>
                <span className="text-2xl min-w-[40px] text-text-main">{getQuestionText(item.question)}</span>
                <span className="flex-1 text-text-main">
                  {item.isCorrect ? '✅' : '❌'} {getOptionText(item.selected)}
                </span>
                {!item.isCorrect && (
                  <span className="w-full text-green-500 font-semibold text-sm pl-[calc(30px+40px+2rem)] md:pl-[calc(30px+40px+2rem)] pl-0 mt-1 md:mt-0">Benar: {getOptionText(item.question)}</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center flex-wrap">
            <button className="w-full md:w-auto bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none py-3.5 px-8 rounded-xl text-base font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_5px_15px_rgba(99,102,241,0.5)]" onClick={startQuiz}>Ulangi Kuis 🔄</button>
            <button className="w-full md:w-auto bg-transparent border border-text-muted text-text-muted py-3.5 px-8 rounded-xl text-base font-bold cursor-pointer transition-all duration-300 hover:border-text-main hover:text-text-main" onClick={() => setStarted(false)}>Kembali ke Menu</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8 max-w-[700px] mx-auto w-full">
      <div className="glass-panel w-full p-4 md:p-6">
        <div className="flex justify-between font-semibold mb-2 text-text-main text-sm md:text-base">
          <span>Soal {currentIndex + 1} / {questions.length}</span>
          <span>Skor: {score}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-400 ease-out" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-12 text-center w-full">
        <span 
          className="text-[4rem] md:text-[6rem] font-medium text-text-main block mb-4 cursor-pointer relative" 
          onClick={() => (mode === 'kana-to-romaji' || mode === 'jepang-to-arti' || mode === 'kanji-to-arti') && speak(getAudioText(currentQ.correct))}
          title="Klik untuk mendengar"
        >
          {getQuestionText(currentQ.correct)}
          {(mode === 'kana-to-romaji' || mode === 'jepang-to-arti' || mode === 'kanji-to-arti') && <span className="text-xl absolute -bottom-1.5 right-[calc(50%-40px)] md:right-[calc(50%-60px)] opacity-50">🔊</span>}
        </span>
        <p className="text-text-muted text-base md:text-lg">Pilih jawaban yang paling tepat!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
        {currentQ.options.map(option => {
          let btnClass = 'glass-panel p-4 md:p-6 text-lg md:text-2xl font-semibold text-text-main cursor-pointer border-2 border-transparent transition-all duration-300 text-center hover:-translate-y-1 hover:border-primary hover:shadow-[0_5px_20px_rgba(99,102,241,0.3)] ';
          if (selectedAnswer) {
            if (option.id === currentQ.correct.id) btnClass += ' border-green-500 bg-green-500/15 shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:-translate-y-0 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]';
            else if (option.id === selectedAnswer.id) btnClass += ' border-red-500 bg-red-500/15 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:-translate-y-0 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]';
            else btnClass += ' hover:-translate-y-0 hover:border-transparent hover:shadow-none'; // disable hover effects for unselected wrong answers when something is selected
          }
          return (
            <button key={option.id} className={btnClass} onClick={() => handleAnswer(option)}>
              {getOptionText(option)}
            </button>
          );
        })}
      </div>

      {selectedAnswer && (
        <button className="w-full md:w-auto bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-none py-3.5 px-8 rounded-xl text-base font-bold cursor-pointer transition-all duration-300 shadow-[0_5px_15px_rgba(99,102,241,0.5)] hover:-translate-y-1" onClick={nextQuestion}>
          {currentIndex + 1 >= questions.length ? 'Lihat Hasil 📊' : 'Soal Berikutnya →'}
        </button>
      )}
    </div>
  );
}
