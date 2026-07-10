import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <Link to="/" onClick={() => setIsMenuOpen(false)}>⛩️ Nihongo Mastery</Link>
      </div>
      
      {/* Hamburger Toggle Button */}
      <button 
        className="hamburger-btn" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
      </button>

      {/* Flyout Menu */}
      <div className={`nav-links-container ${isMenuOpen ? 'active' : ''} glass-panel`}>
        <div className="nav-links">
          <Link to="/learn" onClick={() => setIsMenuOpen(false)}>🗺️ Roadmap</Link>
          <Link to="/hiragana" onClick={() => setIsMenuOpen(false)}>あ Hiragana</Link>
          <Link to="/katakana" onClick={() => setIsMenuOpen(false)}>カ Katakana</Link>
          <Link to="/quiz" onClick={() => setIsMenuOpen(false)}>🎯 Kuis Kana</Link>
          <Link to="/kotoba/n5" onClick={() => setIsMenuOpen(false)}>📖 Kotoba N5</Link>
          <Link to="/bunpo/n5" onClick={() => setIsMenuOpen(false)}>✏️ Bunpo N5</Link>
          <Link to="/kanji/n5" onClick={() => setIsMenuOpen(false)}>漢 Kanji N5</Link>
        </div>
      </div>
    </nav>
  );
}
