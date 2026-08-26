import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Activity, CheckCircle, AlertTriangle, Tag, TrendingUp, Briefcase, ArrowLeft, Search, Play, HelpCircle } from 'lucide-react';
import axios from 'axios';

// ── Animated Sine Graph Background ───────────────────────────────────────────
function SineWaveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cy = canvas.height / 2;

      // 1. Draw Faint Graph Grid
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(243, 239, 224, 0.03)'; // Faint Creme
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 60) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
      }
      for (let i = 0; i < canvas.height; i += 60) {
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
      }
      ctx.stroke();

      // 2. Draw Center X-Axis
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(243, 239, 224, 0.08)';
      ctx.moveTo(0, cy);
      ctx.lineTo(canvas.width, cy);
      ctx.stroke();

      // 3. Draw Primary Glowing Orange Sine Wave
      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.6)'; // Tailwind orange-600
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(234, 88, 12, 0.8)'; // Orange glow

      const amplitude1 = 120;
      const frequency1 = 0.003;

      for (let x = 0; x < canvas.width; x++) {
        const y = cy + Math.sin(x * frequency1 + time) * amplitude1;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Draw Secondary Offset Sine Wave (for depth)
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.2)';
      ctx.shadowBlur = 8;

      const amplitude2 = 200;
      const frequency2 = 0.0015;

      for (let x = 0; x < canvas.width; x++) {
        const y = cy + Math.sin(x * frequency2 + time * 1.5 + Math.PI) * amplitude2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Increment time to animate
      time -= 0.015;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// ── Animated Score Ring ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 100, stroke = 8, color = '#ea580c' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(243, 239, 224, 0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-out', filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
}

const scoreColor = (s) => s >= 75 ? '#ea580c' : s >= 50 ? '#fb923c' : '#F3EFE0';
const scoreLabel = (s) => s >= 75 ? 'Strong' : s >= 50 ? 'Average' : 'Needs Work';

// ── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ result, fileName, onBack }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#F3EFE0]/10">
        <div>
          <h2 className="text-2xl font-bold text-creme">Analysis Results</h2>
          <p className="text-sm text-creme-muted mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange" /> {fileName}
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-creme hover:text-white glass-panel px-4 py-2 rounded-lg transition-all hover:border-orange/50 hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Analyze Another
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        {/* Overall Score */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4 rounded-2xl">
          <div className="relative">
            <ScoreRing score={result.overallScore} size={140} stroke={12} color={scoreColor(result.overallScore)} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-creme drop-shadow-md">{result.overallScore}</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-creme-muted uppercase tracking-widest">Overall Score</h3>
            <span className="text-xl font-bold mt-1 block" style={{ color: scoreColor(result.overallScore) }}>
              {scoreLabel(result.overallScore)}
            </span>
          </div>
        </div>

        {/* ATS Score */}
        <div className="glass-panel p-6 flex flex-col items-center justify-center gap-4 rounded-2xl">
          <div className="relative">
            <ScoreRing score={result.atsScore} size={140} stroke={12} color="#F3EFE0" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-creme drop-shadow-md">{result.atsScore}</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-sm font-semibold text-creme-muted uppercase tracking-widest">ATS Match</h3>
            <span className="text-xl font-bold mt-1 block text-creme">
              {scoreLabel(result.atsScore)}
            </span>
          </div>
        </div>

        {/* Verdict */}
        <div className="bg-gradient-to-br from-orange-600/30 to-orange-900/30 backdrop-blur-xl border border-orange/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(234,88,12,0.15)] flex flex-col justify-center">
          <h3 className="text-xs font-semibold text-orange-200 uppercase tracking-wide mb-2">Verdict</h3>
          <p className="text-sm font-medium text-creme leading-relaxed">
            "{result.verdict}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Section Breakdown */}
        <div className="glass-panel p-6 rounded-2xl col-span-2">
          <h3 className="text-base font-semibold text-creme mb-6">Section Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {Object.entries(result.sections).map(([key, val]) => {
              const maxVal = key === 'experience' ? 30 : key === 'skills' || key === 'education' ? 20 : 10;
              const pct = Math.round((val / maxVal) * 100);
              return (
                <div key={key}>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-xl font-bold" style={{ color: scoreColor(pct) }}>{val}</span>
                    <span className="text-xs font-medium text-creme-muted">/ {maxVal}</span>
                  </div>
                  <div className="text-xs font-medium text-creme-muted uppercase tracking-wide mb-2">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className="h-1.5 w-full bg-[#F3EFE0]/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full relative" style={{ width: `${pct}%`, backgroundColor: scoreColor(pct) }}>
                      <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Suitable Roles */}
        {result.suitableRoles && (
          <div className="glass-panel p-6 rounded-2xl flex-1">
            <h3 className="text-base font-semibold text-creme mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-orange" /> Suitable Roles
            </h3>
            <div className="flex flex-col gap-3">
              {result.suitableRoles.slice(0, 3).map((role, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-black/40 rounded-lg border border-[#F3EFE0]/10">
                  <span className="text-xs font-semibold text-orange w-4">0{i + 1}</span>
                  <span className="text-sm font-medium text-creme">{role}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-creme mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-orange" /> Top Strengths
          </h3>
          <ul className="flex flex-col gap-4">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-orange text-sm mt-0.5">✓</span>
                <p className="text-sm text-creme-muted leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-base font-semibold text-creme mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#F3EFE0]" /> Areas for Improvement
          </h3>
          <ul className="flex flex-col gap-4">
            {result.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-[#F3EFE0] text-sm font-bold mt-0.5">!</span>
                <p className="text-sm text-creme-muted leading-relaxed">{imp}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Keywords */}
      <div className="glass-panel p-6 rounded-2xl mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-creme mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange" /> Keywords Found
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.keywords.map((k, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 bg-[#F3EFE0]/5 text-creme rounded-md border border-[#F3EFE0]/10">{k}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-creme mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F3EFE0]" /> Missing Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((k, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 bg-orange/10 text-orange-200 rounded-md border border-orange/20">{k}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload Page ───────────────────────────────────────────────────────────────
function UploadPage({ onResult }) {
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleJdFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setJdFile(selectedFile);
    } else {
      alert("Please upload a PDF file only for the Job Description.");
    }
  };

  const handleAnalyse = async () => {
    if (!file) { alert("Please upload your Resume first!"); return; }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);
    if (jdText.trim()) formData.append("jd", jdText.trim());
    if (jdFile) formData.append("jdFile", jdFile);

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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col relative z-10 min-h-screen">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange rounded-lg flex items-center justify-center text-black font-bold text-base sm:text-lg shadow-[0_0_15px_rgba(234,88,12,0.4)]">
            G
          </div>
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-bold text-creme tracking-wide">Galactus</h1>
            <span className="text-orange font-medium text-[10px] sm:text-xs">Resume Analyzer</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="mb-8 text-center max-w-2xl mx-auto px-2">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-creme mb-3 tracking-tight drop-shadow-lg leading-tight">
          Evaluate your <span className="text-orange">resume.</span>
        </h2>
        <p className="text-sm sm:text-base text-creme-muted">Upload your resume and optionally provide a job description to get AI-powered scoring, feedback, and optimization tips.</p>
      </div>

      {/* Main Grid: Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 w-full flex-1">

        {/* Left Side: Resume */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col">
          <div className="mb-4 sm:mb-5">
            <h3 className="text-sm sm:text-base font-semibold text-creme">1. Upload Resume</h3>
            <p className="text-xs sm:text-sm text-creme-muted mt-1">Your primary PDF document</p>
          </div>

          <label htmlFor="resume-upload" className="w-full flex-1 min-h-[140px] sm:min-h-[160px] border-2 border-dashed border-[#F3EFE0]/20 hover:border-orange hover:bg-orange/5 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/50 border border-[#F3EFE0]/10 group-hover:border-orange/50 group-hover:bg-orange/10 flex items-center justify-center mb-3 sm:mb-4 shadow-sm transition-all">
              <UploadCloud className="w-5 h-5 text-creme-muted group-hover:text-orange transition-colors" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-creme-muted group-hover:text-creme transition-colors">
              {file ? "Change PDF File" : "Click to select a PDF"}
            </span>
            <input id="resume-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
          </label>

          {file && (
            <div className="mt-4 w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-black/40 rounded-lg border border-[#F3EFE0]/10">
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <FileText className="w-4 h-4 text-orange shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-creme truncate">{file.name}</span>
              </div>
              <button onClick={() => setFile(null)} className="text-[10px] sm:text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 ml-2 transition-colors">Remove</button>
            </div>
          )}
        </div>

        {/* Right Side: Job Description */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col">
          <div className="mb-4 sm:mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-creme">2. Target Job <span className="text-creme-muted font-normal">(Optional)</span></h3>
              <p className="text-xs sm:text-sm text-creme-muted mt-1">Paste text or upload a JD file</p>
            </div>
            <HelpCircle className="w-4 h-4 text-creme/30 hidden sm:block" />
          </div>

          <textarea
            placeholder="Paste job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="w-full h-20 sm:h-24 p-3 sm:p-4 bg-black/40 border border-[#F3EFE0]/10 rounded-xl text-xs sm:text-sm text-creme placeholder-creme/30 focus:outline-none focus:border-orange/60 focus:ring-1 focus:ring-orange/50 resize-none mb-4 sm:mb-5 transition-all shadow-inner"
          />

          <div className="flex items-center gap-3 mb-4 sm:mb-5">
            <div className="h-px bg-[#F3EFE0]/10 flex-1" />
            <span className="text-[10px] sm:text-xs font-semibold text-creme/30 uppercase tracking-widest">OR</span>
            <div className="h-px bg-[#F3EFE0]/10 flex-1" />
          </div>

          <label htmlFor="jd-upload" className="w-full py-3 sm:py-4 border-2 border-dashed border-[#F3EFE0]/20 hover:border-orange hover:bg-orange/5 rounded-xl flex items-center justify-center cursor-pointer transition-all group">
            <UploadCloud className="w-4 h-4 text-creme-muted group-hover:text-orange mr-2 transition-colors" />
            <span className="text-xs sm:text-sm font-medium text-creme-muted group-hover:text-creme transition-colors">
              {jdFile ? "Change JD File" : "Upload JD (PDF)"}
            </span>
            <input id="jd-upload" type="file" accept="application/pdf" className="hidden" onChange={handleJdFileChange} />
          </label>

          {jdFile && (
            <div className="mt-4 w-full flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 bg-black/40 rounded-lg border border-[#F3EFE0]/10">
              <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                <FileText className="w-4 h-4 text-creme-muted shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-creme truncate">{jdFile.name}</span>
              </div>
              <button onClick={() => setJdFile(null)} className="text-[10px] sm:text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 ml-2 transition-colors">Remove</button>
            </div>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="flex justify-center pb-8 sm:pb-10">
        <button onClick={handleAnalyse} disabled={isUploading || !file}
          className={`px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl font-bold text-sm sm:text-base flex items-center gap-3 transition-all ${file
              ? "glass-button hover:-translate-y-0.5 w-full sm:w-auto justify-center shadow-[0_0_20px_rgba(234,88,12,0.3)]"
              : "bg-white/5 text-creme/30 border border-white/5 cursor-not-allowed w-full sm:w-auto justify-center"
            }`}>
          {isUploading ? <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-creme" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
          {isUploading ? "Analyzing Document..." : "Generate Analysis"}
        </button>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState('');

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

  return (
    <div className="min-h-screen app-root font-sans relative overflow-hidden">

      {/* 1. Animated Canvas Background */}
      <SineWaveBackground />

      {/* 2. Soft Background Orbs for ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#F3EFE0]/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* 3. Main Content (z-10 puts the glass panels OVER the canvas) */}
      <div className="relative z-10">
        {result
          ? <ResultsPage result={result} fileName={fileName} onBack={handleBack} />
          : <UploadPage onResult={handleResult} />
        }
      </div>
    </div>
  );
}

export default App;
