import { useState, useEffect, useRef } from 'react';
import katakanaData from '../data/katakanaData.json';
import './Katakana.css';

export default function Katakana() {
  const [showRomaji, setShowRomaji] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [voicesReady, setVoicesReady] = useState(false);
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
    <div className={`kana-grid ${isYoon ? 'yoon-grid' : ''}`}>
      {data.map((char, index) => {
        if (!char.kana) return <div key={`empty-${index}`} className="kana-card empty"></div>;
        return (
          <div 
            key={char.id} 
            className="kana-card glass-panel" 
            onClick={() => speakKana(char.kana)}
            title="Klik untuk mendengar pengucapan"
          >
            <span className="kana-char">{char.kana}</span>
            <span className={`kana-romaji ${showRomaji ? 'visible' : ''}`}>
              {char.romaji}
            </span>
            <span className="audio-icon">🔊</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="kana-container">
      <div className="kana-header glass-panel">
        <h1>Katakana (カタカナ)</h1>
        <p>Katakana digunakan untuk menulis kata serapan asing, nama, dan istilah teknis. Klik kartu untuk mendengar pengucapannya!</p>
        
        {!voicesReady && (
          <p className="voice-warning">⚠️ Suara belum siap. Pastikan browser mendukung Text-to-Speech dan bahasa Jepang sudah terinstal di Windows.</p>
        )}

        <button 
          className="toggle-btn"
          onClick={() => setShowRomaji(!showRomaji)}
        >
          {showRomaji ? 'Sembunyikan Romaji' : 'Tampilkan Romaji'}
        </button>

        <div className="kana-tabs">
          <button 
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`} 
            onClick={() => setActiveTab('basic')}
          >
            Seion (Dasar)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'dakuon' ? 'active' : ''}`} 
            onClick={() => setActiveTab('dakuon')}
          >
            Dakuon (Teng-teng/Maru)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'yoon' ? 'active' : ''}`} 
            onClick={() => setActiveTab('yoon')}
          >
            Yōon (Kombinasi)
          </button>
        </div>
      </div>

      {activeTab === 'basic' && renderGrid(katakanaData.basic)}
      {activeTab === 'dakuon' && renderGrid(katakanaData.dakuon)}
      {activeTab === 'yoon' && renderGrid(katakanaData.yoon, true)}
    </div>
  );
}
