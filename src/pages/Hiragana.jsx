import { useState, useEffect, useRef } from 'react';
import hiraganaData from '../data/hiraganaData.json';
import WritingCanvas from '../components/WritingCanvas';
import SpeechPracticeModal from '../components/SpeechPracticeModal';

export default function Hiragana() {
  const [showRomaji, setShowRomaji] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [voicesReady, setVoicesReady] = useState(false);
  const [writingChar, setWritingChar] = useState(null);
  const [speechTarget, setSpeechTarget] = useState(null);
  const japaneseVoiceRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const jpVoice = voices.find(v => v.lang.startsWith('ja'));
        japaneseVoiceRef.current = jpVoice || null;
        setVoicesReady(true);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speakKana = (kana) => {
    if (!('speechSynthesis' in window) || !kana) return;
    
    window.speechSynthesis.cancel();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(kana);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.volume = 1;
      
      if (japaneseVoiceRef.current) {
        utterance.voice = japaneseVoiceRef.current;
      }

      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const renderGrid = (data, isYoon = false) => (
    <div className={`grid gap-4 ${isYoon ? 'grid-cols-3 md:grid-cols-3' : 'grid-cols-5 md:grid-cols-5 max-sm:grid-cols-4 max-[400px]:grid-cols-3'}`}>
      {data.map((char, index) => {
        if (!char.kana) return <div key={`empty-${index}`} className="bg-transparent border-none cursor-default"></div>;
        return (
          <div 
            key={char.id} 
            className="group flex flex-col items-center justify-center p-4 md:p-6 aspect-square transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer glass-panel border border-white/5 border-t-white/10 border-l-white/10 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_15px_rgba(244,63,94,0.2)] hover:border-rose-500/50"
            onClick={() => speakKana(char.kana)}
            title="Klik untuk mendengar pengucapan"
          >
            <span className="text-4xl md:text-5xl font-medium text-text-main mb-2">{char.kana}</span>
            <span className={`text-lg md:text-xl text-accent transition-opacity duration-300 ${showRomaji ? 'opacity-100' : 'opacity-0'}`}>
              {char.romaji}
            </span>
            <div className="flex gap-2 mt-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-xs opacity-70">🔊</span>
              <button 
                className="bg-white/10 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:bg-primary hover:border-primary hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeechTarget(char);
                }}
                title="Latihan Pengucapan"
              >
                🎙️
              </button>
              <button 
                className="bg-white/10 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center text-xs cursor-pointer transition-all duration-200 hover:bg-primary hover:border-primary hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                onClick={(e) => {
                  e.stopPropagation();
                  setWritingChar(char.kana);
                }}
                title="Latihan Menulis"
              >
                ✍️
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto px-4 md:px-0">
      <div className="glass-panel p-8 text-center rounded-[20px]">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Hiragana (ひらがな)</h1>
        <p className="text-text-muted">Pelajari dan hafalkan seluruh karakter Hiragana. Klik kartu untuk mendengar pengucapannya!</p>
        
        {!voicesReady && (
          <p className="text-amber-500 text-sm mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">⚠️ Suara belum siap. Pastikan browser mendukung Text-to-Speech dan bahasa Jepang sudah terinstal di Windows.</p>
        )}

        <button 
          className="mt-4 bg-primary text-white border-none py-3 px-6 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-hover hover:-translate-y-1"
          onClick={() => setShowRomaji(!showRomaji)}
        >
          {showRomaji ? 'Sembunyikan Romaji' : 'Tampilkan Romaji'}
        </button>

        <div className="flex justify-center gap-4 mt-8 flex-wrap">
          {['basic', 'dakuon', 'yoon'].map((tab) => (
            <button 
              key={tab}
              className={`bg-transparent border px-5 py-2 rounded-lg font-semibold cursor-pointer transition-all duration-300 ${activeTab === tab ? 'bg-primary text-white border-primary' : 'text-text-muted border-text-muted hover:border-text-main hover:text-text-main'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'basic' ? 'Seion (Dasar)' : tab === 'dakuon' ? 'Dakuon (Teng-teng/Maru)' : 'Yōon (Kombinasi)'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'basic' && renderGrid(hiraganaData.basic)}
      {activeTab === 'dakuon' && renderGrid(hiraganaData.dakuon)}
      {activeTab === 'yoon' && renderGrid(hiraganaData.yoon, true)}
      
      {writingChar && (
        <WritingCanvas 
          character={writingChar} 
          onClose={() => setWritingChar(null)} 
        />
      )}
      {speechTarget && (
        <SpeechPracticeModal 
          isOpen={!!speechTarget} 
          onClose={() => setSpeechTarget(null)}
          targetText={speechTarget.kana}
          targetReading={speechTarget.romaji}
          type="kana"
        />
      )}
    </div>
  );
}
