import { useState, useEffect, useRef, useCallback } from 'react';
import './WritingCanvas.css';

// Stroke color palette for demo mode
const STROKE_COLORS = [
  '#6366F1', '#8B5CF6', '#A78BFA', '#818CF8',
  '#60A5FA', '#38BDF8', '#22D3EE', '#2DD4BF',
  '#34D399', '#4ADE80', '#A3E635', '#FACC15',
  '#FB923C', '#F87171', '#E879F9', '#C084FC',
];

const SPEED_OPTIONS = [
  { label: 'Lambat', value: 1.8, key: 'slow' },
  { label: 'Normal', value: 1.0, key: 'normal' },
  { label: 'Cepat', value: 0.5, key: 'fast' },
];

export default function WritingCanvas({ character, onClose }) {
  const [svgContent, setSvgContent] = useState('');
  const [mode, setMode] = useState('demo'); // 'demo' | 'guided' | 'free'
  const [strokeCount, setStrokeCount] = useState(0);
  const [speed, setSpeed] = useState('normal');
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedComplete, setGuidedComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState([]); // for undo in free mode

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const svgContainerRef = useRef(null);
  const currentStrokePoints = useRef([]);
  const animFrameRef = useRef(null);

  // ---------- Fetch SVG ----------
  useEffect(() => {
    if (!character) return;
    const hexCode = character.charCodeAt(0).toString(16).padStart(5, '0');
    fetch(`/strokeOrder/${hexCode}.svg`)
      .then((r) => {
        if (!r.ok) throw new Error('SVG not found');
        return r.text();
      })
      .then((text) => setSvgContent(text))
      .catch((err) => {
        console.error('Failed to load SVG for', character, err);
        setSvgContent('');
      });
  }, [character]);

  // ---------- Count strokes from SVG ----------
  useEffect(() => {
    if (!svgContent) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = svgContent;
    const paths = tmp.querySelectorAll('path[id^="kvg:"]');
    // fallback: count all paths inside StrokePaths group
    const strokePaths = tmp.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    setStrokeCount(strokePaths.length || paths.length || 0);
  }, [svgContent]);

  // ---------- Get speed multiplier ----------
  const getSpeedMult = useCallback(() => {
    return SPEED_OPTIONS.find((s) => s.key === speed)?.value ?? 1.0;
  }, [speed]);

  // ---------- Demo Animation ----------
  const runDemoAnimation = useCallback(() => {
    const container = svgContainerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    const mult = getSpeedMult();
    let delay = 0;

    paths.forEach((path, i) => {
      const length = path.getTotalLength();
      const color = STROKE_COLORS[i % STROKE_COLORS.length];
      path.style.stroke = color;
      path.style.strokeWidth = '4';
      path.style.fill = 'none';
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.animation = `wc-dash ${0.8 * mult}s ease-in-out ${delay}s forwards`;
      path.style.filter = `drop-shadow(0 0 3px ${color}50)`;
      delay += (0.8 * mult) + (0.25 * mult);
    });

    // Hide stroke numbers in demo
    const nums = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
    nums.forEach((n) => (n.style.display = 'none'));
  }, [getSpeedMult]);

  useEffect(() => {
    if (mode !== 'demo' || !svgContent || !svgContainerRef.current) return;
    // Small delay to let DOM update
    const t = setTimeout(() => runDemoAnimation(), 50);
    return () => clearTimeout(t);
  }, [svgContent, mode, speed, runDemoAnimation]);

  // ---------- Guided Mode Setup ----------
  useEffect(() => {
    if (mode !== 'guided' || !svgContent || !svgContainerRef.current) return;
    setGuidedStep(0);
    setGuidedComplete(false);
  }, [mode, svgContent]);

  useEffect(() => {
    if (mode !== 'guided') return;
    const container = svgContainerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    paths.forEach((path, i) => {
      path.style.animation = 'none';
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
      path.style.strokeWidth = '4';
      path.style.fill = 'none';
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
      path.style.filter = 'none';
      path.classList.remove('wc-stroke-done', 'wc-stroke-current');

      if (i < guidedStep) {
        path.classList.add('wc-stroke-done');
      } else if (i === guidedStep) {
        path.classList.add('wc-stroke-current');
      }
    });

    // Hide default stroke numbers (we show our own indicator)
    const nums = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
    nums.forEach((n) => (n.style.display = 'none'));
  }, [mode, guidedStep, svgContent]);

  const handleNextStroke = () => {
    if (guidedStep + 1 >= strokeCount) {
      setGuidedComplete(true);
      setGuidedStep(strokeCount);
    } else {
      setGuidedStep((s) => s + 1);
    }
    clearCanvas();
  };

  const handleResetGuided = () => {
    setGuidedStep(0);
    setGuidedComplete(false);
    clearCanvas();
  };

  // ---------- Free Practice SVG Setup ----------
  useEffect(() => {
    if (mode !== 'free' || !svgContent || !svgContainerRef.current) return;
    const container = svgContainerRef.current;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    paths.forEach((path) => {
      path.style.animation = 'none';
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
      path.style.strokeWidth = '4';
      path.style.fill = 'none';
      path.style.strokeLinecap = 'round';
      path.style.strokeLinejoin = 'round';
      path.style.filter = 'none';
      path.classList.remove('wc-stroke-done', 'wc-stroke-current');
    });

    const nums = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
    nums.forEach((n) => (n.style.display = 'none'));
  }, [mode, svgContent]);

  // ---------- Canvas Setup ----------
  useEffect(() => {
    if ((mode !== 'free' && mode !== 'guided') || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = mode === 'guided' ? '#6366F1' : '#60A5FA';
    ctxRef.current = ctx;

    // Reset stroke history when switching modes
    setStrokeHistory([]);
  }, [mode]);

  // ---------- Drawing Helpers ----------
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
    };
  };

  // Pressure-simulated line width based on position in stroke
  const drawSmoothStroke = (points) => {
    const ctx = ctxRef.current;
    if (!ctx || points.length < 2) return;

    const total = points.length;
    for (let i = 1; i < total; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      // Simulate pressure: thicker in the middle, thinner at edges
      const t = i / total;
      const pressure = Math.sin(t * Math.PI); // 0->1->0
      const baseWidth = 3;
      const maxExtra = 6;
      ctx.lineWidth = baseWidth + pressure * maxExtra;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);

      // Use quadratic curve for smoother lines when possible
      if (i < total - 1) {
        const p2 = points[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
      } else {
        ctx.lineTo(p1.x, p1.y);
      }
      ctx.stroke();
    }
  };

  const startDrawing = (e) => {
    if (mode !== 'free' && mode !== 'guided') return;
    const { x, y } = getCoordinates(e);
    currentStrokePoints.current = [{ x, y }];
    setIsDrawing(true);

    const ctx = ctxRef.current;
    if (ctx) {
      ctx.strokeStyle = mode === 'guided' ? '#6366F1' : '#60A5FA';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    currentStrokePoints.current.push({ x, y });

    const ctx = ctxRef.current;
    if (!ctx) return;

    // Simple real-time drawing
    const pts = currentStrokePoints.current;
    const len = pts.length;
    if (len < 2) return;

    const t = len > 3 ? (len - 1) / Math.max(len, 1) : 0.5;
    const pressure = Math.sin(t * Math.PI);
    ctx.lineWidth = 3 + pressure * 6;

    const prev = pts[len - 2];
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Save stroke for undo (free mode)
    if (mode === 'free' && currentStrokePoints.current.length > 1) {
      // Save current canvas state
      const canvas = canvasRef.current;
      if (canvas) {
        const imageData = ctxRef.current.getImageData(
          0, 0,
          canvas.width,
          canvas.height
        );
        setStrokeHistory((prev) => [...prev, imageData]);
      }
    }
    currentStrokePoints.current = [];
  };

  const clearCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    ctxRef.current.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    if (mode === 'free') setStrokeHistory([]);
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;

    if (strokeHistory.length === 1) {
      // Clear canvas entirely
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      setStrokeHistory([]);
    } else {
      // Restore previous state
      const newHistory = strokeHistory.slice(0, -1);
      const prevState = newHistory[newHistory.length - 1];
      ctx.putImageData(prevState, 0, 0);
      setStrokeHistory(newHistory);
    }
  };

  // ---------- Mode switch handler ----------
  const handleModeChange = (newMode) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setMode(newMode);
    setStrokeHistory([]);
  };

  // ---------- Replay demo ----------
  const handleReplay = () => {
    // Force re-render by toggling svgContent
    const container = svgContainerRef.current;
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return;

    const paths = svg.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    paths.forEach((path) => {
      path.style.animation = 'none';
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
    });

    // Force reflow
    void container.offsetWidth;

    setTimeout(() => runDemoAnimation(), 30);
  };

  // ---------- SVG class for current mode ----------
  const getSvgLayerClass = () => {
    switch (mode) {
      case 'demo': return 'wc-svg-layer demo';
      case 'guided': return 'wc-svg-layer guided';
      case 'free': return 'wc-svg-layer ghost';
      default: return 'wc-svg-layer';
    }
  };

  // ---------- Render ----------
  const showCanvas = mode === 'free' || mode === 'guided';

  return (
    <div className="wc-overlay" onClick={(e) => e.target.className === 'wc-overlay' && onClose()}>
      <div className="wc-modal glass-panel">
        {/* Header */}
        <div className="wc-header">
          <div className="wc-kanji-display">{character}</div>
          <div className="wc-header-info">
            <h2>Latihan Menulis</h2>
            <p className="wc-stroke-info">
              {strokeCount > 0 ? `${strokeCount} guratan` : 'Memuat...'}
            </p>
          </div>
          <button className="wc-close-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="wc-tabs">
          <button
            className={`wc-tab ${mode === 'demo' ? 'active' : ''}`}
            onClick={() => handleModeChange('demo')}
          >
            👀 Demo
          </button>
          <button
            className={`wc-tab ${mode === 'guided' ? 'active' : ''}`}
            onClick={() => handleModeChange('guided')}
          >
            📝 Panduan
          </button>
          <button
            className={`wc-tab ${mode === 'free' ? 'active' : ''}`}
            onClick={() => handleModeChange('free')}
          >
            ✍️ Latihan
          </button>
        </div>

        {/* Sub-bar: Speed Control (demo) / Stroke Counter (guided) */}
        {mode === 'demo' && (
          <div className="wc-sub-bar" key="demo-bar">
            <div className="wc-speed-control">
              <span>Kecepatan:</span>
              <div className="wc-speed-pills">
                {SPEED_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    className={`wc-speed-pill ${speed === opt.key ? 'active' : ''}`}
                    onClick={() => setSpeed(opt.key)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'guided' && !guidedComplete && (
          <div className="wc-sub-bar" key="guided-bar">
            <span className="wc-stroke-badge">
              Guratan <strong>{guidedStep + 1}</strong> dari <strong>{strokeCount}</strong>
            </span>
          </div>
        )}

        {/* Canvas Area */}
        <div className="wc-canvas-area">
          {/* Grid lines */}
          <div className="wc-grid">
            <div className="wc-grid-lines" />
            <div className="wc-grid-diag" />
          </div>

          {/* SVG guide layer */}
          {svgContent && (
            <div
              className={getSvgLayerClass()}
              ref={svgContainerRef}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {/* Stroke number badge in guided mode */}
          {mode === 'guided' && !guidedComplete && (
            <div className="wc-stroke-number" key={guidedStep}>
              {guidedStep + 1}
            </div>
          )}

          {/* Drawing canvas */}
          {showCanvas && (
            <canvas
              ref={canvasRef}
              className="wc-drawing-layer"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
            />
          )}
        </div>

        {/* Action Buttons */}
        {mode === 'demo' && (
          <div className="wc-actions" key="demo-actions">
            <button className="wc-action-btn primary" onClick={handleReplay}>
              🔄 Putar Ulang
            </button>
          </div>
        )}

        {mode === 'guided' && !guidedComplete && (
          <div className="wc-actions" key="guided-actions">
            <button className="wc-action-btn secondary" onClick={clearCanvas}>
              🗑️ Hapus
            </button>
            <button className="wc-action-btn primary" onClick={handleNextStroke}>
              {guidedStep + 1 >= strokeCount ? '✅ Selesai' : '➡️ Lanjut'}
            </button>
          </div>
        )}

        {mode === 'guided' && guidedComplete && (
          <>
            <div className="wc-complete-msg">
              🎉 Semua guratan selesai!
            </div>
            <div className="wc-actions" key="guided-complete-actions">
              <button className="wc-action-btn success" onClick={handleResetGuided}>
                🔄 Ulangi
              </button>
            </div>
          </>
        )}

        {mode === 'free' && (
          <div className="wc-actions" key="free-actions">
            <button
              className="wc-action-btn secondary"
              onClick={handleUndo}
              disabled={strokeHistory.length === 0}
            >
              ↩️ Undo
            </button>
            <button className="wc-action-btn danger" onClick={clearCanvas}>
              🗑️ Hapus Semua
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
