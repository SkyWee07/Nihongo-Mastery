import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '🆓', title: 'Sepenuhnya Gratis', desc: 'Tanpa biaya tersembunyi. Belajar tanpa batas, selamanya.' },
  { icon: '✍️', title: 'Latihan Menulis', desc: 'Kanvas interaktif dengan panduan stroke order untuk setiap huruf.' },
  { icon: '🎯', title: 'Kuis Interaktif', desc: 'Uji pemahamanmu dengan kuis pilihan ganda dan sistem skor.' },
  { icon: '🔊', title: 'Audio Pengucapan', desc: 'Dengarkan cara baca setiap huruf dan kosakata langsung di browser.' },
  { icon: '🎬', title: 'Video Pembelajaran', desc: 'Tonton koleksi video kurasi terbaik untuk mempercepat pemahamanmu.' },
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
    <div className="w-full overflow-x-hidden">
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-30px) scale(1.05); }
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes slideInLeft {
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>

      {/* Navbar (Landing Page Version) */}
      <nav className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 mx-auto mt-2 md:mt-6 w-[calc(100%-1rem)] md:w-[calc(100%-2rem)] max-w-7xl sticky top-2 md:top-6 z-[100] bg-bg-dark/70 backdrop-blur-xl border border-white/10 rounded-full shadow-lg">
        <div className="text-xl md:text-2xl font-extrabold">
          <Link to="/" className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ⛩️ Nihongo Mastery
          </Link>
        </div>
        <Link to="/learn" className="bg-primary text-white px-5 py-2 rounded-full font-bold text-sm transition-all hover:bg-primary-hover">
          Mulai Belajar 🚀
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center justify-center relative p-6 md:p-8 overflow-hidden">
        <div className="absolute rounded-full blur-[60px] md:blur-[80px] opacity-30 md:opacity-40 animate-[float_8s_ease-in-out_infinite] bg-indigo-500 w-[250px] h-[250px] md:w-[400px] md:h-[400px] -top-[100px] -left-[100px]" style={{ animationDelay: '0s' }}></div>
        <div className="absolute rounded-full blur-[60px] md:blur-[80px] opacity-30 md:opacity-40 animate-[float_8s_ease-in-out_infinite] bg-pink-500 w-[200px] h-[200px] md:w-[300px] md:h-[300px] -bottom-[50px] -right-[50px]" style={{ animationDelay: '2s' }}></div>
        <div className="absolute rounded-full blur-[60px] md:blur-[80px] opacity-30 md:opacity-40 animate-[float_8s_ease-in-out_infinite] bg-green-500 w-[150px] h-[150px] md:w-[250px] md:h-[250px] top-[40%] right-[20%]" style={{ animationDelay: '4s' }}></div>
        
        <div className="text-center max-w-[800px] relative z-[1]">
          <span className="inline-block bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 py-2 px-4 md:px-5 rounded-full text-xs md:text-sm font-semibold mb-6 animate-[fadeInDown_0.8s_ease]">
            ⛩️ 100% Gratis & Open Source
          </span>
          <h1 className="text-3xl md:text-[4rem] font-extrabold leading-[1.15] mb-6 text-text-main animate-[fadeInDown_0.8s_ease_0.2s_both]">
            <span className="bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 bg-[length:200%_200%] bg-clip-text text-transparent animate-[gradientShift_4s_ease_infinite]">Kuasai Bahasa Jepang</span>
            <br />
            dari Nol Hingga Mahir
          </h1>
          <p className="text-base md:text-lg text-text-muted max-w-[600px] mx-auto mb-10 leading-relaxed animate-[fadeInDown_0.8s_ease_0.4s_both]">
            Platform pembelajaran bahasa Jepang terlengkap — dari Hiragana hingga JLPT N1.
            Dengan materi interaktif, kuis, latihan menulis, dan audio pengucapan.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12 animate-[fadeInDown_0.8s_ease_0.6s_both]">
            <Link to="/learn" className="w-full md:w-auto text-center inline-block no-underline py-4 px-10 rounded-full font-bold text-lg md:text-xl transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_5px_25px_rgba(99,102,241,0.4)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(99,102,241,0.6)]">
              Mulai Belajar 🚀
            </Link>
            <Link to="/hiragana" className="w-full md:w-auto text-center inline-block no-underline py-4 px-10 rounded-full font-bold text-lg md:text-xl transition-all duration-300 bg-transparent text-text-main border border-white/10 hover:bg-white/5 hover:border-white/30 hover:-translate-y-1">
              Coba Hiragana
            </Link>
          </div>

          <div className="flex justify-center items-center gap-5 md:gap-8 animate-[fadeInDown_0.8s_ease_0.8s_both]">
            <div className="text-center">
              <span className="block text-2xl md:text-[2rem] font-extrabold text-text-main">208+</span>
              <span className="text-xs md:text-sm text-text-muted">Huruf Kana</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <span className="block text-2xl md:text-[2rem] font-extrabold text-text-main">5</span>
              <span className="text-xs md:text-sm text-text-muted">Level JLPT</span>
            </div>
            <div className="w-px h-10 bg-white/10"></div>
            <div className="text-center">
              <span className="block text-2xl md:text-[2rem] font-extrabold text-text-main">∞</span>
              <span className="text-xs md:text-sm text-text-muted">Kuis Gratis</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        className={`px-4 md:px-8 py-12 md:py-20 transition-all duration-800 ease-out ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        data-section="features"
        ref={el => sectionRefs.current[0] = el}
      >
        <h2 className="text-2xl md:text-[2.2rem] font-extrabold text-center mb-2">Kenapa Nihongo Mastery?</h2>
        <p className="text-center text-text-muted mb-8 md:mb-12 text-sm md:text-base">Dirancang khusus untuk pembelajaran mandiri yang efektif</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-[1000px] mx-auto">
          {features.map((feat, i) => (
            <div 
              key={i} 
              className="glass-panel p-6 md:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="text-4xl block mb-4">{feat.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preview Section */}
      <section 
        className={`px-4 md:px-8 py-12 md:py-20 transition-all duration-800 ease-out ${isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        data-section="preview"
        ref={el => sectionRefs.current[1] = el}
      >
        <h2 className="text-2xl md:text-[2.2rem] font-extrabold text-center mb-2">Belajar Dengan Cara Interaktif</h2>
        <p className="text-center text-text-muted mb-8 md:mb-12 text-sm md:text-base">Setiap huruf memiliki audio, romaji, dan latihan menulis</p>
        <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 md:gap-8">
          <div className="glass-panel p-8 md:p-12 text-center transition-all duration-300 min-w-[200px] w-full max-w-[250px] md:w-auto hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:shadow-[0_15px_40px_rgba(99,102,241,0.2)]">
            <div className="text-6xl md:text-[5rem] font-medium text-text-main mb-2">あ</div>
            <div className="text-2xl text-accent mb-4">a</div>
            <div className="text-sm text-text-muted">🔊 Klik untuk dengar</div>
          </div>
          <div className="glass-panel p-8 md:p-12 text-center transition-all duration-300 min-w-[200px] w-full max-w-[250px] md:w-auto hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:shadow-[0_15px_40px_rgba(99,102,241,0.2)]">
            <div className="text-6xl md:text-[5rem] font-medium text-text-main mb-2">カ</div>
            <div className="text-2xl text-accent mb-4">ka</div>
            <div className="text-sm text-text-muted">✍️ Latihan menulis</div>
          </div>
          <div className="glass-panel p-8 md:p-12 text-center transition-all duration-300 min-w-[200px] w-full max-w-[250px] md:w-auto hover:-translate-y-2 hover:scale-[1.02] hover:border-primary hover:shadow-[0_15px_40px_rgba(99,102,241,0.2)]">
            <div className="text-6xl md:text-[5rem] font-medium text-text-main mb-2">漢</div>
            <div className="text-2xl text-accent mb-4">kan</div>
            <div className="text-sm text-text-muted">📚 Kanji (segera)</div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section 
        className={`px-4 md:px-8 py-12 md:py-20 transition-all duration-800 ease-out ${isVisible('roadmap') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        data-section="roadmap"
        ref={el => sectionRefs.current[2] = el}
      >
        <h2 className="text-2xl md:text-[2.2rem] font-extrabold text-center mb-2">Roadmap Belajar</h2>
        <p className="text-center text-text-muted mb-8 md:mb-12 text-sm md:text-base">Perjalanan terstruktur dari pemula hingga native speaker</p>
        <div className="max-w-[600px] mx-auto relative pl-10">
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-red-500"></div>
          {roadmapSteps.map((step, i) => (
            <div 
              key={i} 
              className={`relative mb-8 opacity-0 -translate-x-5 ${isVisible('roadmap') ? 'animate-[slideInLeft_0.5s_ease_forwards]' : ''}`}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <div className="absolute -left-[34px] top-5 w-4 h-4 rounded-full" style={{ background: step.color, boxShadow: `0 0 20px ${step.color}50` }}></div>
              <div className="glass-panel p-6">
                <span className="font-extrabold text-sm tracking-wider" style={{ color: step.color }}>{step.level}</span>
                <h3 className="text-lg my-1">{step.title}</h3>
                <p className="text-text-muted text-sm">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className={`px-4 md:px-8 py-12 md:py-20 transition-all duration-800 ease-out ${isVisible('cta') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        data-section="cta"
        ref={el => sectionRefs.current[3] = el}
      >
        <div className="glass-panel max-w-[700px] mx-auto p-10 md:p-16 text-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <h2 className="text-2xl md:text-3xl mb-4 font-bold">Siap Memulai Perjalananmu?</h2>
          <p className="text-text-muted mb-8 text-base md:text-lg">Tidak perlu daftar, tidak perlu bayar. Langsung belajar sekarang.</p>
          <Link to="/learn" className="w-full md:w-auto inline-block no-underline py-4 px-10 rounded-full font-bold text-lg transition-all duration-300 bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_5px_25px_rgba(99,102,241,0.4)] hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_10px_40px_rgba(99,102,241,0.6)]">
            Mulai Sekarang — Gratis! ⛩️
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-white/10 text-center">
        <div className="max-w-[1000px] mx-auto">
          <p className="mb-2">⛩️ <strong>Nihongo Mastery</strong> — Platform Belajar Bahasa Jepang Open Source</p>
          <p className="text-text-muted text-xs md:text-sm">
            Data: JMdict/KANJIDIC (CC), KanjiVG (CC), Tatoeba (CC) | 
            Dibuat oleh Skywee untuk semua pelajar bahasa Jepang
          </p>
          <div className="mt-4">
            <a href="https://github.com/SkyWee07/Nihongo-Mastery" target="_blank" rel="noopener noreferrer" className="text-text-muted font-semibold no-underline transition-colors hover:text-text-main">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
