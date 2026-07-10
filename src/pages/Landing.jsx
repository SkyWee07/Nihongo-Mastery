import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const features = [
  { icon: '🆓', title: 'Sepenuhnya Gratis', desc: 'Tanpa biaya tersembunyi. Belajar tanpa batas, selamanya.' },
  { icon: '✍️', title: 'Latihan Menulis', desc: 'Kanvas interaktif dengan panduan stroke order untuk setiap huruf.' },
  { icon: '🎯', title: 'Kuis Interaktif', desc: 'Uji pemahamanmu dengan kuis pilihan ganda dan sistem skor.' },
  { icon: '🔊', title: 'Audio Pengucapan', desc: 'Dengarkan cara baca setiap huruf dan kosakata langsung di browser.' },
  { icon: '📴', title: 'Bisa Offline', desc: 'Semua materi tersimpan lokal. Belajar di mana saja tanpa internet.' },
  { icon: '📱', title: 'Mobile Friendly', desc: 'Tampilan responsif sempurna di HP, tablet, dan desktop.' },
];

const roadmapSteps = [
  { level: 'N5', title: 'Pemula', desc: 'Hiragana, Katakana, Kosakata & Tata Bahasa Dasar', color: '#22c55e' },
  { level: 'N4', title: 'Dasar Lanjut', desc: 'Kanji Dasar, Percakapan Sehari-hari', color: '#3b82f6' },
  { level: 'N3', title: 'Menengah', desc: 'Kosakata Kompleks, Membaca Artikel', color: '#8b5cf6' },
  { level: 'N2', title: 'Mahir', desc: 'Bahasa Bisnis, Membaca Koran', color: '#f59e0b' },
  { level: 'N1', title: 'Native', desc: 'Penguasaan Akademik & Literatur', color: '#ef4444' },
];

export default function Landing() {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]));
          }
        });
      },
      { threshold: 0.15 }
    );

    sectionRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const isVisible = (name) => visibleSections.has(name);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-orb orb-1"></div>
        <div className="hero-bg-orb orb-2"></div>
        <div className="hero-bg-orb orb-3"></div>
        
        <div className="hero-content">
          <span className="hero-badge">⛩️ 100% Gratis & Open Source</span>
          <h1 className="hero-title">
            <span className="gradient-text">Kuasai Bahasa Jepang</span>
            <br />
            dari Nol Hingga Mahir
          </h1>
          <p className="hero-subtitle">
            Platform pembelajaran bahasa Jepang terlengkap — dari Hiragana hingga JLPT N1.
            Dengan materi interaktif, kuis, latihan menulis, dan audio pengucapan.
          </p>
          <div className="hero-actions">
            <Link to="/learn" className="cta-btn primary">
              Mulai Belajar 🚀
            </Link>
            <Link to="/hiragana" className="cta-btn secondary">
              Coba Hiragana
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">208+</span>
              <span className="stat-label">Huruf Kana</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">5</span>
              <span className="stat-label">Level JLPT</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">∞</span>
              <span className="stat-label">Kuis Gratis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className={`features-section ${isVisible('features') ? 'visible' : ''}`}
        data-section="features"
        ref={el => sectionRefs.current[0] = el}
      >
        <h2 className="section-title">Kenapa Nihongo Mastery?</h2>
        <p className="section-subtitle">Dirancang khusus untuk pembelajaran mandiri yang efektif</p>
        <div className="features-grid">
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="feature-card glass-panel"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="feature-icon">{feat.icon}</span>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section 
        className={`preview-section ${isVisible('preview') ? 'visible' : ''}`}
        data-section="preview"
        ref={el => sectionRefs.current[1] = el}
      >
        <h2 className="section-title">Belajar Dengan Cara Interaktif</h2>
        <p className="section-subtitle">Setiap huruf memiliki audio, romaji, dan latihan menulis</p>
        <div className="preview-cards">
          <div className="preview-card glass-panel">
            <div className="preview-kana">あ</div>
            <div className="preview-romaji">a</div>
            <div className="preview-label">🔊 Klik untuk dengar</div>
          </div>
          <div className="preview-card glass-panel">
            <div className="preview-kana">カ</div>
            <div className="preview-romaji">ka</div>
            <div className="preview-label">✍️ Latihan menulis</div>
          </div>
          <div className="preview-card glass-panel">
            <div className="preview-kana">漢</div>
            <div className="preview-romaji">kan</div>
            <div className="preview-label">📚 Kanji (segera)</div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section 
        className={`roadmap-section ${isVisible('roadmap') ? 'visible' : ''}`}
        data-section="roadmap"
        ref={el => sectionRefs.current[2] = el}
      >
        <h2 className="section-title">Roadmap Belajar</h2>
        <p className="section-subtitle">Perjalanan terstruktur dari pemula hingga native speaker</p>
        <div className="roadmap-timeline">
          {roadmapSteps.map((step, i) => (
            <div 
              key={i} 
              className="timeline-item"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div className="timeline-dot" style={{ background: step.color, boxShadow: `0 0 20px ${step.color}50` }}></div>
              <div className="timeline-content glass-panel">
                <span className="timeline-level" style={{ color: step.color }}>{step.level}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className={`cta-section ${isVisible('cta') ? 'visible' : ''}`}
        data-section="cta"
        ref={el => sectionRefs.current[3] = el}
      >
        <div className="cta-content glass-panel">
          <h2>Siap Memulai Perjalananmu?</h2>
          <p>Tidak perlu daftar, tidak perlu bayar. Langsung belajar sekarang.</p>
          <Link to="/learn" className="cta-btn primary large">
            Mulai Sekarang — Gratis! ⛩️
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <p>⛩️ <strong>Nihongo Mastery</strong> — Platform Belajar Bahasa Jepang Open Source</p>
          <p className="footer-credits">
            Data: JMdict/KANJIDIC (CC), KanjiVG (CC), Tatoeba (CC) | 
            Dibuat oleh Skywee untuk semua pelajar bahasa Jepang
          </p>
          <div className="footer-links">
            <a href="https://github.com/SkyWee07/Nihongo-Mastery" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
