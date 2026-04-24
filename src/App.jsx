import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Zap, ChevronRight, Activity, CheckCircle, AlertTriangle, Tag, TrendingUp, Briefcase, ArrowLeft } from 'lucide-react';
import axios from 'axios';

// ── Canvas Background (shared) ──────────────────────────────────────────────
function StarCanvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
}

// ── Animated Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, stroke = 10, color = '#ec4899' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  );
}

const scoreColor = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
const scoreLabel = (s) => s >= 75 ? 'Strong' : s >= 50 ? 'Average' : 'Weak';

// ── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ result, fileName, onBack }) {
  return (
    <div className="relative z-10 flex flex-col items-center px-4 py-8 gap-5 min-h-screen">

      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-pink-300 transition-colors border border-slate-700/50 hover:border-pink-500/40 px-3 py-2 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Analyse Another
        </button>

        <div className="flex items-center space-x-2 px-4 py-1.5 bg-slate-900/40 border border-slate-700/40 rounded-full backdrop-blur-md">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[10px] sm:text-xs font-mono text-emerald-300 tracking-[0.2em]">ANALYSIS COMPLETE</span>
        </div>
      </div>

      {/* File name */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-slate-700/40 rounded-xl backdrop-blur-md">
        <FileText className="w-3.5 h-3.5 text-pink-400" />
        <span className="text-[11px] font-mono text-slate-300">{fileName}</span>
      </div>

      {/* Score cards */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-4">

        {/* Overall Score */}
        <div className="bg-[#020617]/70 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <p className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">Overall Score</p>
          <div className="relative">
            <ScoreRing score={result.overallScore} size={120} color={scoreColor(result.overallScore)} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{result.overallScore}</span>
              <span className="text-[9px] font-mono tracking-wider" style={{ color: scoreColor(result.overallScore) }}>{scoreLabel(result.overallScore)}</span>
            </div>
          </div>
        </div>

        {/* ATS Score */}
        <div className="bg-[#020617]/70 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <p className="text-[9px] font-mono text-slate-400 tracking-widest uppercase">ATS Score</p>
          <div className="relative">
            <ScoreRing score={result.atsScore} size={120} color="#3b82f6" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{result.atsScore}</span>
              <span className="text-[9px] font-mono text-blue-400 tracking-wider">{scoreLabel(result.atsScore)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section breakdown */}
      <div className="w-full max-w-2xl bg-[#020617]/70 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <h3 className="text-[9px] font-mono text-slate-400 tracking-widest uppercase mb-4">Section Breakdown</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(result.sections).map(([key, val]) => {
            const maxVal = key === 'experience' ? 30 : key === 'skills' || key === 'education' ? 20 : 10;
            const pct = Math.round((val / maxVal) * 100);
            return (
              <div key={key} className="bg-slate-900/60 rounded-xl p-3 text-center">
                <div className="text-base font-black" style={{ color: scoreColor(pct) }}>
                  {val}<span className="text-[9px] text-slate-500">/{maxVal}</span>
                </div>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verdict */}
      <div className="w-full max-w-2xl bg-[#020617]/70 backdrop-blur-2xl border border-pink-900/30 rounded-2xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <p className="text-xs font-mono text-slate-300 leading-relaxed">
          <span className="text-pink-400 font-bold">VERDICT: </span>{result.verdict}
        </p>
      </div>

      {/* Suitable Roles */}
      {result.suitableRoles && (
        <div className="w-full max-w-2xl bg-[#020617]/70 backdrop-blur-2xl border border-blue-900/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <h3 className="text-[9px] font-mono text-blue-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5" /> Suitable Job Roles
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {result.suitableRoles.map((role, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-blue-900/10 border border-blue-800/30 rounded-xl">
                <span className="text-[10px] font-black text-blue-500 font-mono">0{i + 1}</span>
                <span className="text-xs font-mono text-slate-200">{role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths + Improvements grid */}
      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Strengths */}
        <div className="bg-[#020617]/70 backdrop-blur-2xl border border-emerald-900/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <h3 className="text-[9px] font-mono text-emerald-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5" /> Strengths
          </h3>
          <ul className="flex flex-col gap-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="text-[11px] font-mono text-slate-300 bg-emerald-900/10 border border-emerald-800/30 rounded-xl px-3 py-2 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-[#020617]/70 backdrop-blur-2xl border border-amber-900/40 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          <h3 className="text-[9px] font-mono text-amber-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Must Fix
          </h3>
          <ul className="flex flex-col gap-2">
            {result.improvements.map((imp, i) => (
              <li key={i} className="text-[11px] font-mono text-slate-300 bg-amber-900/10 border border-amber-800/30 rounded-xl px-3 py-2 flex items-start gap-2 leading-relaxed">
                <span className="text-amber-500 mt-0.5 shrink-0">→</span> {imp}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords */}
      <div className="w-full max-w-2xl bg-[#020617]/70 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="mb-4">
          <h3 className="text-[9px] font-mono text-blue-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" /> Keywords Found
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((k, i) => (
              <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-blue-900/20 border border-blue-800/40 text-blue-300 rounded-full">{k}</span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[9px] font-mono text-pink-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Missing Keywords — Add These
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.missingKeywords.map((k, i) => (
              <span key={i} className="text-[10px] font-mono px-2.5 py-1 bg-pink-900/20 border border-pink-800/40 text-pink-300 rounded-full">{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <button
        onClick={onBack}
        className="w-full max-w-2xl py-3 rounded-xl font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 border border-slate-700 hover:border-pink-500/40 hover:text-pink-300 transition-all duration-300 mb-4"
      >
        ↑ Analyse Another Resume
      </button>

    </div>
  );
}

// ── Upload Page ───────────────────────────────────────────────────────────────
function UploadPage({ onResult }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleAnalyse = async () => {
    if (!file) { alert("Please upload your Resume first!"); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onResult(response.data.analysis, file.name);
    } catch (error) {
      alert(error.response?.data?.error || "Connection to AI Core failed. Check server status.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center h-screen px-4 gap-3 sm:gap-4">

      {/* Status pill */}
      <div className="flex items-center space-x-2 px-4 py-1.5 bg-slate-900/40 border border-slate-700/40 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.1)]">
        <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#ec4899]" />
        <span className="text-[10px] sm:text-xs font-mono text-pink-300 tracking-[0.2em]">NEURAL RESUME ENGINE V3.0</span>
      </div>

      {/* Hero heading */}
      <div className="text-center">
        <p className="font-mono tracking-[0.4em] uppercase leading-none mb-1 text-slate-200"
          style={{ fontSize: 'clamp(0.85rem, 2.2vw, 1.15rem)', textShadow: '0 0 12px rgba(148,163,184,0.4)' }}>
          Supercharge Your
        </p>
        <div className="relative inline-block" style={{ overflow: 'visible' }}>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-6 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 90% 100% at 50% 120%, rgba(236,72,153,0.45) 0%, transparent 70%)', filter: 'blur(10px)' }} />
          <h1 className="interview-heading relative leading-none" style={{ fontFamily: "'Great Vibes', cursive" }}>Resume</h1>
          <div className="interview-rule" />
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mt-3 font-mono leading-relaxed">
          AI-powered suggestions · ATS optimisation · Real-time scoring
        </p>
      </div>

      {/* Stats row */}
      <div className="flex space-x-8 sm:space-x-14 py-2.5 border-y border-white/10">
        <div className="text-center group">
          <div className="text-xl sm:text-2xl font-black text-emerald-400 group-hover:scale-110 transition-transform">10+</div>
          <div className="text-[9px] font-mono text-slate-300 tracking-widest uppercase mt-0.5">Improvements</div>
        </div>
        <div className="text-center group">
          <div className="text-xl sm:text-2xl font-black text-blue-400 group-hover:scale-110 transition-transform">~2m</div>
          <div className="text-[9px] font-mono text-slate-300 tracking-widest uppercase mt-0.5">Analysis Time</div>
        </div>
        <div className="text-center group">
          <div className="text-xl sm:text-2xl font-black text-pink-400 group-hover:scale-110 transition-transform">ATS</div>
          <div className="text-[9px] font-mono text-slate-300 tracking-widest uppercase mt-0.5">Optimised</div>
        </div>
      </div>

      {/* Upload card */}
      <div className="w-full max-w-lg bg-[#020617]/70 backdrop-blur-2xl border border-slate-800 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none" />

        <div className="relative flex items-center space-x-3 mb-4 border-b border-slate-800 pb-3">
          <div className="p-2 bg-gradient-to-br from-pink-500/10 to-fuchsia-500/10 rounded-xl border border-pink-500/20">
            <Zap className="w-4 h-4 text-pink-500" />
          </div>
          <div>
            <h2 className="text-sm text-white font-bold tracking-wide">Enhance Your Resume</h2>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">Upload your resume to initialise AI analysis</p>
          </div>
        </div>

        <label htmlFor="resume-upload"
          className="relative flex flex-col items-center justify-center w-full h-28 bg-black/40 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:border-pink-500/50 hover:bg-slate-900/50 transition-all duration-500 group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex flex-col items-center justify-center">
            <div className="p-2.5 bg-white/5 rounded-full mb-2 group-hover:bg-pink-500/20 transition-colors duration-500">
              <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-pink-400 transition-colors" />
            </div>
            <p className="text-xs font-mono text-slate-500 group-hover:text-pink-300 transition-colors">
              {file ? "Upload a different Resume" : "Click to upload Resume (PDF)"}
            </p>
          </div>
          <input id="resume-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </label>

        {file && (
          <div className="mt-3 p-3 bg-pink-900/10 border border-pink-500/20 rounded-xl flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-pink-500/20 rounded-lg"><FileText className="w-4 h-4 text-pink-400" /></div>
              <span className="text-xs font-mono text-pink-200 truncate max-w-[200px]">{file.name}</span>
            </div>
            <button onClick={() => setFile(null)}
              className="text-[10px] text-red-400/60 hover:text-red-400 uppercase tracking-widest font-bold px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors">
              Remove
            </button>
          </div>
        )}

        <button onClick={handleAnalyse} disabled={isUploading || !file}
          className={`mt-4 w-full py-3 rounded-xl font-mono text-[12px] font-bold flex items-center justify-center space-x-3 transition-all duration-500 relative overflow-hidden group ${file
            ? "bg-slate-800/80 text-pink-400 border border-pink-500/30 hover:bg-gradient-to-r hover:from-pink-600 hover:to-fuchsia-600 hover:text-white hover:border-transparent hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
            : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"}`}>
          {isUploading ? <Activity className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          <span className="tracking-[0.2em] uppercase">
            {isUploading ? "Analysing Resume..." : "Enhance My Resume"}
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef(null);

  const handleResult = (analysis, name) => {
    setResult(analysis);
    setFileName(name);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setResult(null);
    setFileName('');
    window.scrollTo(0, 0);
  };

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let ships = [], stars = [], galaxyParticles = [];

    const setCanvasSize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });

    class GalaxyParticle {
      constructor() {
        this.centerX = canvas.width / 2; this.centerY = canvas.height / 2;
        let armIndex = Math.floor(Math.random() * 3);
        let baseAngle = (Math.PI * 2 / 3) * armIndex;
        let maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
        this.distance = Math.pow(Math.random(), 2.5) * maxRadius;
        let spiralOffset = this.distance * 0.005;
        let spread = (Math.random() - 0.5) * (this.distance * 0.2 + 10);
        this.angle = baseAngle + spiralOffset + spread;
        this.size = Math.random() * 2 + 0.5;
        this.speed = (Math.random() * 0.0008) + 0.0002;
        const colors = ['rgba(88,28,135,0.7)', 'rgba(147,51,234,0.5)', 'rgba(30,64,175,0.6)', 'rgba(59,130,246,0.4)', 'rgba(16,185,129,0.3)', 'rgba(6,182,212,0.4)'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() { this.angle -= this.speed; this.centerX = canvas.width / 2; this.centerY = canvas.height / 2; }
      draw() {
        let x = this.centerX + Math.cos(this.angle) * this.distance;
        let y = this.centerY + Math.sin(this.angle) * this.distance;
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(x, y, this.size, 0, Math.PI * 2);
        if (this.distance < 250) { ctx.shadowBlur = 10; ctx.shadowColor = this.color; } else { ctx.shadowBlur = 0; }
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    class Star {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.baseX = this.x; this.baseY = this.y;
        let rand = Math.random();
        if (rand > 0.85) { this.size = Math.random() * 4 + 2; this.isGiant = true; }
        else { this.size = Math.random() * 1.2 + 0.3; this.isGiant = false; }
        this.density = (Math.random() * 30) + 10; this.opacity = Math.random() * 0.4 + 0.1;
        const colors = ['147,51,234,', '59,130,246,', '16,185,129,', '167,139,250,'];
        this.colorStr = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        this.baseY -= 0.15;
        if (this.baseY < -15) { this.baseY = canvas.height + 15; this.y = this.baseY; this.baseX = Math.random() * canvas.width; this.x = this.baseX; }
        let dx = mouse.x - this.x, dy = mouse.y - this.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * this.density; this.y -= (dy / dist) * force * this.density; this.opacity = 1;
        } else {
          if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 15;
          if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 15;
          if (this.opacity > 0.2) this.opacity -= 0.03;
        }
      }
      draw() {
        ctx.fillStyle = `rgba(${this.colorStr} ${this.opacity})`; ctx.beginPath();
        if (this.isGiant) {
          ctx.moveTo(this.x, this.y - this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
        } else { ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); }
        if (this.opacity > 0.8) { ctx.shadowBlur = this.isGiant ? 15 : 5; ctx.shadowColor = `rgba(${this.colorStr} 1)`; }
        ctx.fill(); ctx.shadowBlur = 0;
      }
    }

    class Spaceship {
      constructor() {
        this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 3.5; this.vy = (Math.random() - 0.5) * 3.5;
        this.size = Math.random() * 5 + 15;
        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#06b6d4'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.maxSpeed = Math.random() * 1.8 + 2.0;
      }
      update() {
        let dx = this.x - mouse.x, dy = this.y - mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius + 80) { let force = ((mouse.radius + 80) - dist) / (mouse.radius + 80); this.vx += (dx / dist) * force * 0.3; this.vy += (dy / dist) * force * 0.3; }
        let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed + 1.5) { this.vx *= 0.95; this.vy *= 0.95; }
        else if (speed < this.maxSpeed && dist >= mouse.radius + 80) { this.vx *= 1.01; this.vy *= 1.01; }
        this.x += this.vx; this.y += this.vy;
        let margin = this.size * 3;
        if (this.x < -margin) this.x = canvas.width + margin;
        if (this.x > canvas.width + margin) this.x = -margin;
        if (this.y < -margin) this.y = canvas.height + margin;
        if (this.y > canvas.height + margin) this.y = -margin;
      }
      draw() {
        let angle = Math.atan2(this.vy, this.vx);
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(angle);
        ctx.fillStyle = `rgba(${Math.random() * 50},${Math.random() * 150 + 100},255,0.8)`;
        ctx.beginPath(); ctx.moveTo(-this.size, 0); ctx.lineTo(-this.size - (Math.random() * 20 + 15), -this.size / 2.5); ctx.lineTo(-this.size - (Math.random() * 20 + 15), this.size / 2.5); ctx.fill();
        ctx.fillStyle = this.color; ctx.beginPath(); ctx.moveTo(this.size * 2.5, 0); ctx.lineTo(-this.size, -this.size); ctx.lineTo(-this.size * 0.5, 0); ctx.lineTo(-this.size, this.size); ctx.closePath();
        ctx.shadowBlur = 15; ctx.shadowColor = this.color; ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(this.size * 0.5, 0, this.size * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      galaxyParticles = []; stars = []; ships = [];
      for (let i = 0; i < 1500; i++) galaxyParticles.push(new GalaxyParticle());
      for (let i = 0; i < 300; i++) stars.push(new Star());
      for (let i = 0; i < 7; i++) ships.push(new Spaceship());
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(2,6,23,0.3)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      let gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 500);
      gradient.addColorStop(0, 'rgba(88,28,135,0.15)'); gradient.addColorStop(0.5, 'rgba(30,58,138,0.05)'); gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
      galaxyParticles.forEach(p => { p.update(); p.draw(); });
      stars.forEach(s => { s.update(); s.draw(); });
      ships.forEach(s => { s.update(); s.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };

    init(); animate();
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('resize', setCanvasSize); window.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 font-sans overflow-x-hidden selection:bg-pink-500/30">
      <StarCanvas canvasRef={canvasRef} />
      {result
        ? <ResultsPage result={result} fileName={fileName} onBack={handleBack} />
        : <UploadPage onResult={handleResult} />
      }
    </div>
  );
}

export default App;
