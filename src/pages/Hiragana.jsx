import { useState, useEffect, useRef } from 'react';
import hiraganaData from '../data/hiraganaData.json';
import './Hiragana.css';

export default function Hiragana() {
  const [showRomaji, setShowRomaji] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [voicesReady, setVoicesReady] = useState(false);
  const japaneseVoiceRef = useRef(null);

  // Muat voices saat komponen pertama kali tampil
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Cari voice Jepang yang tersedia
        const jpVoice = voices.find(v => v.lang.startsWith('ja'));
        japaneseVoiceRef.current = jpVoice || null;
        setVoicesReady(true);
      }
    };

    if ('speechSynthesis' in window) {
      loadVoices();
      // Chrome memuat voices secara asinkron, jadi kita perlu listener
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
    
    // Cancel utterance yang sedang berjalan
    window.speechSynthesis.cancel();

    // Beri sedikit delay setelah cancel agar tidak bentrok
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(kana);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      utterance.volume = 1;
      
      // Gunakan voice Jepang spesifik jika tersedia
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
        <h1>Hiragana (ひらがな)</h1>
        <p>Pelajari dan hafalkan seluruh karakter Hiragana. Klik kartu untuk mendengar pengucapannya!</p>
        
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

      {activeTab === 'basic' && renderGrid(hiraganaData.basic)}
      {activeTab === 'dakuon' && renderGrid(hiraganaData.dakuon)}
      {activeTab === 'yoon' && renderGrid(hiraganaData.yoon, true)}
    </div>
  );
}
