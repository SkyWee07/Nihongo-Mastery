import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getVideos, addVideo } from '../services/videoService';
import { hasProfanity } from '../utils/profanityFilter';
import './Video.css';

const categoryLabels = {
  'hiragana-katakana': 'Hiragana & Katakana',
  'kosakata': 'Kosakata',
  'tata-bahasa': 'Tata Bahasa',
  'kanji': 'Kanji',
  'budaya': 'Budaya Jepang',
  'jlpt': 'Tips JLPT',
};

const levelLabels = {
  'all': 'Semua Level',
  'n5': 'Level N5',
  'n4': 'Level N4',
  'n3': 'Level N3',
  'n2': 'Level N2',
  'n1': 'Level N1',
  'umum': 'Umum / Dasar',
};

const categoryColors = {
  'hiragana-katakana': '#22c55e',
  'kosakata': '#3b82f6',
  'tata-bahasa': '#8b5cf6',
  'kanji': '#f59e0b',
  'budaya': '#ec4899',
  'jlpt': '#ef4444',
};

// Ekstrak YouTube ID dari berbagai format URL
const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function Video() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeLevel, setActiveLevel] = useState(level || 'all');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 9;
  
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Add Video Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ url: '', title: '', description: '', level: 'n5', category: 'kosakata' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state dengan parameter URL
  useEffect(() => {
    if (level) {
      setActiveLevel(level);
    } else {
      setActiveLevel('all');
    }
    setCurrentPage(1); // Reset ke halaman 1 saat ganti level
  }, [level]);

  // Fetch videos
  const fetchVideosData = async () => {
    setLoading(true);
    try {
      const { data, count } = await getVideos(activeLevel, currentPage, LIMIT);
      setVideos(data);
      setTotalPages(Math.ceil(count / LIMIT) || 1);
    } catch (err) {
      console.error("Gagal memuat video");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosData();
  }, [activeLevel, currentPage]);

  const handleLevelChange = (newLevel) => {
    if (newLevel === 'all') {
      navigate('/video');
    } else {
      navigate(`/video/${newLevel}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const openModal = useCallback((video) => {
    setSelectedVideo(video);
    requestAnimationFrame(() => setModalVisible(true));
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => setSelectedVideo(null), 300);
  }, []);

  // Handle Add Video Submit
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('Anda harus login untuk menambahkan video.');
      return;
    }

    const { url, title, description, level: vLevel, category } = formData;
    
    if (!url || !title) {
      setFormError('URL dan Judul wajib diisi.');
      return;
    }

    const youtubeId = extractYouTubeId(url);
    if (!youtubeId) {
      setFormError('URL YouTube tidak valid.');
      return;
    }

    if (hasProfanity(title) || hasProfanity(description)) {
      setFormError('⚠️ Ditolak: Judul atau deskripsi mengandung kata-kata yang tidak pantas.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addVideo({
        youtube_id: youtubeId,
        title: title.trim(),
        description: description.trim(),
        level: vLevel,
        category,
        added_by: user.id
      });
      
      setFormData({ url: '', title: '', description: '', level: 'n5', category: 'kosakata' });
      setShowAddForm(false);
      
      // Jika berhasil unggah, refresh halaman pertama
      setCurrentPage(1);
      fetchVideosData(); 
    } catch (err) {
      setFormError('Gagal menambahkan video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedVideo) closeModal();
        if (showAddForm) setShowAddForm(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedVideo, showAddForm, closeModal]);

  return (
    <div className="video-page">
      <section className="video-header">
        <div className="video-header-glow" />
        <h1 className="video-title">🎬 Video Pembelajaran (ビデオ)</h1>
        <p className="video-subtitle">
          Tonton video pilihan dari YouTube untuk mempercepat proses belajar. 
          Pilih level JLPT Anda atau tambahkan video favoritmu ke koleksi!
        </p>
      </section>

      {/* Tabs Level */}
      <nav className="video-categories">
        <div className="video-categories-track">
          {Object.entries(levelLabels).map(([key, label]) => (
            <button
              key={key}
              className={`video-cat-tab ${activeLevel === key ? 'active' : ''}`}
              onClick={() => handleLevelChange(key)}
            >
              <span className="video-cat-label">{label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      <div className="video-actions">
        <button className="add-video-btn" onClick={() => setShowAddForm(true)}>
          ➕ Kontribusi Video Baru
        </button>
      </div>

      {/* Video Grid */}
      <section className="video-grid-section">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <div className="video-grid">
              {videos.map((video, index) => (
                <article
                  key={video.id}
                  className="video-card glass-panel"
                  onClick={() => openModal(video)}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className="video-card-thumb">
                    <img
                      src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
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
                  </div>
                  <div className="video-card-body">
                    <div className="video-card-meta">
                      <span
                        className="video-category-badge"
                        style={{ 
                          background: categoryColors[video.category] + '22', 
                          color: categoryColors[video.category] || '#94A3B8', 
                          borderColor: categoryColors[video.category] + '44' 
                        }}
                      >
                        {categoryLabels[video.category] || video.category}
                      </span>
                      {video.profiles && (
                        <span className="video-uploader">👤 {video.profiles.username}</span>
                      )}
                    </div>
                    <h3 className="video-card-title">{video.title}</h3>
                    <p className="video-card-desc">{video.description}</p>
                  </div>
                </article>
              ))}
            </div>

            {videos.length === 0 && (
              <div className="video-empty">
                <span className="video-empty-icon">🎌</span>
                <p>Belum ada video untuk level ini.</p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  ← Sebelumnya
                </button>
                <span className="page-info">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages}
                  onClick={handleNextPage}
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Add Video Modal Form */}
      {showAddForm && (
        <div className="video-modal-backdrop visible" onClick={() => !isSubmitting && setShowAddForm(false)}>
          <div className="video-modal form-modal glass-panel visible" onClick={(e) => e.stopPropagation()}>
            <div className="video-modal-header">
              <h2>➕ Tambah Video YouTube</h2>
              <button className="video-modal-close" onClick={() => !isSubmitting && setShowAddForm(false)}>
                ✖
              </button>
            </div>
            {!user ? (
              <div className="form-error-msg">Silakan Login terlebih dahulu untuk menambahkan video.</div>
            ) : (
              <form className="add-video-form" onSubmit={handleAddVideo}>
                {formError && <div className="form-error-msg">{formError}</div>}
                
                <div className="form-group">
                  <label>URL / Link YouTube</label>
                  <input 
                    type="url" 
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Judul Video</label>
                  <input 
                    type="text" 
                    maxLength={100}
                    placeholder="Judul yang mendeskripsikan video..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Deskripsi Singkat (Opsional)</label>
                  <textarea 
                    maxLength={200}
                    placeholder="Video ini tentang apa..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Level JLPT</label>
                    <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                      <option value="umum">Umum</option>
                      <option value="n5">N5</option>
                      <option value="n4">N4</option>
                      <option value="n3">N3</option>
                      <option value="n2">N2</option>
                      <option value="n1">N1</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Kategori</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengunggah...' : 'Bagikan Video'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Video Player Modal */}
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
                ✖
              </button>
            </div>
            <div className="video-modal-player">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="video-iframe"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
