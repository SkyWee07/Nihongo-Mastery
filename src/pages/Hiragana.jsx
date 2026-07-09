import { useState } from 'react';
import hiraganaData from '../data/hiraganaData.json';
import './Hiragana.css';

export default function Hiragana() {
  const [showRomaji, setShowRomaji] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const renderGrid = (data, isYoon = false) => (
    <div className={`kana-grid ${isYoon ? 'yoon-grid' : ''}`}>
      {data.map((char, index) => {
        if (!char.kana) return <div key={`empty-${index}`} className="kana-card empty"></div>;
        return (
          <div key={char.id} className="kana-card glass-panel">
            <span className="kana-char">{char.kana}</span>
            <span className={`kana-romaji ${showRomaji ? 'visible' : ''}`}>
              {char.romaji}
            </span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="kana-container">
      <div className="kana-header glass-panel">
        <h1>Hiragana (ひらがな)</h1>
        <p>Pelajari dan hafalkan seluruh karakter Hiragana. Gunakan fitur sembunyikan Romaji untuk melatih ingatanmu!</p>
        
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
