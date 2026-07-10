import { useState, useEffect, useRef } from 'react';
import './WritingCanvas.css';

export default function WritingCanvas({ character, onClose }) {
  const [svgContent, setSvgContent] = useState('');
  const [mode, setMode] = useState('demo'); // 'demo' | 'practice'
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const svgContainerRef = useRef(null);

  // Fetch SVG
  useEffect(() => {
    if (!character) return;
    const loadSvg = async () => {
      const hexCode = character.charCodeAt(0).toString(16).padStart(5, '0');
      try {
        const response = await fetch(`/strokeOrder/${hexCode}.svg`);
        if (!response.ok) throw new Error('SVG not found');
        const text = await response.text();
        setSvgContent(text);
      } catch (err) {
        console.error('Failed to load SVG for', character, err);
        setSvgContent('<div class="error">Gagal memuat panduan</div>');
      }
    };
    loadSvg();
  }, [character]);

  // Handle Demo Animation
  useEffect(() => {
    if (mode === 'demo' && svgContent && svgContainerRef.current) {
      const svg = svgContainerRef.current.querySelector('svg');
      if (!svg) return;
      
      const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
      let delay = 0;
      
      paths.forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
        path.style.animation = `dash 1s ease-in-out ${delay}s forwards`;
        delay += 1.2; // 1s animation + 0.2s pause between strokes
      });
      
      // Hide stroke numbers in demo
      const numbers = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
      numbers.forEach(n => n.style.display = 'none');
    } else if (mode === 'practice' && svgContainerRef.current) {
      const svg = svgContainerRef.current.querySelector('svg');
      if (!svg) return;
      const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
      paths.forEach((path) => {
        path.style.animation = 'none';
        path.style.strokeDasharray = 'none';
        path.style.strokeDashoffset = '0';
        path.style.stroke = '#e2e8f0'; // Light gray for tracing
      });
      // Show numbers for practice
      const numbers = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
      numbers.forEach(n => {
        n.style.display = 'block';
        n.style.fill = '#94a3b8';
      });
    }
  }, [svgContent, mode]);

  // Setup Canvas for Practice mode
  useEffect(() => {
    if (mode === 'practice' && canvasRef.current) {
      const canvas = canvasRef.current;
      // Match canvas size to container size
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 12; // Adjust brush size
      ctx.strokeStyle = '#3b82f6'; // Blue color
      ctxRef.current = ctx;
    }
  }, [mode]);

  const startDrawing = (e) => {
    if (mode !== 'practice') return;
    const { offsetX, offsetY } = getCoordinates(e);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'practice') return;
    e.preventDefault(); // Prevent scrolling on mobile
    const { offsetX, offsetY } = getCoordinates(e);
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const endDrawing = () => {
    if (mode !== 'practice') return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  const clearCanvas = () => {
    if (canvasRef.current && ctxRef.current) {
      ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="canvas-overlay" onClick={(e) => e.target.className === 'canvas-overlay' && onClose()}>
      <div className="canvas-modal glass-panel">
        <div className="canvas-header">
          <h2>Latihan Menulis: {character}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="canvas-controls">
          <button 
            className={`control-btn ${mode === 'demo' ? 'active' : ''}`}
            onClick={() => setMode('demo')}
          >
            👀 Lihat Demo
          </button>
          <button 
            className={`control-btn ${mode === 'practice' ? 'active' : ''}`}
            onClick={() => setMode('practice')}
          >
            ✍️ Coba Tulis
          </button>
        </div>

        <div className="canvas-container">
          {/* Background Guide (SVG) */}
          <div 
            className="svg-layer" 
            ref={svgContainerRef}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          ></div>
          
          {/* Drawing Layer (Canvas) */}
          {mode === 'practice' && (
            <canvas
              ref={canvasRef}
              className="drawing-layer"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            ></canvas>
          )}
        </div>

        {mode === 'practice' && (
          <div className="canvas-actions">
            <button className="reset-btn" onClick={clearCanvas}>Hapus Kanvas</button>
          </div>
        )}
      </div>
    </div>
  );
}
