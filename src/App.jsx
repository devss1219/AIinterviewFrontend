import { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Zap, ChevronRight, Activity } from 'lucide-react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef(null);

  // Custom 2D Engine (Deep Nebula + UNEVEN Starfield)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let ships = [];
    let stars = [];
    let galaxyParticles = [];

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    let mouse = { x: -1000, y: -1000, radius: 180 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });

    // --- 1. GALAXY CLASS ---
    class GalaxyParticle {
      constructor() {
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        let armIndex = Math.floor(Math.random() * 3);
        let baseAngle = (Math.PI * 2 / 3) * armIndex;
        let maxRadius = Math.max(canvas.width, canvas.height) * 0.8;

        this.distance = Math.pow(Math.random(), 2.5) * maxRadius;
        let spiralOffset = this.distance * 0.005;
        let spread = (Math.random() - 0.5) * (this.distance * 0.2 + 10);

        this.angle = baseAngle + spiralOffset + spread;
        this.size = Math.random() * 2 + 0.5;
        this.speed = (Math.random() * 0.0008) + 0.0002;

        const colors = [
          'rgba(88, 28, 135, 0.7)',
          'rgba(147, 51, 234, 0.5)',
          'rgba(30, 64, 175, 0.6)',
          'rgba(59, 130, 246, 0.4)',
          'rgba(16, 185, 129, 0.3)',
          'rgba(6, 182, 212, 0.4)'
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.angle -= this.speed;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
      }

      draw() {
        let x = this.centerX + Math.cos(this.angle) * this.distance;
        let y = this.centerY + Math.sin(this.angle) * this.distance;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);

        if (this.distance < 250) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // --- 2. STAR CLASS (Uneven Sizes & Shapes) ---
    class Star {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;

        let rand = Math.random();
        if (rand > 0.85) {
          this.size = Math.random() * 4 + 2;
          this.isGiant = true;
        } else {
          this.size = Math.random() * 1.2 + 0.3;
          this.isGiant = false;
        }

        this.density = (Math.random() * 30) + 10;
        this.opacity = Math.random() * 0.4 + 0.1;

        const colors = ['147, 51, 234,', '59, 130, 246,', '16, 185, 129,', '167, 139, 250,'];
        this.colorStr = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.baseY -= 0.15;
        if (this.baseY < -15) {
          this.baseY = canvas.height + 15;
          this.y = this.baseY;
          this.baseX = Math.random() * canvas.width;
          this.x = this.baseX;
        }

        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          let forceDirX = dx / dist;
          let forceDirY = dy / dist;

          this.x -= forceDirX * force * this.density;
          this.y -= forceDirY * force * this.density;
          this.opacity = 1;
        } else {
          if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 15;
          if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 15;
          if (this.opacity > 0.2) this.opacity -= 0.03;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(${this.colorStr} ${this.opacity})`;
        ctx.beginPath();

        if (this.isGiant) {
          ctx.moveTo(this.x, this.y - this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x + this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y + this.size);
          ctx.quadraticCurveTo(this.x, this.y, this.x - this.size, this.y);
          ctx.quadraticCurveTo(this.x, this.y, this.x, this.y - this.size);
        } else {
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        }

        if (this.opacity > 0.8) {
          ctx.shadowBlur = this.isGiant ? 15 : 5;
          ctx.shadowColor = `rgba(${this.colorStr} 1)`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // --- 3. SPACESHIP CLASS ---
    class Spaceship {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 3.5;
        this.vy = (Math.random() - 0.5) * 3.5;
        this.size = Math.random() * 5 + 15;
        const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#06b6d4'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.maxSpeed = Math.random() * 1.8 + 2.0;
      }

      update() {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius + 80) {
          let force = ((mouse.radius + 80) - dist) / (mouse.radius + 80);
          this.vx += (dx / dist) * force * 0.3;
          this.vy += (dy / dist) * force * 0.3;
        }

        let speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed + 1.5) {
          this.vx *= 0.95;
          this.vy *= 0.95;
        } else if (speed < this.maxSpeed && dist >= mouse.radius + 80) {
          this.vx *= 1.01;
          this.vy *= 1.01;
        }

        this.x += this.vx;
        this.y += this.vy;

        let margin = this.size * 3;
        if (this.x < -margin) this.x = canvas.width + margin;
        if (this.x > canvas.width + margin) this.x = -margin;
        if (this.y < -margin) this.y = canvas.height + margin;
        if (this.y > canvas.height + margin) this.y = -margin;
      }

      draw() {
        let angle = Math.atan2(this.vy, this.vx);
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.fillStyle = `rgba(${Math.random() * 50}, ${Math.random() * 150 + 100}, 255, 0.8)`;
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(-this.size - (Math.random() * 20 + 15), -this.size / 2.5);
        ctx.lineTo(-this.size - (Math.random() * 20 + 15), this.size / 2.5);
        ctx.fill();

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size * 2.5, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();

        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.size * 0.5, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const init = () => {
      galaxyParticles = [];
      stars = [];
      ships = [];

      for (let i = 0; i < 1500; i++) galaxyParticles.push(new GalaxyParticle());
      for (let i = 0; i < 300; i++) stars.push(new Star());
      for (let i = 0; i < 7; i++) ships.push(new Spaceship());
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, 500);
      gradient.addColorStop(0, 'rgba(88, 28, 135, 0.15)');
      gradient.addColorStop(0.5, 'rgba(30, 58, 138, 0.05)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      galaxyParticles.forEach(particle => { particle.update(); particle.draw(); });
      stars.forEach(star => { star.update(); star.draw(); });
      ships.forEach(ship => { ship.update(); ship.draw(); });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- UI LOGIC ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file only.");
    }
  };

  const handleStartInterview = async () => {
    if (!file) {
      alert("Please upload your Resume first!");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("AI Extracted Data:", response.data);
      alert(`System Online! Resume analysed successfully. Enhancements ready.`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Connection to AI Core failed. Check server status.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative h-screen bg-[#020617] text-slate-300 font-sans overflow-hidden selection:bg-pink-500/30">

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      />

      {/* Vertical layout — locked to viewport height, no scroll */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 gap-3 sm:gap-4">

        {/* Status pill */}
        <div className="flex items-center space-x-2 px-4 py-1.5 bg-slate-900/40 border border-slate-700/40 rounded-full backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.1)]">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse shadow-[0_0_8px_#ec4899]" />
          <span className="text-[10px] sm:text-xs font-mono text-pink-300 tracking-[0.2em]">NEURAL RESUME ENGINE V3.0</span>
        </div>

        {/* Hero heading */}
        <div className="text-center">
          <p
            className="font-mono tracking-[0.4em] uppercase leading-none mb-1 text-slate-200"
            style={{ fontSize: 'clamp(0.85rem, 2.2vw, 1.15rem)', textShadow: '0 0 12px rgba(148,163,184,0.4)' }}
          >
            Supercharge Your
          </p>

          <div className="relative inline-block" style={{ overflow: 'visible' }}>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-6 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse 90% 100% at 50% 120%, rgba(236,72,153,0.45) 0%, transparent 70%)',
                filter: 'blur(10px)',
              }}
            />
            <h1
              className="interview-heading relative leading-none"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Resume
            </h1>
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

          <label
            htmlFor="resume-upload"
            className="relative flex flex-col items-center justify-center w-full h-28 bg-black/40 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer hover:border-pink-500/50 hover:bg-slate-900/50 transition-all duration-500 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex flex-col items-center justify-center">
              <div className="p-2.5 bg-white/5 rounded-full mb-2 group-hover:bg-pink-500/20 transition-colors duration-500">
                <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-pink-400 transition-colors" />
              </div>
              <p className="text-xs font-mono text-slate-500 group-hover:text-pink-300 transition-colors">
                {file ? "Upload a different Resume" : "Click to upload Resume (PDF)"}
              </p>
            </div>
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="mt-3 p-3 bg-pink-900/10 border border-pink-500/20 rounded-xl flex items-center justify-between backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-pink-500/20 rounded-lg">
                  <FileText className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-xs font-mono text-pink-200 truncate max-w-[200px]">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-[10px] text-red-400/60 hover:text-red-400 uppercase tracking-widest font-bold px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors"
              >
                Abort
              </button>
            </div>
          )}

          <button
            onClick={handleStartInterview}
            disabled={isUploading}
            className={`mt-4 w-full py-3 rounded-xl font-mono text-[12px] font-bold flex items-center justify-center space-x-3 transition-all duration-500 relative overflow-hidden group ${file
              ? "bg-slate-800/80 text-pink-400 border border-pink-500/30 hover:bg-gradient-to-r hover:from-pink-600 hover:to-fuchsia-600 hover:text-white hover:border-transparent hover:shadow-[0_0_30px_rgba(236,72,153,0.5)]"
              : "bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed"
              }`}
          >
            {isUploading ? (
              <Activity className="w-4 h-4 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
            <span className="tracking-[0.2em] uppercase">
              {isUploading ? "Analysing Resume..." : "Enhance My Resume"}
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}

export default App;
