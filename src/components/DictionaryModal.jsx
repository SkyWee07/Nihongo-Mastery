import { useState, useRef, useEffect } from 'react';

export default function DictionaryModal({ isOpen, onClose }) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const proxyUrl = `/api/jisho?keyword=${encodeURIComponent(keyword)}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      setResults(data.data || []);
      if (data.data && data.data.length === 0) {
        setError('Kata tidak ditemukan.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal mengambil data dari Jisho. Coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-[1000] flex justify-center items-start pt-[10vh] animate-[fadeIn_0.3s_ease-out_forwards]" onClick={onClose}>
      <div className="w-[90%] max-w-[600px] max-h-[80vh] p-10 rounded-3xl relative flex flex-col bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] animate-[slideDown_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-4 right-6 bg-transparent border-none text-4xl text-text-muted cursor-pointer transition-colors duration-200 leading-none hover:text-red-500" onClick={onClose}>&times;</button>
        <h2 className="mt-0 mb-6 text-3xl text-center text-white font-bold">📖 Kamus Jisho</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 px-6 py-4 rounded-full border border-white/20 text-white text-lg bg-white/5 backdrop-blur-md outline-none transition-all duration-300 focus:border-purple-500 focus:shadow-[0_0_10px_rgba(139,92,246,0.5)] placeholder:text-text-muted"
            placeholder="Ketik dalam Romaji, Inggris, Kana, atau Kanji..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-none px-8 rounded-full font-semibold cursor-pointer transition-transform duration-200 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100" disabled={isLoading}>
            {isLoading ? '⏳' : 'Cari'}
          </button>
        </form>

        <div className="overflow-y-auto pr-2 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {error && <p className="text-red-500 text-center">{error}</p>}
          
          {results.map((item, index) => {
            const jp = item.japanese[0] || {};
            const meanings = item.senses[0]?.english_definitions.join(', ') || '';
            const pos = item.senses[0]?.parts_of_speech.join(', ') || '';
            
            return (
              <div key={index} className="p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="mb-3">
                  <span className="text-3xl font-extrabold text-white mr-4">{jp.word || jp.reading}</span>
                  {jp.word && <span className="text-xl text-purple-400">({jp.reading})</span>}
                </div>
                <div className="text-lg text-slate-200 mb-2">
                  <strong className="text-white">Arti:</strong> {meanings}
                </div>
                {pos && (
                  <div className="mt-2 text-sm text-text-muted italic">
                    <small>{pos}</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
