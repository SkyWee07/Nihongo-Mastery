import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [mode, setMode] = useState('demo');
  const [strokeCount, setStrokeCount] = useState(0);
  const [speed, setSpeed] = useState('normal');
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedComplete, setGuidedComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeHistory, setStrokeHistory] = useState([]);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const svgContainerRef = useRef(null);
  const currentStrokePoints = useRef([]);
  const animFrameRef = useRef(null);

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

  useEffect(() => {
    if (!svgContent) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = svgContent;
    const paths = tmp.querySelectorAll('path[id^="kvg:"]');
    const strokePaths = tmp.querySelectorAll('g[id^="kvg:StrokePaths"] path');
    setStrokeCount(strokePaths.length || paths.length || 0);
  }, [svgContent]);

  const getSpeedMult = useCallback(() => {
    return SPEED_OPTIONS.find((s) => s.key === speed)?.value ?? 1.0;
  }, [speed]);

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

    const nums = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
    nums.forEach((n) => (n.style.display = 'none'));
  }, [getSpeedMult]);

  useEffect(() => {
    if (mode !== 'demo' || !svgContent || !svgContainerRef.current) return;
    const t = setTimeout(() => runDemoAnimation(), 50);
    return () => clearTimeout(t);
  }, [svgContent, mode, speed, runDemoAnimation]);

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
      
      // Clear manual stroke classes and set directly
      if (i < guidedStep) {
        path.style.stroke = 'rgba(16, 185, 129, 0.5)';
      } else if (i === guidedStep) {
        path.style.stroke = '#6366F1';
        path.style.filter = 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))';
        path.style.animation = 'wc-pulse-stroke 1.5s ease-in-out infinite';
      } else {
        path.style.stroke = 'rgba(255, 255, 255, 0.08)';
      }
    });

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
      // Ghost styles for free practice
      path.style.stroke = '#F8FAFC';
    });
    
    // Ghost wrapper opacity
    container.style.opacity = '0.12';

    const nums = svg.querySelectorAll('g[id^="kvg:StrokeNumbers"]');
    nums.forEach((n) => (n.style.display = 'none'));
  }, [mode, svgContent]);

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

    setStrokeHistory([]);
  }, [mode]);

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

  const drawSmoothStroke = (points) => {
    const ctx = ctxRef.current;
    if (!ctx || points.length < 2) return;

    const total = points.length;
    for (let i = 1; i < total; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      const t = i / total;
      const pressure = Math.sin(t * Math.PI);
      const baseWidth = 3;
      const maxExtra = 6;
      ctx.lineWidth = baseWidth + pressure * maxExtra;

      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);

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

    if (mode === 'free' && currentStrokePoints.current.length > 1) {
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
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
      setStrokeHistory([]);
    } else {
      const newHistory = strokeHistory.slice(0, -1);
      const prevState = newHistory[newHistory.length - 1];
      ctx.putImageData(prevState, 0, 0);
      setStrokeHistory(newHistory);
    }
  };

  const handleModeChange = (newMode) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setMode(newMode);
    setStrokeHistory([]);
    if (svgContainerRef.current) {
      svgContainerRef.current.style.opacity = '1';
    }
  };

  const handleReplay = () => {
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

    void container.offsetWidth;
    setTimeout(() => runDemoAnimation(), 30);
  };

  const showCanvas = mode === 'free' || mode === 'guided';

  return (
    <>
      <style>
        {`
          @keyframes wc-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes wc-pop-in { from { opacity: 0; transform: scale(0.88) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          @keyframes wc-dash { to { stroke-dashoffset: 0; } }
          @keyframes wc-slide-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes wc-pulse-stroke { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          
          .wc-grid-lines {
            background:
              repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 0px, rgba(255, 255, 255, 0.07) 6px, transparent 6px, transparent 12px),
              repeating-linear-gradient(to right, rgba(255, 255, 255, 0.07) 0px, rgba(255, 255, 255, 0.07) 6px, transparent 6px, transparent 12px);
            background-size: 1px 100%, 100% 1px;
            background-position: 50% 0, 0 50%;
            background-repeat: no-repeat;
          }
          
          .wc-svg-container svg {
            width: 100%;
            height: 100%;
            display: block;
          }
          .wc-svg-container path {
            stroke: #F8FAFC;
            fill: none;
            transition: stroke 0.3s ease;
          }
        `}
      </style>
      
      <div 
        className="fixed inset-0 bg-slate-900/75 backdrop-blur-md flex justify-center items-center z-[1000] p-4 animate-[wc-fade-in_0.25s_ease-out]" 
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="w-full max-w-[480px] bg-slate-800/85 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-[0_24px_48px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.05)] max-h-[95vh] overflow-y-auto animate-[wc-pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/25 flex items-center justify-center text-3xl text-text-main flex-shrink-0 font-sans">
              {character}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-text-main m-0 mb-1 leading-tight">Latihan Menulis</h2>
              <p className="text-sm text-text-muted m-0">
                {strokeCount > 0 ? `${strokeCount} guratan` : 'Memuat...'}
              </p>
            </div>
            <button 
              className="bg-white/5 border border-white/10 text-text-muted w-9 h-9 rounded-lg cursor-pointer text-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 leading-none hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-500" 
              onClick={onClose} 
              aria-label="Tutup"
            >
              ×
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1.5 bg-black/20 rounded-xl p-1">
            <button
              className={`flex-1 py-2 px-1.5 rounded-lg border-none text-xs font-medium cursor-pointer transition-all duration-250 whitespace-nowrap ${mode === 'demo' ? 'bg-primary text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]' : 'bg-transparent text-text-muted hover:text-text-main hover:bg-white/5'}`}
              onClick={() => handleModeChange('demo')}
            >
              👀 Demo
            </button>
            <button
              className={`flex-1 py-2 px-1.5 rounded-lg border-none text-xs font-medium cursor-pointer transition-all duration-250 whitespace-nowrap ${mode === 'guided' ? 'bg-primary text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]' : 'bg-transparent text-text-muted hover:text-text-main hover:bg-white/5'}`}
              onClick={() => handleModeChange('guided')}
            >
              📝 Panduan
            </button>
            <button
              className={`flex-1 py-2 px-1.5 rounded-lg border-none text-xs font-medium cursor-pointer transition-all duration-250 whitespace-nowrap ${mode === 'free' ? 'bg-primary text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)]' : 'bg-transparent text-text-muted hover:text-text-main hover:bg-white/5'}`}
              onClick={() => handleModeChange('free')}
            >
              ✍️ Latihan
            </button>
          </div>

          {/* Sub-bar */}
          {mode === 'demo' && (
            <div className="flex items-center justify-between gap-2 min-h-[36px] animate-[wc-slide-in_0.25s_ease-out]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Kecepatan:</span>
                <div className="flex gap-1">
                  {SPEED_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border cursor-pointer transition-all duration-200 ${speed === opt.key ? 'bg-indigo-500/20 border-indigo-500/40 text-primary' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-text-main'}`}
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
            <div className="flex items-center justify-between gap-2 min-h-[36px] animate-[wc-slide-in_0.25s_ease-out]">
              <span className="text-xs text-text-muted bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                Guratan <strong className="text-primary">{guidedStep + 1}</strong> dari <strong className="text-primary">{strokeCount}</strong>
              </span>
            </div>
          )}

          {/* Canvas Area */}
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/10">
            {/* Grid lines */}
            <div className="absolute inset-0 z-0 pointer-events-none border-2 border-white/10 rounded-2xl">
              <div className="wc-grid-lines absolute inset-0 z-0" />
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-[142%] h-0 border-t border-dashed border-white/5 -translate-x-1/2 -translate-y-1/2 rotate-45" />
                <div className="absolute top-1/2 left-1/2 w-[142%] h-0 border-t border-dashed border-white/5 -translate-x-1/2 -translate-y-1/2 -rotate-45" />
              </div>
            </div>

            {/* SVG guide layer */}
            {svgContent && (
              <div
                className="wc-svg-container absolute inset-0 z-[1] pointer-events-none flex items-center justify-center p-[8%]"
                ref={svgContainerRef}
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            )}

            {/* Stroke number badge in guided mode */}
            {mode === 'guided' && !guidedComplete && (
              <div className="absolute top-3 right-3 z-[4] bg-indigo-500/90 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-[0_2px_10px_rgba(99,102,241,0.4)] animate-[wc-pop-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
                {guidedStep + 1}
              </div>
            )}

            {/* Drawing canvas */}
            {showCanvas && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 z-[3] cursor-crosshair touch-none"
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
            <div className="flex gap-2 animate-[wc-slide-in_0.25s_ease-out]">
              <button 
                className="flex-1 py-2.5 px-3 rounded-xl border border-primary bg-primary text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:bg-indigo-400 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-px active:translate-y-0"
                onClick={handleReplay}
              >
                🔄 Putar Ulang
              </button>
            </div>
          )}

          {mode === 'guided' && !guidedComplete && (
            <div className="flex gap-2 animate-[wc-slide-in_0.25s_ease-out]">
              <button 
                className="flex-1 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-text-muted text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-white/10 hover:text-text-main"
                onClick={clearCanvas}
              >
                🗑️ Hapus
              </button>
              <button 
                className="flex-1 py-2.5 px-3 rounded-xl border border-primary bg-primary text-white text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:bg-indigo-400 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)] hover:-translate-y-px active:translate-y-0"
                onClick={handleNextStroke}
              >
                {guidedStep + 1 >= strokeCount ? '✅ Selesai' : '➡️ Lanjut'}
              </button>
            </div>
          )}

          {mode === 'guided' && guidedComplete && (
            <>
              <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-accent text-sm font-medium animate-[wc-pop-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
                🎉 Semua guratan selesai!
              </div>
              <div className="flex gap-2 animate-[wc-slide-in_0.25s_ease-out]">
                <button 
                  className="flex-1 py-2.5 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-accent text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-emerald-500/20"
                  onClick={handleResetGuided}
                >
                  🔄 Ulangi
                </button>
              </div>
            </>
          )}

          {mode === 'free' && (
            <div className="flex gap-2 animate-[wc-slide-in_0.25s_ease-out]">
              <button
                className="flex-1 py-2.5 px-3 rounded-xl border border-white/10 bg-white/5 text-text-muted text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-white/10 hover:text-text-main disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:text-text-muted"
                onClick={handleUndo}
                disabled={strokeHistory.length === 0}
              >
                ↩️ Undo
              </button>
              <button 
                className="flex-1 py-2.5 px-3 rounded-xl border border-red-500/15 bg-red-500/10 text-red-500 text-sm font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-all duration-200 hover:bg-red-500/20"
                onClick={clearCanvas}
              >
                🗑️ Hapus Semua
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
