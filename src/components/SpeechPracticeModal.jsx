import { useState, useEffect, useRef } from 'react';
import './SpeechPracticeModal.css';

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

    // Inisialisasi Web Speech API
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

  // Evaluasi ketika transcript berubah dan tidak lagi listening (atau kita bisa pasang tombol Cek)
  // Tapi lebih aman evaluasi manual lewat tombol atau saat onend.
  
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
    
    // Normalisasi teks (hapus spasi, ubah ke hiragana jika perlu, tapi SpeechRecognition JP biasanya menghasilkan Kanji/Kana campuran)
    // Evaluasi sederhana: Jika transcript mengandung target reading ATAU target text
    const cleanTranscript = transcript.replace(/\s+/g, '').toLowerCase();
    
    // Memecah targetReading jika formatnya "onyomi / kunyomi"
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
    <div className="speech-overlay" onClick={onClose}>
      <div className="speech-modal glass-panel" onClick={e => e.stopPropagation()}>
        <button className="speech-close-btn" onClick={onClose}>&times;</button>
        
        <h2>Latihan Pengucapan 🎙️</h2>
        <p className="speech-target-label">Ucapkan kata berikut:</p>
        
        <div className="speech-target-card">
          <h1 className="speech-target-text">{targetText}</h1>
          {targetReading && <p className="speech-target-reading">{targetReading}</p>}
        </div>

        <div className="speech-controls">
          <button 
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
          >
            {isListening ? '🛑 Berhenti Mendengar' : '🎤 Mulai Bicara'}
          </button>
        </div>

        <div className="speech-transcript-area">
          <p className="transcript-label">Terdengar sebagai:</p>
          <div className="transcript-box">
            {transcript || <span className="transcript-placeholder">Menunggu suara Anda...</span>}
          </div>
        </div>

        {feedback === 'correct' && (
          <div className="speech-feedback correct">
            <span className="feedback-icon">✅</span> Sempurna! Pengucapan Anda akurat.
          </div>
        )}
        
        {feedback === 'wrong' && (
          <div className="speech-feedback wrong">
            <span className="feedback-icon">❌</span> Belum tepat. Coba ucapkan lebih jelas.
          </div>
        )}

      </div>
    </div>
  );
}
