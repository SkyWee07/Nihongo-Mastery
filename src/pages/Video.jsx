import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getVideos, addVideo, updateVideo, deleteVideo } from '../services/videoService';
import { hasProfanity } from '../utils/profanityFilter';

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

// Memoized Video Card component for better performance
const VideoCard = memo(({ video, index, onOpen, onEdit, onDelete, user, categoryColors, categoryLabels }) => (
  <article
    className="glass-panel cursor-pointer overflow-hidden transition-all duration-300 animate-[videoCardIn_0.5s_cubic-bezier(0.16,1,0.3,1)_both] hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-[0_12px_40px_rgba(99,102,241,0.18)] hover:border-indigo-500/20 group"
    onClick={() => onOpen(video)}
    style={{ animationDelay: `${index * 0.06}s` }}
  >
    <div className="relative w-full aspect-video overflow-hidden bg-slate-900/50 video-card-thumb">
      <img
        src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
        alt={video.title}
        loading="lazy"
        className="w-full h-full object-cover block transition-all duration-400 group-hover:scale-[1.06] group-hover:brightness-75"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 z-10 group-hover:opacity-100">
        <div className="video-play-btn w-12 h-12 md:w-14 md:h-14 rounded-full bg-indigo-500/85 backdrop-blur-md flex items-center justify-center text-white shadow-[0_6px_24px_rgba(99,102,241,0.4)] transition-all duration-300 pl-[3px]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px] md:w-7 md:h-7">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
    <div className="p-4 md:p-5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span
          className="text-[0.72rem] font-semibold py-[3px] px-2.5 rounded-full border uppercase tracking-wider"
          style={{ 
            background: categoryColors[video.category] + '22', 
            color: categoryColors[video.category] || '#94A3B8', 
            borderColor: categoryColors[video.category] + '44' 
          }}
        >
          {categoryLabels[video.category] || video.category}
        </span>
        {video.profiles && (
          <span className="text-[0.75rem] text-slate-400 bg-slate-400/10 py-[3px] px-2 rounded-full">👤 {video.profiles.username}</span>
        )}
      </div>
      <h3 className="text-[0.92rem] md:text-base font-bold text-text-main leading-tight line-clamp-2">{video.title}</h3>
      <p className="text-[0.8rem] md:text-[0.85rem] text-text-muted leading-relaxed line-clamp-2">{video.description}</p>
      
      {user && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          <button 
            className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium cursor-pointer border border-transparent transition-all duration-200 bg-white/5 text-text-muted hover:-translate-y-0.5 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/40"
            onClick={() => onEdit(video)}
            title="Edit Video"
          >
            ✏️ Edit
          </button>
          <button 
            className="flex-1 py-1.5 px-2 rounded-md text-xs font-medium cursor-pointer border border-transparent transition-all duration-200 bg-white/5 text-text-muted hover:-translate-y-0.5 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
            onClick={() => onDelete(video.id)}
            title="Hapus Video"
          >
            🗑️ Hapus
          </button>
        </div>
      )}
    </div>
  </article>
));

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
  
  // Add/Edit Video Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
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

  const openEditForm = (video) => {
    setEditingVideo(video);
    setFormData({
      url: `https://www.youtube.com/watch?v=${video.youtube_id}`,
      title: video.title,
      description: video.description || '',
      level: video.level,
      category: video.category
    });
    setFormError('');
    setShowAddForm(true);
  };

  const closeForm = () => {
    if (!isSubmitting) {
      setShowAddForm(false);
      setEditingVideo(null);
      setFormData({ url: '', title: '', description: '', level: 'n5', category: 'kosakata' });
    }
  };

  const handleDeleteVideo = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus video ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    try {
      await deleteVideo(id);
      fetchVideosData(); // Refresh list setelah dihapus
    } catch (err) {
      alert("Gagal menghapus video.");
    }
  };

  // Handle Add/Edit Video Submit
  const handleAddVideo = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('Anda harus login untuk memodifikasi video.');
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
      if (editingVideo) {
        await updateVideo(editingVideo.id, {
          youtube_id: youtubeId,
          title: title.trim(),
          description: description.trim(),
          level: vLevel,
          category
        });
      } else {
        await addVideo({
          youtube_id: youtubeId,
          title: title.trim(),
          description: description.trim(),
          level: vLevel,
          category,
          added_by: user.id
        });
      }
      
      closeForm();
      
      if (!editingVideo) {
        setCurrentPage(1); // Kembali ke hal 1 jika tambah baru
      }
      fetchVideosData(); 
    } catch (err) {
      setFormError(editingVideo ? 'Gagal menyimpan perubahan video.' : 'Gagal menambahkan video.');
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
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-16 min-h-screen">
      <style>
        {`
          @keyframes videoCardIn {
            from {
              opacity: 0;
              transform: translateY(24px) scale(0.97);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .video-card-thumb:hover .video-play-btn {
            transform: scale(1.1);
            background: rgba(99, 102, 241, 1);
          }
        `}
      </style>
      
      <section className="text-center pb-8 pt-4 md:py-12 relative">
        <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.25)_0%,transparent_70%)] pointer-events-none z-0" />
        <h1 className="text-3xl md:text-[2.5rem] font-extrabold text-text-main mb-3 relative z-10 tracking-tight">🎬 Video Pembelajaran (ビデオ)</h1>
        <p className="text-base md:text-[1.1rem] text-text-muted max-w-[600px] mx-auto leading-relaxed relative z-10">
          Tonton video pilihan dari YouTube untuk mempercepat proses belajar. 
          Pilih level JLPT Anda atau tambahkan video favoritmu ke koleksi!
        </p>
      </section>

      {/* Tabs Level */}
      <nav className="my-6 md:mb-10 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 justify-start md:justify-center flex-nowrap p-1 min-w-max">
          {Object.entries(levelLabels).map(([key, label]) => (
            <button
              key={key}
              className={`flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 rounded-full border bg-slate-900/70 backdrop-blur-md text-[0.8rem] md:text-[0.875rem] font-medium font-sans cursor-pointer transition-all duration-300 whitespace-nowrap ${activeLevel === key ? 'bg-primary text-white border-primary shadow-[0_4px_20px_rgba(99,102,241,0.35)]' : 'border-white/10 text-text-muted hover:text-text-main hover:border-indigo-500/30 hover:bg-indigo-500/10'}`}
              onClick={() => handleLevelChange(key)}
            >
              <span className="leading-none">{label}</span>
            </button>
          ))}
        </div>
      </nav>
      
      <div className="flex justify-center mb-8">
        <button className="bg-primary text-white border-none py-3 px-6 rounded-full font-bold cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)]" onClick={() => setShowAddForm(true)}>
          ➕ Kontribusi Video Baru
        </button>
      </div>

      {/* Video Grid */}
      <section className="relative">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {videos.map((video, index) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  index={index} 
                  onOpen={openModal} 
                  onEdit={openEditForm} 
                  onDelete={handleDeleteVideo}
                  user={user}
                  categoryColors={categoryColors}
                  categoryLabels={categoryLabels}
                />
              ))}
            </div>

            {videos.length === 0 && (
              <div className="text-center py-16 px-8 text-text-muted">
                <span className="text-5xl block mb-4">🎌</span>
                <p>Belum ada video untuk level ini.</p>
              </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-12 p-4">
                <button 
                  className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 py-2.5 px-5 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:bg-indigo-500/30 hover:text-white hover:-translate-y-0.5 disabled:bg-white/5 disabled:border-white/10 disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0" 
                  disabled={currentPage === 1}
                  onClick={handlePrevPage}
                >
                  ← Sebelumnya
                </button>
                <span className="text-[0.95rem] text-text-main font-medium">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button 
                  className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 py-2.5 px-5 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:bg-indigo-500/30 hover:text-white hover:-translate-y-0.5 disabled:bg-white/5 disabled:border-white/10 disabled:text-text-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0" 
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

      {/* Add/Edit Video Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 opacity-100 transition-opacity duration-300" onClick={closeForm}>
          <div className="glass-panel w-full max-w-[500px] p-0 rounded-2xl animate-[videoCardIn_0.3s_cubic-bezier(0.16,1,0.3,1)_both]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/10">
              <h2 className="text-lg font-bold text-text-main flex-1 mr-4">{editingVideo ? '✏️ Edit Video' : '➕ Tambah Video YouTube'}</h2>
              <button className="w-10 h-10 rounded-full border border-white/10 bg-white/5 text-text-muted flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30" onClick={closeForm}>
                ✖
              </button>
            </div>
            {!user ? (
              <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-[0.9rem] text-center m-6">Silakan Login terlebih dahulu untuk memodifikasi video.</div>
            ) : (
              <form className="p-6 flex flex-col gap-5" onSubmit={handleAddVideo}>
                {formError && <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-[0.9rem] text-center">{formError}</div>}
                
                <div>
                  <label className="block mb-2 text-text-muted text-[0.9rem]">URL / Link YouTube</label>
                  <input 
                    type="url" 
                    className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors"
                    placeholder="https://www.youtube.com/watch?v=..." 
                    value={formData.url}
                    onChange={e => setFormData({...formData, url: e.target.value})}
                    required 
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-text-muted text-[0.9rem]">Judul Video</label>
                  <input 
                    type="text" 
                    maxLength={100}
                    className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors"
                    placeholder="Judul yang mendeskripsikan video..." 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required 
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-text-muted text-[0.9rem]">Deskripsi Singkat (Opsional)</label>
                  <textarea 
                    maxLength={200}
                    className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors min-h-[80px]"
                    placeholder="Video ini tentang apa..." 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block mb-2 text-text-muted text-[0.9rem]">Level JLPT</label>
                    <select className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors" value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                      <option value="umum">Umum</option>
                      <option value="n5">N5</option>
                      <option value="n4">N4</option>
                      <option value="n3">N3</option>
                      <option value="n2">N2</option>
                      <option value="n1">N1</option>
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block mb-2 text-text-muted text-[0.9rem]">Kategori</label>
                    <select className="w-full p-3 rounded-lg bg-slate-900/60 border border-white/10 text-text-main font-sans focus:outline-none focus:border-primary transition-colors" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <button type="submit" className="w-full bg-primary border-none text-white p-3 rounded-lg font-bold cursor-pointer transition-all duration-200 hover:bg-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : (editingVideo ? 'Simpan Perubahan' : 'Bagikan Video')}
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
          className={`fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 transition-opacity duration-300 ${modalVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeModal}
        >
          <div
            className={`glass-panel w-full max-w-[900px] max-h-[90vh] overflow-y-auto p-0 rounded-2xl md:rounded-3xl transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${modalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-[30px] scale-[0.95] opacity-0'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/10">
              <h2 className="text-base md:text-lg font-bold text-text-main flex-1 mr-4 line-clamp-2 md:line-clamp-1">{selectedVideo.title}</h2>
              <button className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-white/10 bg-white/5 text-text-muted flex items-center justify-center cursor-pointer transition-all duration-200 shrink-0 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/30" onClick={closeModal} aria-label="Close modal">
                ✖
              </button>
            </div>
            <div className="relative w-full aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.youtube_id}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
