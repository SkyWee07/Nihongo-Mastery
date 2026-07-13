import { useState, useEffect, useRef } from 'react';

export default function SpeechPracticeModal({ isOpen, onClose, targetText, targetReading, type }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct', 'wrong', null
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setTranscript('');
      setFeedback(null);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ja-JP';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        setFeedback(null);
      };

      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setFeedback('Browser Anda tidak mendukung fitur Voice Recognition.');
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const evaluateSpeech = () => {
    if (!transcript) return;
    
    const cleanTranscript = transcript.replace(/\s+/g, '').toLowerCase();
    
    const validReadings = targetReading ? targetReading.split('/').map(r => r.trim().replace(/[-\s]/g, '').toLowerCase()) : [];
    
    let isCorrect = false;
    
    if (cleanTranscript === targetText.replace(/\s+/g, '')) {
      isCorrect = true;
    } else if (validReadings.some(r => cleanTranscript.includes(r))) {
      isCorrect = true;
    }

    setFeedback(isCorrect ? 'correct' : 'wrong');
  };

  useEffect(() => {
    if (!isListening && transcript && !feedback) {
      evaluateSpeech();
    }
  }, [isListening, transcript]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-[2000] flex justify-center items-center animate-[fadeIn_0.3s_ease-out_forwards]" onClick={onClose}>
      <div className="w-[90%] max-w-[500px] p-10 rounded-3xl relative text-center flex flex-col gap-6 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 bg-gradient-to-br from-slate-800/95 to-slate-900/95 animate-[scaleUp_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]" onClick={e => e.stopPropagation()}>
        <button className="absolute top-4 right-6 bg-transparent border-none text-4xl text-text-muted cursor-pointer transition-colors duration-200 hover:text-red-500" onClick={onClose}>&times;</button>
        
        <h2 className="m-0 text-white text-3xl font-bold">Latihan Pengucapan 🎙️</h2>
        <p className="text-slate-400 m-0 text-base">Ucapkan kata berikut:</p>
        
        <div className="bg-white/5 p-8 rounded-2xl border border-purple-500/30">
          <h1 className="text-6xl md:text-7xl m-0 text-white drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]">{targetText}</h1>
          {targetReading && <p className="text-xl text-purple-300 mt-4 mb-0">{targetReading}</p>}
        </div>

        <div className="flex justify-center">
          <button 
            className={`text-white border-none px-8 py-4 rounded-full text-lg font-semibold cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(99,102,241,0.4)] ${isListening ? 'bg-gradient-to-br from-red-500 to-rose-500 animate-[pulse-mic_1.5s_infinite] shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-gradient-to-br from-indigo-500 to-purple-500 hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(99,102,241,0.6)]'}`}
            onClick={toggleListening}
          >
            {isListening ? '🛑 Berhenti Mendengar' : '🎤 Mulai Bicara'}
          </button>
        </div>

        <div className="text-left mt-2">
          <p className="text-slate-400 text-sm mb-2">Terdengar sebagai:</p>
          <div className="bg-black/30 min-h-[3rem] p-4 rounded-xl border border-white/10 text-white text-xl flex items-center">
            {transcript || <span className="text-slate-500 italic text-base">Menunggu suara Anda...</span>}
          </div>
        </div>

        {feedback === 'correct' && (
          <div className="bg-emerald-500/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 font-medium animate-[fadeIn_0.3s_ease-out] flex items-center justify-center gap-3">
            <span className="text-2xl">✅</span> Sempurna! Pengucapan Anda akurat.
          </div>
        )}
        
        {feedback === 'wrong' && (
          <div className="bg-rose-500/20 text-rose-400 p-4 rounded-xl border border-rose-500/30 font-medium animate-[fadeIn_0.3s_ease-out] flex items-center justify-center gap-3">
            <span className="text-2xl">❌</span> Belum tepat. Coba ucapkan lebih jelas.
          </div>
        )}

      </div>
    </div>
  );
}
