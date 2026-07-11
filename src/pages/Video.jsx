import { useState, useEffect, useCallback } from 'react';
import './Video.css';

const categories = [
  { id: 'all', label: 'Semua', icon: '📚' },
  { id: 'hiragana-katakana', label: 'Hiragana & Katakana', icon: 'あ' },
  { id: 'kosakata', label: 'Kosakata', icon: '📝' },
  { id: 'tata-bahasa', label: 'Tata Bahasa', icon: '📖' },
  { id: 'kanji', label: 'Kanji', icon: '漢' },
  { id: 'budaya', label: 'Budaya Jepang', icon: '🏯' },
  { id: 'jlpt', label: 'Tips JLPT', icon: '🎯' },
];

const videos = [
  {
    id: '6p9Il_j0zjc',
    title: 'Learn ALL Hiragana in 1 Hour',
    description: 'Pelajari semua huruf Hiragana dalam 1 jam! Cocok untuk pemula yang ingin menguasai dasar penulisan Jepang.',
    category: 'hiragana-katakana',
    channel: 'JapanesePod101',
    duration: '1:00:00',
  },
  {
    id: 's6DKRp4dmKY',
    title: 'Learn ALL Katakana in 1 Hour',
    description: 'Kuasai semua huruf Katakana dengan metode yang mudah diikuti. Lengkap dengan contoh pengucapan.',
    category: 'hiragana-katakana',
    channel: 'JapanesePod101',
    duration: '1:00:00',
  },
  {
    id: 'DaHrGSIhJBo',
    title: '800 Japanese Words for Everyday Life',
    description: '800 kosakata Jepang yang paling sering digunakan dalam kehidupan sehari-hari. Wajib dihafal!',
    category: 'kosakata',
    channel: 'JapanesePod101',
    duration: '2:26:24',
  },
  {
    id: 'DRe7pxFwjXQ',
    title: '1500 Japanese Words You Need to Know',
    description: 'Kumpulan 1500 kata penting bahasa Jepang yang akan meningkatkan kemampuan berbicara dan mendengarmu.',
    category: 'kosakata',
    channel: 'JapanesePod101',
    duration: '3:30:00',
  },
  {
    id: 'UBBjp9a6wXM',
    title: 'Japanese Grammar Basics',
    description: 'Dasar-dasar tata bahasa Jepang yang harus kamu ketahui. Penjelasan sederhana dan mudah dipahami.',
    category: 'tata-bahasa',
    channel: 'JapanesePod101',
    duration: '1:15:00',
  },
  {
    id: 'o3KMr5LIUHE',
    title: 'Essential Japanese Grammar Patterns',
    description: 'Pola-pola tata bahasa esensial yang sering muncul dalam percakapan sehari-hari dan ujian JLPT.',
    category: 'tata-bahasa',
    channel: 'JapanesePod101',
    duration: '0:45:00',
  },
  {
    id: 'WnSBUCbwfCM',
    title: 'Learn 200 Kanji for JLPT N5 & N4',
    description: 'Pelajari 200 Kanji yang dibutuhkan untuk lulus ujian JLPT N5 dan N4. Termasuk cara tulis dan artinya.',
    category: 'kanji',
    channel: 'JapanesePod101',
    duration: '2:00:00',
  },
  {
    id: 'LFNfVj49MH8',
    title: 'Kanji Radicals - Building Blocks',
    description: 'Pahami radikal Kanji sebagai blok pembangun. Teknik ini akan mempermudah menghafal ribuan Kanji.',
    category: 'kanji',
    channel: 'JapanesePod101',
    duration: '0:35:00',
  },
  {
    id: 'xumH__ay9Ww',
    title: 'Japanese Culture 101',
    description: 'Pengenalan budaya Jepang yang komprehensif. Dari tradisi kuno hingga budaya pop modern.',
    category: 'budaya',
    channel: 'JapanesePod101',
    duration: '0:50:00',
  },
  {
    id: 'xa2bCJMXMmI',
    title: 'Daily Life in Japan',
    description: 'Intip kehidupan sehari-hari orang Jepang. Pelajari kebiasaan dan etiket penting yang harus kamu tahu.',
    category: 'budaya',
    channel: 'JapanesePod101',
    duration: '0:40:00',
  },
  {
    id: 'dOJPfjr8eIU',
    title: 'How to Pass JLPT N5',
    description: 'Strategi dan tips ampuh untuk lulus ujian JLPT N5. Termasuk rekomendasi buku dan metode belajar.',
    category: 'jlpt',
    channel: 'JapanesePod101',
    duration: '0:30:00',
  },
  {
    id: 'FknmUij6AWo',
    title: 'Japanese Study Tips',
    description: 'Tips belajar bahasa Jepang yang efektif dari para poliglot. Tingkatkan kemampuanmu lebih cepat!',
    category: 'jlpt',
    channel: 'JapanesePod101',
    duration: '0:25:00',
  },
];

const categoryLabels = {
  'hiragana-katakana': 'Hiragana & Katakana',
  'kosakata': 'Kosakata',
  'tata-bahasa': 'Tata Bahasa',
  'kanji': 'Kanji',
  'budaya': 'Budaya Jepang',
  'jlpt': 'Tips JLPT',
};

const categoryColors = {
  'hiragana-katakana': '#22c55e',
  'kosakata': '#3b82f6',
  'tata-bahasa': '#8b5cf6',
  'kanji': '#f59e0b',
  'budaya': '#ec4899',
  'jlpt': '#ef4444',
};

export default function Video() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredVideos = activeCategory === 'all'
    ? videos
    : videos.filter(v => v.category === activeCategory);

  const openModal = useCallback((video) => {
    setSelectedVideo(video);
    requestAnimationFrame(() => setModalVisible(true));
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedVideo(null), 300);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedVideo) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo, closeModal]);

  return (
    <div className="video-page">
      {/* Header */}
      <section className="video-header">
        <div className="video-header-glow" />
        <h1 className="video-title">🎬 Video Pembelajaran (ビデオ)</h1>
        <p className="video-subtitle">
          Tonton video pilihan dari YouTube untuk mempercepat proses belajar bahasa Jepangmu.
          Semua video dikurasi khusus untuk pelajar Indonesia.
        </p>
      </section>

      {/* Category Tabs */}
      <nav className="video-categories">
        <div className="video-categories-track">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`video-cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="video-cat-icon">{cat.icon}</span>
              <span className="video-cat-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Video Grid */}
      <section className="video-grid-section">
        <div className="video-grid">
          {filteredVideos.map((video, index) => (
            <article
              key={video.id}
              className="video-card glass-panel"
              onClick={() => openModal(video)}
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="video-card-thumb">
                <img
                  src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  loading="lazy"
                  className="video-thumb-img"
                />
                <div className="video-play-overlay">
                  <div className="video-play-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="video-duration-badge">{video.duration}</span>
              </div>
              <div className="video-card-body">
                <div className="video-card-meta">
                  <span
                    className="video-category-badge"
                    style={{ background: categoryColors[video.category] + '22', color: categoryColors[video.category], borderColor: categoryColors[video.category] + '44' }}
                  >
                    {categoryLabels[video.category]}
                  </span>
                </div>
                <h3 className="video-card-title">{video.title}</h3>
                <p className="video-card-desc">{video.description}</p>
                <span className="video-card-channel">📺 {video.channel}</span>
              </div>
            </article>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="video-empty">
            <span className="video-empty-icon">🎌</span>
            <p>Belum ada video untuk kategori ini.</p>
          </div>
        )}
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div
          className={`video-modal-backdrop ${modalVisible ? 'visible' : ''}`}
          onClick={closeModal}
        >
          <div
            className={`video-modal glass-panel ${modalVisible ? 'visible' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-modal-header">
              <h2 className="video-modal-title">{selectedVideo.title}</h2>
              <button className="video-modal-close" onClick={closeModal} aria-label="Close modal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="video-modal-player">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            </div>
            <div className="video-modal-info">
              <span
                className="video-category-badge"
                style={{ background: categoryColors[selectedVideo.category] + '22', color: categoryColors[selectedVideo.category], borderColor: categoryColors[selectedVideo.category] + '44' }}
              >
                {categoryLabels[selectedVideo.category]}
              </span>
              <p className="video-modal-desc">{selectedVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
