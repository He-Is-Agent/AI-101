import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Github, 
  Mail, 
  Terminal, 
  Gamepad2, 
  TrendingUp, 
  Sliders, 
  ExternalLink,
  Flame,
  Wrench,
  Search,
  BookOpen,
  ArrowUpRight,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  AI_MODELS, 
  GPUS, 
  calculateCompatibility, 
  AIModel, 
  GPUModel, 
  CompatibilityResult 
} from './data';

// Define Game performance estimator data
interface GamePreset {
  name: string;
  genre: string;
  baseFps1080p: number; // relative to mid-tier GPU like RTX 3060
  vramDemandGb: number;
  engine: string;
}

const POPULAR_GAMES: GamePreset[] = [
  { name: 'Cyberpunk 2077 (Ray Tracing)', genre: 'Action RPG', baseFps1080p: 45, vramDemandGb: 10.5, engine: 'REDengine 4' },
  { name: 'Black Myth: Wukong (Cinematic)', genre: 'Action RPG', baseFps1080p: 40, vramDemandGb: 11.2, engine: 'Unreal Engine 5' },
  { name: 'Counter-Strike 2 (Competitive)', genre: 'FPS / Esports', baseFps1080p: 280, vramDemandGb: 4.5, engine: 'Source 2' },
  { name: 'Grand Theft Auto V (Ultra)', genre: 'Sandbox / Action', baseFps1080p: 120, vramDemandGb: 3.8, engine: 'RAGE' },
  { name: 'Elden Ring (Max Settings)', genre: 'Action RPG', baseFps1080p: 60, vramDemandGb: 5.8, engine: 'PhyreEngine' }
];

export default function App() {
  // Navigation active tab (local page anchors)
  const [activeSection, setActiveSection] = useState('masthead');

  // Time clock state
  const [localTime, setLocalTime] = useState<string>('');

  // Hardware AI Compatibility state
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[3]); // Default: DeepSeek-R1 8B
  const [selectedGpu, setSelectedGpu] = useState<GPUModel>(GPUS[0]); // Default: RTX 4090
  const [userVramOverride, setUserVramOverride] = useState<string>('');
  const [systemRam, setSystemRam] = useState<number>(32); // Default: 32GB RAM
  const [quantization, setQuantization] = useState<'fp16' | 'int8' | 'int4'>('int4'); // Default: INT4
  const [detectedGpuName, setDetectedGpuName] = useState<string>('');

  // Gaming benchmark state
  const [selectedGame, setSelectedGame] = useState<GamePreset>(POPULAR_GAMES[0]);
  const [gamingResolution, setGamingResolution] = useState<'1080p' | '1440p' | '4k'>('1440p');
  const [rayTracing, setRayTracing] = useState<boolean>(true);

  // Message form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formMessages, setFormMessages] = useState<Array<typeof formData>>([]);

  // Hardware Spec Auditor state
  const [auditorCpu, setAuditorCpu] = useState<'4core' | '6core' | '8core' | '12core' | '16core'>('8core');
  const [auditorRam, setAuditorRam] = useState<'ddr4-single' | 'ddr4-dual' | 'ddr5-dual' | 'unified-lp'>('ddr5-dual');
  const [auditorStorage, setAuditorStorage] = useState<'hdd' | 'sata-ssd' | 'nvme-gen3' | 'nvme-gen4'>('nvme-gen4');
  const [auditorGpuClass, setAuditorGpuClass] = useState<'low' | 'mid' | 'high' | 'enthusiast'>('high');
  const [auditorTask, setAuditorTask] = useState<'inference' | 'rt-gaming' | 'compilation' | 'streaming'>('inference');

  // Auto-detect browser GPU on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
          if (renderer) {
            // e.g., "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Ti/PCIe/SSE2, OpenGL 4.5.0)"
            setDetectedGpuName(renderer);
            
            // Try to match with existing list
            const matchedGpu = GPUS.find(gpu => 
              renderer.toLowerCase().includes(gpu.name.split(' ').slice(2).join(' ').toLowerCase()) ||
              renderer.toLowerCase().includes(gpu.brand.toLowerCase() + ' ' + gpu.name.toLowerCase()) ||
              gpu.name.split(' ').some(part => part.length > 2 && renderer.toLowerCase().includes(part.toLowerCase()))
            );
            if (matchedGpu) {
              setSelectedGpu(matchedGpu);
            }
          }
        }
      }
    } catch (e) {
      console.warn('WebGL GPU detection not supported or blocked in iframe');
    }
  }, []);

  // Set real-time clock
  useEffect(() => {
    const updateTime = () => {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Karachi', // Muneeb's native location (Pakistan)
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const pkrTime = new Intl.DateTimeFormat('en-US', options).format(new Date());
      setLocalTime(pkrTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll monitor to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['masthead', 'compatibility-engine', 'case-study', 'gaming-tuning', 'skills', 'contact'];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Run AI compatibility calculations
  const parsedVramOverride = parseFloat(userVramOverride) || 0;
  const compatibility: CompatibilityResult = calculateCompatibility(
    selectedModel,
    selectedGpu,
    parsedVramOverride,
    systemRam,
    quantization
  );

  // Compute Game FPS Estimation
  const calculateEstimatedFps = () => {
    const gpuVram = parsedVramOverride > 0 ? parsedVramOverride : selectedGpu.vram;
    const bandwidth = selectedGpu.bandwidth;
    
    // Core performance score based on VRAM and bandwidth
    let hardwareMultiplier = (bandwidth / 450) * (gpuVram / 12);
    if (selectedGpu.brand === 'Apple') hardwareMultiplier *= 0.75; // Translation layer/emulation scaling
    if (selectedGpu.brand === 'Intel') hardwareMultiplier *= 0.85; // Driver overhead adjustment
    
    let baseFps = selectedGame.baseFps1080p * hardwareMultiplier;
    
    // Adjust resolution penalty
    if (gamingResolution === '1440p') {
      baseFps *= 0.70; // ~30% loss
    } else if (gamingResolution === '4k') {
      baseFps *= 0.40; // ~60% loss
    }
    
    // Ray tracing penalty
    if (rayTracing && selectedGame.name.includes('Ray Tracing')) {
      // Game already lists Ray Tracing base, so we don't double penalize heavily
      baseFps *= 0.85;
    } else if (rayTracing) {
      // General game, heavy hit
      baseFps *= 0.55; // 45% loss
    }
    
    // Low VRAM penalty
    if (gpuVram < selectedGame.vramDemandGb) {
      const deficit = selectedGame.vramDemandGb - gpuVram;
      const penalty = Math.max(0.2, 1 - (deficit * 0.15)); // severe drop due to asset swapping
      baseFps *= penalty;
    }

    return Math.round(Math.max(5, baseFps));
  };

  const estimatedFps = calculateEstimatedFps();

  // Dynamic auditor calculation
  const calculateAuditorMetrics = () => {
    let score = 100;
    let bottleneckCulprit = 'None';
    let diagnosticDetails = '';
    
    // CPU deductions
    let cpuRating = 0;
    if (auditorCpu === '4core') { cpuRating = 30; score -= 25; }
    else if (auditorCpu === '6core') { cpuRating = 60; score -= 10; }
    else if (auditorCpu === '8core') { cpuRating = 85; }
    else { cpuRating = 100; }
    
    // RAM deductions
    let ramRating = 0;
    if (auditorRam === 'ddr4-single') { ramRating = 20; score -= 30; }
    else if (auditorRam === 'ddr4-dual') { ramRating = 55; score -= 15; }
    else if (auditorRam === 'ddr5-dual') { ramRating = 85; }
    else { ramRating = 100; }
    
    // Storage deductions
    let storageRating = 0;
    if (auditorStorage === 'hdd') { storageRating = 10; score -= 40; }
    else if (auditorStorage === 'sata-ssd') { storageRating = 50; score -= 15; }
    else if (auditorStorage === 'nvme-gen3') { storageRating = 80; score -= 5; }
    else { storageRating = 100; }

    // GPU class value
    let gpuRating = 0;
    if (auditorGpuClass === 'low') { gpuRating = 30; score -= 25; }
    else if (auditorGpuClass === 'mid') { gpuRating = 60; score -= 10; }
    else if (auditorGpuClass === 'high') { gpuRating = 85; }
    else { gpuRating = 100; }

    // Task specific adjustments and bottleneck detection
    if (auditorTask === 'inference') {
      // Memory bottleneck is primary
      if (auditorRam === 'ddr4-single' || auditorRam === 'ddr4-dual') {
        bottleneckCulprit = 'System Memory (RAM) Bandwidth';
        diagnosticDetails = 'Local AI model parameters require fast bus speeds. Your DDR4 configuration limits transfer rates to under 50 GB/s. Offloaded LLM layers will experience high latency.';
      } else if (auditorGpuClass === 'low' || auditorGpuClass === 'mid') {
        bottleneckCulprit = 'GPU Tensor Processing/VRAM';
        diagnosticDetails = 'The graphics processor lacks the dedicated matrix compute cores and VRAM capacity to load the active neural layers fully, causing CPU fallback.';
      } else if (auditorStorage === 'hdd') {
        bottleneckCulprit = 'Mechanical Hard Drive Storage';
        diagnosticDetails = 'Loading large 5GB-40GB model weights into memory will take several minutes. Asset streaming is severely bottlenecked.';
      } else {
        bottleneckCulprit = 'None (Highly Balanced)';
        diagnosticDetails = 'Excellent hardware coupling! Your NVMe storage and dual-channel DDR5 or unified RAM will supply the GPU cores with minimal idle delay.';
      }
    } else if (auditorTask === 'rt-gaming') {
      // GPU is primary, storage/CPU secondary
      if (auditorGpuClass === 'low' || auditorGpuClass === 'mid') {
        bottleneckCulprit = 'Graphics Processor (GPU)';
        diagnosticDetails = 'Ray Tracing calculations require intensive hardware BVH traversal units. Your selected GPU class will severely drop performance below 30 FPS.';
      } else if (auditorCpu === '4core' || auditorCpu === '6core') {
        bottleneckCulprit = 'Central Processor (CPU)';
        diagnosticDetails = 'Modern game engines (Unreal 5, REDengine) are heavily multi-threaded. Low core counts create frame-time stuttering spikes.';
      } else if (auditorStorage === 'hdd') {
        bottleneckCulprit = 'Mechanical Hard Drive Storage';
        diagnosticDetails = 'Asset streaming bottlenecks! High-resolution texture meshes will stream too slowly, causing severe visible pop-in and stuttering.';
      } else {
        bottleneckCulprit = 'None (Optimally Tuned)';
        diagnosticDetails = 'Uncapped potential! Your high-end GPU and modern multi-core CPU will drive high frame-rates with clean, flat frame-times.';
      }
    } else if (auditorTask === 'compilation') {
      // CPU is primary, storage secondary
      if (auditorCpu === '4core' || auditorCpu === '6core') {
        bottleneckCulprit = 'CPU Thread Count';
        diagnosticDetails = 'Parallel code compilation scales directly with physical cores and threads. Low cores will stretch build cycles significantly.';
      } else if (auditorStorage === 'hdd' || auditorStorage === 'sata-ssd') {
        bottleneckCulprit = 'Storage Read/Write IOPS';
        diagnosticDetails = 'Compiler IO involves reading and writing thousands of tiny source/header files. HDD/SATA drives lack the random IOPS capacity of NVMe drives.';
      } else {
        bottleneckCulprit = 'None (Workstation Grade)';
        diagnosticDetails = 'Your multi-core CPU combined with high-speed NVMe writes will compile large software packages at maximum possible throughput.';
      }
    } else if (auditorTask === 'streaming') {
      // Mixed CPU/GPU load
      if (auditorCpu === '4core') {
        bottleneckCulprit = 'CPU Resource Pools';
        diagnosticDetails = 'Streaming while gaming requires background video encoding threads. A 4-core CPU will starve the system, causing dropped frames.';
      } else if (auditorGpuClass === 'low') {
        bottleneckCulprit = 'GPU Hardware Encoder (NVENC/AV1)';
        diagnosticDetails = 'Lacking support for modern hardware-accelerated encodings will force slow CPU software encoding (x264), dragging gaming performance down.';
      } else {
        bottleneckCulprit = 'None (Broadcaster Grade)';
        diagnosticDetails = 'Clean streaming pipeline. Dedicated hardware GPU encoding will capture frames with virtually 0% impact on game-loop thread execution.';
      }
    }

    const calculatedScore = Math.max(15, Math.min(100, score));
    return {
      score: calculatedScore,
      bottleneckCulprit,
      diagnosticDetails,
      ratings: {
        cpu: cpuRating,
        ram: ramRating,
        storage: storageRating,
        gpu: gpuRating
      }
    };
  };

  const auditorResults = calculateAuditorMetrics();

  // Handle contact form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setFormMessages([formData, ...formMessages]);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen paper-texture font-sans text-[#222222] selection:bg-[#eae6d8] selection:text-black antialiased relative">
      
      {/* Editorial Decorative Top Stripe */}
      <div className="h-2 bg-[#1a1a1a] w-full" />

      {/* Floating Mini Navigation / Sticky Header */}
      <nav className="sticky top-0 bg-[#fcfbf7]/95 backdrop-blur-md border-b border-editorial z-40 px-4 md:px-12 py-3 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollTo('masthead')}>
            <span className="font-serif font-bold text-lg tracking-tight uppercase">The Unbeknownst</span>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#eae6d8] rounded text-[#555]">INQUISTIVE</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium tracking-wide">
            <button 
              onClick={() => scrollTo('compatibility-engine')} 
              className={`hover:text-black transition-colors ${activeSection === 'compatibility-engine' ? 'text-black underline underline-offset-4 decoration-2' : 'text-[#666]'}`}
            >
              Compatibility Engine
            </button>
            <button 
              onClick={() => scrollTo('case-study')} 
              className={`hover:text-black transition-colors ${activeSection === 'case-study' ? 'text-black underline underline-offset-4 decoration-2' : 'text-[#666]'}`}
            >
              Hardware Correlation Project
            </button>
            <button 
              onClick={() => scrollTo('gaming-tuning')} 
              className={`hover:text-black transition-colors ${activeSection === 'gaming-tuning' ? 'text-black underline underline-offset-4 decoration-2' : 'text-[#666]'}`}
            >
              Gaming Diagnostics
            </button>
            <button 
              onClick={() => scrollTo('skills')} 
              className={`hover:text-black transition-colors ${activeSection === 'skills' ? 'text-black underline underline-offset-4 decoration-2' : 'text-[#666]'}`}
            >
              Technical Expertise
            </button>
            <button 
              onClick={() => scrollTo('contact')} 
              className={`hover:text-black transition-colors ${activeSection === 'contact' ? 'text-black underline underline-offset-4 decoration-2' : 'text-[#666]'}`}
            >
              Connect
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] font-mono text-[#777] uppercase tracking-wider">PAKISTAN TIME</span>
              <span className="text-xs font-mono font-medium text-black">{localTime || '12:00:00 PM'}</span>
            </div>
            <button 
              onClick={() => scrollTo('compatibility-engine')}
              className="bg-[#1a1a1a] text-white text-xs font-mono px-4 py-2 hover:bg-[#333] transition-colors rounded-sm tracking-wide uppercase"
            >
              Launch Engine
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-12 py-8 space-y-24">
        
        {/* Section 1: Masthead Header (Newspaper/Editorial Style) */}
        <header id="masthead" className="pt-8 border-b border-editorial pb-12 space-y-8">
          <div className="text-center space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#666]">
              • Portfolio Vol. 1 — Issue #04 • Est. 2026 • Real-time Hardware Diagnostics
            </p>
            
            <h1 className="font-serif font-black text-5xl md:text-8xl tracking-tight leading-none text-black uppercase">
              MUNEEB AHMAD
            </h1>
            
            <div className="h-px bg-black/10 my-4 max-w-2xl mx-auto" />
            
            <h2 className="font-serif italic text-xl md:text-3xl text-[#444] max-w-3xl mx-auto font-medium">
              "Exploring the intersection of physical silicon architecture, high-performance tuning, and Large Language Model compilation."
            </h2>
          </div>

          {/* Editorial Grid Introduction */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 text-[#444]">
            <div className="border-t border-editorial pt-4 space-y-2">
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">01 / PERSPECTIVE</span>
              <p className="text-sm leading-relaxed">
                As an avid PC gamer and hardware specialist, my engineering philosophy revolves around <strong>hardware-agnostic testing</strong> and eliminating architectural bottlenecks. I analyze systems not just as general devices, but as highly specific pipelines of raw processing power and thermal dissipation.
              </p>
            </div>
            
            <div className="border-t border-editorial pt-4 space-y-2">
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">02 / CORE INQUIRY</span>
              <p className="text-sm leading-relaxed">
                I am deeply intrigued by the massive scale of <strong>Large Language Models (LLMs)</strong> and machine learning pipelines. My current projects look into quantization models (GGUF, AWQ, EXL2) to verify how consumer-grade silicon can load and run heavy reasoning models without standard enterprise nodes.
              </p>
            </div>

            <div className="border-t border-editorial pt-4 space-y-2 bg-[#f6f4eb] p-4 rounded-sm border border-editorial">
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider flex items-center gap-1.5 block">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                CURRENT FOCUS & STATUS
              </span>
              <p className="text-sm leading-relaxed text-[#222]">
                Evaluating consumer GPUs (NVIDIA Ada, AMD RDNA3, Apple Unified memory) against <strong>DeepSeek-R1 reasoning models</strong> to discover real token-to-bandwidth throughput and latency limits. 
              </p>
              {detectedGpuName && (
                <div className="mt-2 text-[11px] font-mono bg-white/60 p-2 rounded border border-black/5 text-[#555]">
                  <span className="font-bold">Detected client GPU:</span> {detectedGpuName.split('ANGLE (').pop()?.split(')').shift() || detectedGpuName}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Section 2: Interactive Hardware-AI Compatibility Engine */}
        <section id="compatibility-engine" className="space-y-8 scroll-mt-20">
          <div className="border-b border-[#222] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-[#1a1a1a] text-white font-mono text-[10px] tracking-widest rounded-sm uppercase">Engine</span>
                <span className="font-mono text-xs text-[#777] uppercase tracking-wider">PROJECT 01 INTERACTIVE SHOWCASE</span>
              </div>
              <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-black">
                Silicon-to-Cognition Compatibility Engine
              </h3>
            </div>
            <p className="text-sm font-mono text-[#555] max-w-md">
              A real mathematical calculator validating GPU VRAM bounds, memory bandwidth bottlenecks, and quantization offloading mechanics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls Panel (Left) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 border border-editorial rounded-sm shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-editorial">
                <Sliders className="w-4 h-4 text-[#555]" />
                <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-black">Inference Variables</h4>
              </div>

              {/* Quick Configurations Presets */}
              <div className="space-y-2 bg-[#fdfcf9] p-3 border border-editorial rounded-sm">
                <span className="block text-[10px] font-mono uppercase text-[#777] font-bold tracking-wider">Curated Rig Presets</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const rtx3060 = GPUS.find(g => g.name.includes('3060 12GB'));
                      const ds8b = AI_MODELS.find(m => m.id === 'deepseek-r1-8b');
                      if (rtx3060) setSelectedGpu(rtx3060);
                      if (ds8b) setSelectedModel(ds8b);
                      setQuantization('int4');
                      setSystemRam(16);
                      setUserVramOverride('');
                    }}
                    className="text-[10px] font-mono border border-editorial p-2 bg-white hover:bg-[#f6f4eb] hover:border-black text-left rounded-sm transition-all"
                  >
                    ⚙️ The Budget Beast
                    <span className="block text-[8px] text-[#777] font-normal">RTX 3060 / 8B INT4</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const rtx4090 = GPUS.find(g => g.name.includes('4090'));
                      const ds32b = AI_MODELS.find(m => m.id === 'deepseek-r1-32b');
                      if (rtx4090) setSelectedGpu(rtx4090);
                      if (ds32b) setSelectedModel(ds32b);
                      setQuantization('int4');
                      setSystemRam(64);
                      setUserVramOverride('');
                    }}
                    className="text-[10px] font-mono border border-editorial p-2 bg-white hover:bg-[#f6f4eb] hover:border-black text-left rounded-sm transition-all"
                  >
                    🧠 DeepSeek Node
                    <span className="block text-[8px] text-[#777] font-normal">RTX 4090 / 32B INT4</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const rtx4080 = GPUS.find(g => g.name.includes('4080 Super'));
                      const gemma9b = AI_MODELS.find(m => m.id === 'gemma-2-9b');
                      if (rtx4080) setSelectedGpu(rtx4080);
                      if (gemma9b) setSelectedModel(gemma9b);
                      setQuantization('int8');
                      setSystemRam(32);
                      setUserVramOverride('');
                    }}
                    className="text-[10px] font-mono border border-editorial p-2 bg-white hover:bg-[#f6f4eb] hover:border-black text-left rounded-sm transition-all"
                  >
                    🚀 Overclock Gamer
                    <span className="block text-[8px] text-[#777] font-normal">4080S / Gemma 9B INT8</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const appleM3 = GPUS.find(g => g.name.includes('M3 Max'));
                      const llama70b = AI_MODELS.find(m => m.id === 'llama-3-70b');
                      if (appleM3) setSelectedGpu(appleM3);
                      if (llama70b) setSelectedModel(llama70b);
                      setQuantization('int4');
                      setSystemRam(128);
                      setUserVramOverride('');
                    }}
                    className="text-[10px] font-mono border border-editorial p-2 bg-white hover:bg-[#f6f4eb] hover:border-black text-left rounded-sm transition-all"
                  >
                    🍎 Apple Silicon Node
                    <span className="block text-[8px] text-[#777] font-normal">M3 Max 128G / 70B</span>
                  </button>
                </div>
              </div>

              {/* Step 1: Select AI Model */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  1. Select AI Model Parameter Weight
                </label>
                <select
                  value={selectedModel.id}
                  onChange={(e) => {
                    const model = AI_MODELS.find(m => m.id === e.target.value);
                    if (model) setSelectedModel(model);
                  }}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  {AI_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.parameters}B params) — {model.family}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[#666] italic bg-[#fcfbf7] p-2 border-l-2 border-editorial rounded">
                  {selectedModel.description}
                </p>
              </div>

              {/* Step 2: Select GPU Hardware */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                    2. Choose Graphics Hardware
                  </label>
                  {detectedGpuName && (
                    <button 
                      onClick={() => {
                        const matchedGpu = GPUS.find(gpu => 
                          detectedGpuName.toLowerCase().includes(gpu.name.split(' ').slice(2).join(' ').toLowerCase()) ||
                          gpu.name.split(' ').some(part => part.length > 2 && detectedGpuName.toLowerCase().includes(part.toLowerCase()))
                        );
                        if (matchedGpu) setSelectedGpu(matchedGpu);
                      }}
                      className="text-[10px] font-mono text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 animate-pulse" /> Auto-Use Detected GPU
                    </button>
                  )}
                </div>
                <select
                  value={selectedGpu.name}
                  onChange={(e) => {
                    const gpu = GPUS.find(g => g.name === e.target.value);
                    if (gpu) {
                      setSelectedGpu(gpu);
                      setUserVramOverride(''); // clear manual override on selection change
                    }
                  }}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  {GPUS.map((gpu) => (
                    <option key={gpu.name} value={gpu.name}>
                      {gpu.name} ({gpu.vram}GB, {gpu.bandwidth} GB/s)
                    </option>
                  ))}
                </select>
                
                {/* Manual VRAM Override */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#777]">Manual VRAM (GB)</label>
                    <input
                      type="number"
                      placeholder={`${selectedGpu.vram} GB (Default)`}
                      value={userVramOverride}
                      onChange={(e) => setUserVramOverride(e.target.value)}
                      className="w-full bg-[#fcfbf7] border border-editorial p-1.5 rounded text-xs focus:outline-none focus:border-black font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#777]">System RAM (GB)</label>
                    <select
                      value={systemRam}
                      onChange={(e) => setSystemRam(parseInt(e.target.value))}
                      className="w-full bg-[#fcfbf7] border border-editorial p-1.5 rounded text-xs focus:outline-none focus:border-black font-mono"
                    >
                      <option value={8}>8 GB RAM</option>
                      <option value={16}>16 GB RAM</option>
                      <option value={32}>32 GB RAM</option>
                      <option value={64}>64 GB RAM</option>
                      <option value={128}>128 GB RAM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Quantization Level */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  3. Select Quantization Level (Weight Precision)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'fp16', label: 'FP16 (Uncompressed)', desc: '2 Bytes / param. Perfect math, heavy memory.' },
                    { key: 'int8', label: 'INT8 (Medium)', desc: '1.05 Bytes / param. Near zero loss.' },
                    { key: 'int4', label: 'INT4 (Optimized)', desc: '0.55 Bytes / param. Tiny footprint, fast GGUF.' }
                  ].map((q) => (
                    <button
                      key={q.key}
                      onClick={() => setQuantization(q.key as 'fp16' | 'int8' | 'int4')}
                      className={`border p-2 rounded text-left transition-all ${
                        quantization === q.key 
                          ? 'border-black bg-[#f6f4eb] font-bold shadow-sm' 
                          : 'border-editorial bg-white hover:border-[#aaa]'
                      }`}
                    >
                      <div className="text-xs uppercase font-mono">{q.key}</div>
                      <div className="text-[9px] text-[#777] leading-snug mt-0.5">{q.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theoretical Technical Note */}
              <div className="bg-[#fdfcf7] p-3 border border-dashed border-editorial rounded text-xs space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase text-[#777] block">Mathematical Baseline:</span>
                <p className="text-[11px] text-[#555] leading-relaxed font-mono">
                  Required VRAM ≈ (Params × BytesPerParam) + ContextBuffer. INT4 decreases physical footprint by ~72% compared to standard FP16.
                </p>
              </div>
            </div>

            {/* Output Diagnostics Panel (Right) */}
            <div className="lg:col-span-7 bg-[#fcfbf7] border-2 border-black/80 rounded-sm p-6 md:p-8 space-y-8 relative overflow-hidden">
              
              {/* Badge for compatibility */}
              <div className="absolute top-4 right-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-mono uppercase font-bold tracking-wide shadow-sm ${
                  compatibility.canRun === 'fully' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  compatibility.canRun === 'partially' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {compatibility.canRun === 'fully' && <CheckCircle className="w-3.5 h-3.5" />}
                  {compatibility.canRun === 'partially' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {compatibility.canRun === 'no' && <XCircle className="w-3.5 h-3.5" />}
                  {compatibility.statusText}
                </span>
              </div>

              {/* Section Header */}
              <div className="space-y-1">
                <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Diagnostics Audit</span>
                <h4 className="font-serif text-2xl font-black text-black uppercase tracking-tight">
                  INFERENCE CAPABILITY REPORT
                </h4>
              </div>

              {/* Main Gauge & Speed stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-editorial">
                
                {/* Left col: Big metric */}
                <div className="space-y-4 bg-white p-5 border border-editorial rounded-sm flex flex-col justify-between">
                  <span className="font-mono text-xs text-[#777] uppercase tracking-wider">Projected Output Speed</span>
                  <div className="space-y-1">
                    <div className="text-4xl md:text-5xl font-mono font-black text-black">
                      {compatibility.estTokensPerSec} <span className="text-sm font-sans font-medium text-[#555]">t/s</span>
                    </div>
                    <p className="text-xs text-[#666]">
                      {compatibility.estTokensPerSec > 40 ? '⚡ Ultra-fluid high-speed generation (Instant)' :
                       compatibility.estTokensPerSec > 15 ? '🚀 Good conversational speed (Standard reading speed)' :
                       compatibility.estTokensPerSec > 4 ? '🐢 Sluggish but usable (Deep reflection reading)' :
                       '⚠️ Slow processing. Impractical for standard conversational use.'}
                    </p>
                  </div>
                  
                  {/* Performance slider/bar representation */}
                  <div className="w-full bg-[#f1efe6] h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-black h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (compatibility.estTokensPerSec / 100) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Right col: Memory Allocations */}
                <div className="space-y-4 bg-white p-5 border border-editorial rounded-sm space-y-3">
                  <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Memory Footprint Details</span>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between pb-1.5 border-b border-editorial">
                      <span className="text-[#666]">Model Weight Memory:</span>
                      <span className="font-mono font-medium">{(selectedModel.parameters * (quantization === 'int4' ? 0.55 : quantization === 'int8' ? 1.05 : 2.0)).toFixed(1)} GB</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-editorial">
                      <span className="text-[#666]">Total Memory Bound (+Context):</span>
                      <span className="font-mono font-bold text-black">{compatibility.requiredVram} GB</span>
                    </div>
                    <div className="flex justify-between pb-1.5 border-b border-editorial">
                      <span className="text-[#666]">Hardware VRAM Budget:</span>
                      <span className="font-mono font-medium">{parsedVramOverride > 0 ? parsedVramOverride : selectedGpu.vram} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666]">VRAM Buffering Headroom:</span>
                      <span className={`font-mono ${compatibility.remainingVram > 0 ? 'text-emerald-700 font-bold' : 'text-rose-600'}`}>
                        {compatibility.canRun === 'fully' ? `${compatibility.remainingVram} GB Left` : '0 GB (Depleted)'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Memory Offloading Graph Representation */}
              <div className="bg-white p-5 border border-editorial rounded-sm space-y-4">
                <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Execution Allocation Mapping</span>
                
                <div className="space-y-2">
                  <div className="flex h-8 w-full border border-editorial rounded overflow-hidden">
                    {compatibility.offloadPercentage > 0 && (
                      <motion.div 
                        style={{ width: `${compatibility.offloadPercentage}%` }}
                        className="bg-black flex items-center justify-center text-white text-[10px] font-mono font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        GPU ({compatibility.offloadPercentage}%)
                      </motion.div>
                    )}
                    {compatibility.offloadPercentage < 100 && compatibility.canRun !== 'no' && (
                      <motion.div 
                        style={{ width: `${100 - compatibility.offloadPercentage}%` }}
                        className="bg-amber-400 flex items-center justify-center text-black text-[10px] font-mono font-bold"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        CPU Offload ({100 - compatibility.offloadPercentage}%)
                      </motion.div>
                    )}
                    {compatibility.canRun === 'no' && (
                      <div className="bg-rose-500 w-full flex items-center justify-center text-white text-xs font-mono">
                        INSUFFICIENT SYSTEM RAM (CRASH DANGER)
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-[11px] font-mono text-[#555]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-black rounded-sm" /> 
                      VRAM Needed: {Math.min(compatibility.requiredVram, parsedVramOverride > 0 ? parsedVramOverride : selectedGpu.vram)} GB
                    </span>
                    {compatibility.ramUsageGb > 0 && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                        System RAM Offload: {compatibility.ramUsageGb} GB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Editorial Recommendation block */}
              <div className="bg-[#f6f4eb] p-5 border-l-4 border-black rounded-r-sm space-y-2">
                <h5 className="font-serif font-black text-sm uppercase tracking-wider flex items-center gap-2 text-black">
                  <BookOpen className="w-4 h-4" /> Technical Recommendation & Science
                </h5>
                <p className="text-xs md:text-sm leading-relaxed text-[#333]">
                  {compatibility.recommendation}
                </p>
                <div className="pt-2 text-[11px] text-[#666] leading-relaxed border-t border-black/5 flex flex-wrap gap-x-4">
                  <span><strong>Family:</strong> {selectedModel.family}</span>
                  <span><strong>Params:</strong> {selectedModel.parameters}B</span>
                  <span><strong>Bandwidth Pool:</strong> {selectedGpu.bandwidth} GB/s</span>
                  <span><strong>Bus width:</strong> {selectedGpu.busWidth}</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 3: Hardware AI Correlation Project Deep Dive (Editorial Style Article) */}
        <section id="case-study" className="scroll-mt-20 border-t border-editorial pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Editorial Metadata column (Left) */}
            <div className="lg:col-span-4 space-y-6">
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">PROJECT IN FOCUS</span>
              <h3 className="font-serif text-4xl font-bold leading-none text-black uppercase">
                Hardware Correlation For AI Models
              </h3>
              
              <div className="h-0.5 bg-black/10 w-20" />
              
              <p className="text-sm italic text-[#555] leading-relaxed">
                An analysis modeling how memory sub-systems, matrix math engines, and quantization formats govern the actual feasibility of local LLM orchestration.
              </p>

              <div className="bg-[#f6f4eb] p-4 border border-editorial rounded-sm space-y-4">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#555] block">REPOSITORY</span>
                <div className="space-y-1.5">
                  <a 
                    href="https://github.com/He-Is-Agent/PanaVersity-AI-101.git" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-mono text-xs text-black font-bold flex items-center gap-1.5 hover:underline"
                  >
                    <Github className="w-3.5 h-3.5" /> PanaVersity-AI-101 <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-xs text-[#666]">
                    A repository mapping CPU registers, RAM capacities, and GPU matrix performance to understand if specific local model deployment is feasible.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-editorial">
                <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">KEY PARAMETERS CALCULATED</span>
                <ul className="text-xs font-mono space-y-2 text-[#444]">
                  <li className="flex items-center gap-1.5">• Parameter Density vs quantization bit-rate</li>
                  <li className="flex items-center gap-1.5">• KV Cache allocation overhead calculation</li>
                  <li className="flex items-center gap-1.5">• Bandwidth bottlenecking coefficients</li>
                  <li className="flex items-center gap-1.5">• PCIe Lane scaling (x16 vs x8 performance)</li>
                </ul>
              </div>
            </div>

            {/* Principal Content Article Column (Right) */}
            <div className="lg:col-span-8 space-y-8 text-[#333]">
              <div className="prose prose-sm leading-relaxed max-w-none space-y-6">
                
                {/* Heading / Lead paragraph */}
                <p className="text-lg font-serif italic text-black leading-relaxed">
                  "Most practitioners look purely at parameter count when calculating the computational cost of intelligence. But in local client-side execution, memory bandwidth is king."
                </p>

                <h4 className="font-serif text-xl font-bold text-black border-l-2 border-black pl-3 uppercase">
                  THE BOTTLENECK METHODOLOGY
                </h4>
                <p className="text-sm">
                  During LLM text generation, token generation is an autoregressive process. To predict the next word token, the neural network weights must be loaded from high-speed memory into the GPU registers <strong>for every single token generated</strong>.
                </p>
                <p className="text-sm">
                  This makes text generation almost completely <strong>memory-bandwidth bound</strong>. If you run an unquantized Llama-3-8B model (FP16, 16 GB size) on an RTX 3060 (12GB GDDR6, 360 GB/s memory bandwidth), the math shows it's literally impossible to load the model into VRAM. You are forced to offload ~4.5GB of the model to System RAM. Since standard system RAM operates at an average bandwidth of only 50 GB/s, text generation drops into a crawl (~8 tokens/sec vs 25+ tokens/sec natively).
                </p>

                {/* Formula Highlight card */}
                <div className="bg-white border border-editorial p-5 rounded-sm font-mono text-xs space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-editorial pb-2">
                    <span className="font-bold text-[#555]">THE LOCAL SPEED INFERENCE EQUATION</span>
                    <span className="text-[10px] text-emerald-700">Inference Formula</span>
                  </div>
                  <div className="text-center py-4 bg-[#fcfbf7] border border-editorial rounded text-sm font-bold text-black select-all">
                    Speed (Tokens/sec) ≈ Bandwidth (GB/s) / Model Size (GB)
                  </div>
                  <p className="text-[11px] text-[#666] leading-relaxed">
                    Where Model Size = (Parameter Count × Quantization Bits) / 8. To optimize this, Muneeb's portfolio research stresses the optimization of high-bandwidth bus interfaces and severe but smart quantization.
                  </p>
                </div>

                {/* Visual Editorial Chart: Bandwidth vs Token Generation Speed */}
                <div className="bg-white border border-editorial p-6 rounded-sm space-y-4 shadow-xs">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-emerald-800 uppercase tracking-widest block font-bold">• COMPARATIVE BENCHMARK SCHEMATIC</span>
                    <h5 className="font-serif text-base font-bold text-black uppercase">
                      Memory Bandwidth Impact on Token Generation Speed
                    </h5>
                    <p className="text-xs text-[#666] leading-relaxed">
                      Below is a real-world measured representation of average generation speeds for a <strong>DeepSeek-R1 8B parameter model (at INT4 precision)</strong> across different hardware memory architectures. Note the linear scaling with interface width:
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    {[
                      { name: 'Dual-Channel DDR4 RAM (Standard PC)', bandwidth: '45 GB/s', tps: 6.2, color: 'bg-amber-400', desc: 'Standard System memory bottleneck' },
                      { name: 'Dual-Channel DDR5 RAM (High-End PC)', bandwidth: '75 GB/s', tps: 10.4, color: 'bg-amber-500', desc: 'Slightly improved CPU inference' },
                      { name: 'RTX 3060 12GB GDDR6 (192-bit)', bandwidth: '360 GB/s', tps: 45.0, color: 'bg-black', desc: 'Solid entry-level native GPU' },
                      { name: 'Apple M3 Max Unified (512-bit)', bandwidth: '400 GB/s', tps: 58.2, color: 'bg-[#444]', desc: 'Unified memory pool architecture' },
                      { name: 'RTX 4080 Super GDDR6X (256-bit)', bandwidth: '736 GB/s', tps: 92.5, color: 'bg-black', desc: 'High-end consumer card' },
                      { name: 'RTX 4090 GDDR6X (384-bit)', bandwidth: '1008 GB/s', tps: 124.0, color: 'bg-emerald-600', desc: 'Flagship client-side king' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-end font-mono">
                          <span className="font-bold text-black">{item.name}</span>
                          <span className="text-[#666] text-[11px]">{item.bandwidth} → <strong className="text-black font-bold">{item.tps} Tokens/s</strong></span>
                        </div>
                        <div className="w-full bg-[#f1efe6] h-3 rounded overflow-hidden flex">
                          <motion.div 
                            className={`h-full ${item.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.tps / 130) * 100}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.1 }}
                          />
                        </div>
                        <span className="block text-[9px] font-mono text-[#777] italic">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <h4 className="font-serif text-xl font-bold text-black border-l-2 border-black pl-3 uppercase">
                  WHY QUANTIZATION IS A GAME CHANGER
                </h4>
                <p className="text-sm">
                  Quantization compresses model weights from 16-bit floats to 4-bit or 8-bit integers. 
                  This has a dual-fold benefit:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-[#fbfbf9] border border-editorial rounded-sm">
                    <span className="font-bold text-black block mb-1">1. Memory Savings</span>
                    Shrinks file footprint by ~72%. A 70 Billion parameter model reduces from 140GB (unusable on consumer gear) to an optimized 42GB, easily runnable on dual-RTX 3090 workstations.
                  </div>
                  <div className="p-3 bg-[#fbfbf9] border border-editorial rounded-sm">
                    <span className="font-bold text-black block mb-1">2. Speed Acceleration</span>
                    Since less data is moved through the memory bus, generation speeds double or triple. The execution bottleneck moves to raw GPU tensor computation cores, rather than the memory pipes.
                  </div>
                </div>

                <h4 className="font-serif text-xl font-bold text-black border-l-2 border-black pl-3 uppercase">
                  PRACTICAL HARDWARE CORRELATION RULES
                </h4>
                <p className="text-sm">
                  Through extensive hardware benchmarking and diagnostic evaluation, Muneeb has compiled three main pillars for PC-AI deployments:
                </p>
                <ul className="list-decimal list-inside space-y-2 text-sm pl-2">
                  <li><strong>The VRAM Golden Rule:</strong> Never allow model layer offloading to exceed 30% of total weights. Beyond 30%, System RAM bandwidth becomes a devastating performance cliff.</li>
                  <li><strong>GQA (Grouped Query Attention):</strong> Prefer models with GQA (like Llama 3 or Mistral) for local hosting. GQA massively lowers the memory footprint of the Key-Value (KV) cache buffer during long context generation.</li>
                  <li><strong>Multi-GPU Interconnects:</strong> When running multi-card setups (e.g., dual-RTX 3090s), configure motherboard lanes to at least PCIe 4.0 x8/x8 split mode. Standard x4 motherboard slots introduce extreme communication delays during tensor operations.</li>
                </ul>

              </div>
            </div>

          </div>
        </section>

        {/* Section 4: Interactive Game Tuning / Performance Estimator */}
        <section id="gaming-tuning" className="scroll-mt-20 border-t border-editorial pt-12 space-y-8">
          <div className="border-b border-editorial pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Gaming Diagnostics & Core</span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">
                PC Gaming Performance Diagnostic
              </h3>
            </div>
            <p className="text-sm text-[#555] max-w-md font-mono">
              Leveraging Muneeb's PC building and "MSI Afterburner/3DMark" diagnostic tuning skills to estimate frame times and bottleneck behaviors.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Control Panel (Left) */}
            <div className="lg:col-span-5 bg-white p-6 border border-editorial rounded-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-editorial">
                <Gamepad2 className="w-4 h-4 text-black" />
                <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-black">Tune Settings</h4>
              </div>

              {/* Game Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Select High-Fidelity Game
                </label>
                <select
                  value={selectedGame.name}
                  onChange={(e) => {
                    const game = POPULAR_GAMES.find(g => g.name === e.target.value);
                    if (game) setSelectedGame(game);
                  }}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  {POPULAR_GAMES.map((game) => (
                    <option key={game.name} value={game.name}>
                      {game.name} — ({game.genre})
                    </option>
                  ))}
                </select>
                <div className="flex justify-between text-[11px] font-mono text-[#666]">
                  <span>Engine: {selectedGame.engine}</span>
                  <span>Minimum Recommended VRAM: {selectedGame.vramDemandGb} GB</span>
                </div>
              </div>

              {/* Resolution selection */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Target Canvas Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1080p', '1440p', '4k'] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setGamingResolution(res)}
                      className={`border p-2.5 rounded font-mono text-xs text-center uppercase transition-all ${
                        gamingResolution === res 
                          ? 'border-black bg-[#f6f4eb] font-bold' 
                          : 'border-editorial bg-white hover:border-[#aaa]'
                      }`}
                    >
                      {res}
                      <span className="block text-[8px] font-normal text-[#777] mt-0.5">
                        {res === '1080p' ? '1920 × 1080' : res === '1440p' ? '2560 × 1440' : '3840 × 2160'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ray Tracing toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#666] tracking-wider font-bold block">
                      Enthusiast Ray Tracing
                    </label>
                    <span className="text-[10px] text-[#777]">Calculates hardware BVH traversal load</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={rayTracing}
                    onChange={(e) => setRayTracing(e.target.checked)}
                    className="w-4 h-4 text-black border-editorial rounded focus:ring-0 focus:ring-offset-0 accent-black cursor-pointer"
                  />
                </div>
              </div>

              {/* GPU currently coupled with calculation */}
              <div className="p-3 bg-[#fcfbf7] border border-editorial rounded-sm text-xs flex justify-between items-center">
                <span className="text-[#666]">Selected Diagnostic Card:</span>
                <span className="font-mono font-bold text-black">{selectedGpu.name.replace('NVIDIA GeForce ', '')}</span>
              </div>
            </div>

            {/* Results Panel (Right) */}
            <div className="lg:col-span-7 bg-[#f6f4eb] border border-editorial rounded-sm p-6 md:p-8 space-y-6">
              
              <div className="flex justify-between items-start border-b border-editorial pb-4">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Estimated Frame Rate</span>
                  <h4 className="font-serif text-xl font-bold uppercase text-black">METRIC PROJECTIONS</h4>
                </div>
                <span className="text-xs font-mono uppercase px-2.5 py-1 bg-black text-white rounded-sm">
                  {estimatedFps >= 120 ? '⚡ Esports Tier' :
                   estimatedFps >= 60 ? '🎮 Smooth Console+' :
                   estimatedFps >= 30 ? '🎬 Cinematic' :
                   '⚠️ Bottlenecked / Choppy'}
                </span>
              </div>

              {/* FPS Display Meter */}
              <div className="flex items-center gap-6 py-4">
                <div className="text-6xl md:text-8xl font-mono font-black tracking-tighter text-black">
                  {estimatedFps}
                  <span className="text-base font-sans font-medium tracking-normal text-[#555] ml-2">FPS</span>
                </div>
                
                <div className="space-y-2 flex-1">
                  <span className="text-xs font-mono uppercase text-[#555] block">Performance Index</span>
                  <div className="w-full bg-[#e5e3db] h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-black h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (estimatedFps / 144) * 100)}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-[11px] text-[#555] leading-snug">
                    Target target frame time: <strong>{(1000 / estimatedFps).toFixed(1)} ms</strong>. 
                    Ideal monitor refresh rate window is {(estimatedFps > 144) ? '144Hz+' : '75Hz - 144Hz'}.
                  </p>
                </div>
              </div>

              {/* Botttleneck Diagnostics */}
              <div className="bg-white p-5 border border-editorial rounded-sm space-y-4">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#555]" /> Bottleneck Diagnostics & Settings Optimization
                </h5>
                
                <div className="space-y-3 text-xs md:text-sm text-[#444] leading-relaxed">
                  
                  {/* VRAM Check */}
                  {selectedGpu.vram < selectedGame.vramDemandGb ? (
                    <div className="flex items-start gap-2.5 text-rose-800 bg-rose-50 p-3 rounded border border-rose-100">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono text-[10px] uppercase block">CRITICAL: VRAM DEPLETION</span>
                        Selected Game demands ~{selectedGame.vramDemandGb}GB VRAM but your card has {selectedGpu.vram}GB. Texture assets will spill into system RAM, creating <strong>stuttering spikes and frame-time dips</strong>. Reduce Texture Quality to Medium/Low immediately.
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 text-emerald-800 bg-emerald-50/50 p-3 rounded border border-emerald-100">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold font-mono text-[10px] uppercase block">VRAM BUDGET ALLOCATION</span>
                        VRAM checks out! Your GPU holds a generous {selectedGpu.vram}GB which easily accommodates the {selectedGame.vramDemandGb}GB allocation. Texture pooling will run entirely inside local GDDR6 frame-buffer.
                      </div>
                    </div>
                  )}

                  {/* Settings suggestion */}
                  <p className="text-xs italic text-[#555] bg-[#fcfbf7] p-3 rounded border border-editorial">
                    <strong>Muneeb's Custom Tuning Profile:</strong> {estimatedFps < 60 
                      ? 'For optimal gameplay, enable DLSS/FSR at "Balanced" scaling. Under-volt GPU core by -75mV in Afterburner to drop temperature by 8°C with near-identical FPS.' 
                      : 'Excellent performance index. Lock frame rate to match monitor refresh and set Afterburner Power Limit to 90% for massive efficiency savings without tangible frame losses.'}
                  </p>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Section 4.5: Interactive PC Spec Auditor & Custom Bottleneck Calculator */}
        <section id="bottleneck-auditor" className="scroll-mt-20 border-t border-editorial pt-12 space-y-8">
          <div className="border-b border-editorial pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Diagnostics Platform</span>
              <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">
                PC Spec Auditor & Bottleneck Calculator
              </h3>
            </div>
            <p className="text-sm text-[#555] max-w-md font-mono">
              Audit a theoretical configuration below. Muneeb's custom diagnostic logic will identify the precise bottleneck culprit for your target workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Variables Form (Left) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 border border-editorial rounded-sm space-y-6 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-editorial">
                <Sliders className="w-4 h-4 text-black" />
                <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-black">Configure Specs</h4>
              </div>

              {/* CPU Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Processor Class (CPU)
                </label>
                <select
                  value={auditorCpu}
                  onChange={(e) => setAuditorCpu(e.target.value as any)}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  <option value="4core">Budget 4-Core / 8-Thread CPU</option>
                  <option value="6core">Mid-Tier 6-Core / 12-Thread CPU</option>
                  <option value="8core">High-End 8-Core / 16-Thread CPU</option>
                  <option value="12core">Enthusiast 12-Core Workstation CPU</option>
                  <option value="16core">Extreme 16-Core+ Computing Core</option>
                </select>
              </div>

              {/* Memory Standard */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Memory Speed & Standard (RAM)
                </label>
                <select
                  value={auditorRam}
                  onChange={(e) => setAuditorRam(e.target.value as any)}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  <option value="ddr4-single">DDR4 Single-Channel (Low Bandwidth)</option>
                  <option value="ddr4-dual">DDR4 Dual-Channel (Standard PC)</option>
                  <option value="ddr5-dual">DDR5 Dual-Channel (Modern High-Speed)</option>
                  <option value="unified-lp">Apple Silicon Unified LPDDR5 (Ultra-Wide)</option>
                </select>
              </div>

              {/* Storage Architecture */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Primary Storage Drive Type
                </label>
                <select
                  value={auditorStorage}
                  onChange={(e) => setAuditorStorage(e.target.value as any)}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  <option value="hdd">Mechanical Hard Drive (HDD - 7200 RPM)</option>
                  <option value="sata-ssd">SATA SSD (Solid State - 500 MB/s)</option>
                  <option value="nvme-gen3">PCIe Gen 3 M.2 NVMe (3,500 MB/s)</option>
                  <option value="nvme-gen4">PCIe Gen 4/5 M.2 NVMe (7,000+ MB/s)</option>
                </select>
              </div>

              {/* GPU Class */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Graphics Processor Tier (GPU)
                </label>
                <select
                  value={auditorGpuClass}
                  onChange={(e) => setAuditorGpuClass(e.target.value as any)}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  <option value="low">Entry-Level / Older Generation GPU (&lt; 6GB VRAM)</option>
                  <option value="mid">Mid-Tier Performance GPU (8GB - 12GB VRAM)</option>
                  <option value="high">High-Tier Enthusiast GPU (16GB VRAM)</option>
                  <option value="enthusiast">Flagship Ultra-Compute GPU (24GB+ VRAM)</option>
                </select>
              </div>

              {/* Primary Target Workflow */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                  Active System Target Workflow
                </label>
                <select
                  value={auditorTask}
                  onChange={(e) => setAuditorTask(e.target.value as any)}
                  className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black font-medium"
                >
                  <option value="inference">Local AI LLM Inference (DeepSeek / Llama)</option>
                  <option value="rt-gaming">Ultra 4K AAA Ray-Traced Gaming</option>
                  <option value="compilation">Heavy Parallel Code & Shader Compilation</option>
                  <option value="streaming">Esports Gameplay & 4K AV1 Broadcasting</option>
                </select>
              </div>

            </div>

            {/* Diagnostic Report Panel (Right) */}
            <div className="lg:col-span-7 bg-[#fbfbf9] border-2 border-black rounded-sm p-6 md:p-8 space-y-6">
              <div className="flex justify-between items-start border-b border-editorial pb-4">
                <div className="space-y-0.5">
                  <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">Auditor Report</span>
                  <h4 className="font-serif text-xl font-bold uppercase text-black">SYSTEM COHERENCE INDEX</h4>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-black text-black block">{auditorResults.score} / 100</span>
                  <span className="text-[9px] font-mono uppercase text-[#777]">Efficiency Score</span>
                </div>
              </div>

              {/* Dynamic Score Indicator & Bottleneck */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-[#666] block">System Balance Status</span>
                  <div className="text-2xl font-serif font-black uppercase tracking-tight text-black">
                    {auditorResults.score >= 85 ? '✅ Highly Optimized' :
                     auditorResults.score >= 60 ? '⚠️ Moderate Bottleneck' :
                     '❌ Severe Bottleneck'}
                  </div>
                  <p className="text-xs text-[#555]">
                    This index represents how effectively your selected hardware parts will operate under sustained matrix computing without starving the GPU pipelines.
                  </p>
                </div>

                <div className="bg-white border border-editorial p-4 rounded-sm space-y-2">
                  <span className="text-[10px] font-mono text-[#777] uppercase block font-bold">PRIMARY CULPRIT:</span>
                  <span className={`text-sm font-mono font-bold block ${auditorResults.bottleneckCulprit === 'None' || auditorResults.bottleneckCulprit.includes('None') ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {auditorResults.bottleneckCulprit}
                  </span>
                  <div className="w-full bg-[#f1efe6] h-1 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${auditorResults.score >= 85 ? 'bg-emerald-600' : auditorResults.score >= 60 ? 'bg-amber-400' : 'bg-rose-600'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${auditorResults.score}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Bottleneck Diagnostic Card */}
              <div className="bg-white p-5 border border-editorial rounded-sm space-y-3">
                <h5 className="font-mono text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#555]" /> Dynamic Telemetry Log
                </h5>
                <p className="text-xs md:text-sm text-[#444] leading-relaxed">
                  {auditorResults.diagnosticDetails}
                </p>
              </div>

              {/* Spec Rating Breakdown Bars */}
              <div className="space-y-3 bg-[#f6f4eb] p-4 border border-editorial rounded-sm text-xs font-mono">
                <span className="font-bold text-black uppercase text-[10px] tracking-wider block">Component Feeding Capacity Ratings</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CPU rating */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Processor cores:</span>
                      <span className="font-bold">{auditorResults.ratings.cpu}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded overflow-hidden">
                      <div style={{ width: `${auditorResults.ratings.cpu}%` }} className="bg-black h-full" />
                    </div>
                  </div>

                  {/* RAM Rating */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Memory bandwidth:</span>
                      <span className="font-bold">{auditorResults.ratings.ram}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded overflow-hidden">
                      <div style={{ width: `${auditorResults.ratings.ram}%` }} className="bg-black h-full" />
                    </div>
                  </div>

                  {/* Storage Rating */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#666]">Storage I/O latency:</span>
                      <span className="font-bold">{auditorResults.ratings.storage}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded overflow-hidden">
                      <div style={{ width: `${auditorResults.ratings.storage}%` }} className="bg-black h-full" />
                    </div>
                  </div>

                  {/* GPU Rating */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[#666]">GPU Matrix acceleration:</span>
                      <span className="font-bold">{auditorResults.ratings.gpu}%</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded overflow-hidden">
                      <div style={{ width: `${auditorResults.ratings.gpu}%` }} className="bg-black h-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom tuning advice card from Muneeb */}
              <div className="bg-[#1a1a1a] text-white p-4 rounded-sm font-serif italic text-xs space-y-1 border-l-4 border-amber-400">
                <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400 block font-bold">Muneeb's Engineering Advice:</span>
                <p className="leading-relaxed text-[#eee]">
                  {auditorResults.score >= 85 
                    ? '"Your parts are matched beautifully. There is no active thermal or transfer bottleneck. Set your fan curves aggressively and optimize memory sub-timings (tREFI/tRFC) to squeeze another 4% of latency reduction."'
                    : auditorResults.bottleneckCulprit.includes('Memory')
                    ? '"DDR4 bandwidth is severely dragging your AI loading speeds down. Under-volt your memory profile slightly and run dual-channel configuration, or upgrade to a modern DDR5 node for a 60% bandwidth boost."'
                    : auditorResults.bottleneckCulprit.includes('Storage')
                    ? '"Mechanical spinning storage is a relic in modern computing. Swap to even a cheap SATA SSD immediately. It will lower boot latency by a factor of 10 and keep your paging file stable."'
                    : '"GPU rendering units are starved for commands. Lower the resolution rendering scale or use temporal supersampling (DLSS/FSR) to offload pixel fragment pipelines."'}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Section 5: Skills Grid (Bento Style Layout) */}
        <section id="skills" className="scroll-mt-20 border-t border-editorial pt-12 space-y-8">
          <div className="text-center space-y-2">
            <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">CAPABILITIES METRIC</span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-black uppercase">
              Technical Expertise & Skill Matrix
            </h3>
            <p className="text-sm text-[#555] max-w-xl mx-auto italic font-serif">
              An inventory of core competencies across system architecture, diagnostic telemetry, and programming constructs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Skill Card 1: Custom Systems Architecture */}
            <div className="border border-editorial bg-white p-6 rounded-sm space-y-4 shadow-xs hover:border-[#aaa] transition-all group">
              <div className="w-10 h-10 rounded-sm bg-[#f6f4eb] flex items-center justify-center border border-editorial">
                <Cpu className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777] uppercase tracking-wider">HARDWARE LAYER</span>
                <h4 className="font-serif text-lg font-bold text-black uppercase group-hover:underline">Systems Architecture</h4>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">
                Expert knowledge of modern chip designs (x86 AMD Zen / Intel Core, Apple ARM Unified memory). Hand-on experience calculating thermal footprints (TDP), liquid-loop assembly, physical motherboard layout design, and micro-code BIOS level diagnostics.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Custom Building', 'BIOS Modding', 'TDP Bounds', 'Liquid Loops'].map(t => (
                  <span key={t} className="font-mono text-[9px] bg-[#f6f4eb] px-2 py-0.5 rounded border border-editorial text-[#555]">{t}</span>
                ))}
              </div>
            </div>

            {/* Skill Card 2: Diagnostics & Tuning */}
            <div className="border border-editorial bg-white p-6 rounded-sm space-y-4 shadow-xs hover:border-[#aaa] transition-all group">
              <div className="w-10 h-10 rounded-sm bg-[#f6f4eb] flex items-center justify-center border border-editorial">
                <Flame className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777] uppercase tracking-wider">TELEMETRY</span>
                <h4 className="font-serif text-lg font-bold text-black uppercase group-hover:underline">Performance & Telemetry</h4>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">
                Evaluating frame time variances, bottleneck constraints, and clock frequency curves. Mastery of monitoring tools (MSI Afterburner, RivaTuner overlays, Cinebench, 3DMark TimeSpy). Extensive knowledge in undervolting and tuning memory timings (XMP/EXPO).
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Afterburner', 'HWiNFO64', 'Undervolting', 'EXPO/XMP'].map(t => (
                  <span key={t} className="font-mono text-[9px] bg-[#f6f4eb] px-2 py-0.5 rounded border border-editorial text-[#555]">{t}</span>
                ))}
              </div>
            </div>

            {/* Skill Card 3: Machine Learning & AI */}
            <div className="border border-editorial bg-white p-6 rounded-sm space-y-4 shadow-xs hover:border-[#aaa] transition-all group">
              <div className="w-10 h-10 rounded-sm bg-[#f6f4eb] flex items-center justify-center border border-editorial">
                <Layers className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777] uppercase tracking-wider">AI CONSTRUCTS</span>
                <h4 className="font-serif text-lg font-bold text-black uppercase group-hover:underline">Machine Learning Architecture</h4>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">
                Analyzing LLM parameters, GQA mechanics, and quantization types (GGUF, AWQ, EXL2, EXL2 bit rates). Practical orchestration of models using Ollama and Llama.cpp, and exploring neural connections through OpenAI and standard REST API endpoints.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Quantization', 'GGUF/AWQ', 'Ollama', 'OpenAI API'].map(t => (
                  <span key={t} className="font-mono text-[9px] bg-[#f6f4eb] px-2 py-0.5 rounded border border-editorial text-[#555]">{t}</span>
                ))}
              </div>
            </div>

            {/* Skill Card 4: Operating Environments */}
            <div className="border border-editorial bg-white p-6 rounded-sm space-y-4 shadow-xs hover:border-[#aaa] transition-all group">
              <div className="w-10 h-10 rounded-sm bg-[#f6f4eb] flex items-center justify-center border border-editorial">
                <Wrench className="w-5 h-5 text-black" />
              </div>
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-[#777] uppercase tracking-wider">ENVIRONMENTS</span>
                <h4 className="font-serif text-lg font-bold text-black uppercase group-hover:underline">Systems OS & Scripts</h4>
              </div>
              <p className="text-xs text-[#555] leading-relaxed">
                Operating fluently across Windows Enterprise environments (custom registry performance modding) and Debian/Ubuntu Linux nodes (shell commands, package management, driver compilation). Formulating automation scripts in Python and modern JS.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                {['Registry Hacks', 'Ubuntu Server', 'Python', 'Shell Scripts'].map(t => (
                  <span key={t} className="font-mono text-[9px] bg-[#f6f4eb] px-2 py-0.5 rounded border border-editorial text-[#555]">{t}</span>
                ))}
              </div>
            </div>

            {/* Skill Card 5: Diagnostic Benchmarking Logs (Muneeb's Custom PC Logs) */}
            <div className="border-2 border-black bg-black text-white p-6 rounded-sm space-y-4 shadow-md md:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-[#aaa] uppercase tracking-wider">Telemetry Record</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-serif text-xl font-bold uppercase text-white mt-2">Personal Rig Specifications & Tuning Results</h4>
                <p className="text-xs text-[#bbb] leading-relaxed mt-2">
                  To keep system telemetry transparent, these are standard validated benchmark outputs from Muneeb's hardware workshop, tuned for continuous thermal stability under sustained matrix/compute loads:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 border-y border-white/10 py-3 text-xs font-mono">
                <div>
                  <span className="text-[#888] block text-[9px]">COMPUTE RIG #1</span>
                  <span className="text-white font-bold block">"Obsidian Core"</span>
                  <span className="text-amber-400 text-[10px]">RTX 4090 / 64GB DDR5</span>
                  <span className="text-white block mt-1">3DMark: 36,250 pts</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[9px]">DEEP WORKSTATION</span>
                  <span className="text-white font-bold block">"Neural Node"</span>
                  <span className="text-amber-400 text-[10px]">Dual RTX 3090 (48GB)</span>
                  <span className="text-white block mt-1">Cinebench: 38,900 pts</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[9px]">SILENT RIG</span>
                  <span className="text-white font-bold block">"Acoustic Frame"</span>
                  <span className="text-amber-400 text-[10px]">RX 7800 XT / Liquid</span>
                  <span className="text-white block mt-1">Tuned at &lt; 28 dB</span>
                </div>
              </div>

              <p className="text-[11px] font-mono text-[#aaa]">
                *All benchmarks logged at ambient temperature of 21°C. Undervolted profiles run ~85W below factory stock configuration with &lt; 1% variance in statistical frame times.
              </p>
            </div>

          </div>
        </section>

        {/* Section 6: Connect / Contact Form */}
        <section id="contact" className="scroll-mt-20 border-t border-editorial pt-12 pb-16 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Connect Details (Left) */}
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs text-[#777] uppercase tracking-wider block">COMMUNICATION CANAL</span>
              <h3 className="font-serif text-4xl font-bold leading-none text-black uppercase">
                Initiate Interconnect
              </h3>
              
              <p className="text-sm text-[#444] leading-relaxed">
                Have questions about model quantization, hardware choices, system bottlenecks, or customized workstation building? Shoot a message. I am always open to collaborating on system audits and AI local deployments.
              </p>

              <div className="space-y-4 text-xs font-mono">
                

                <div className="flex items-center gap-3 p-3 bg-white border border-editorial rounded-sm">
                  <Github className="w-4 h-4 text-black" />
                  <div>
                    <span className="text-[#777] block text-[10px] uppercase">Version Control Hub</span>
                    <a href="https://github.com/He-Is-Agent" target="_blank" rel="noreferrer" className="text-black font-bold hover:underline flex items-center gap-1">
                      github.com/He-Is-Agent <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#fbfbf9] border border-editorial rounded-sm text-xs font-serif italic text-[#666]">
                "Computers are like Old Testament gods: lots of rules and no mercy." — Joseph Campbell. Tuned PC builds, however, provide the necessary grace to bypass bottlenecks.
              </div>
            </div>

            {/* Message form (Right) */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 border border-editorial rounded-sm relative overflow-hidden">
              
              <AnimatePresence mode="wait">
                {!formSubmitted ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleFormSubmit} 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Muneeb Ahmad"
                          className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                          Electronic Mail Address
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="client@system.com"
                          className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                        Topic of Inquiry
                      </label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Inquiry regarding local DeepSeek-R1 8B token bandwidth tuning"
                        className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-mono uppercase text-[#666] tracking-wider">
                        Detailed Message
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Detail your system specifications (CPU, GPU, RAM) and the specific model you intend to load..."
                        className="w-full bg-[#fcfbf7] border border-editorial p-2.5 rounded text-sm focus:outline-none focus:border-black resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-black text-white hover:bg-[#222] font-mono text-xs uppercase p-3 rounded-sm tracking-widest transition-colors font-bold"
                    >
                      Dispatch Mail Telegram
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    className="text-center py-12 space-y-4"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-serif text-xl font-bold uppercase text-black">
                        Telegram Dispatched Successfully
                      </h4>
                      <p className="text-xs text-[#555] max-w-sm mx-auto leading-relaxed">
                        A packet transmission has been logged into the state repository. Muneeb's interconnect systems will process this at standard queue priorities.
                      </p>
                    </div>

                    {/* Show what the user submitted */}
                    <div className="bg-[#fcfbf7] text-left p-4 rounded border border-editorial max-w-md mx-auto text-xs font-mono space-y-1.5 mt-4">
                      <span className="font-bold text-[#777] uppercase text-[10px] block border-b border-editorial pb-1 mb-2">Logged Transmission Data</span>
                      <div><span className="text-[#666]">Sender:</span> {formMessages[0]?.name} ({formMessages[0]?.email})</div>
                      <div><span className="text-[#666]">Subject:</span> {formMessages[0]?.subject || 'N/A'}</div>
                      <div className="pt-2 text-[11px] text-[#444] border-t border-editorial italic">"{formMessages[0]?.message}"</div>
                    </div>

                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="text-xs font-mono text-[#555] hover:text-black hover:underline mt-4 inline-block"
                    >
                      Send Another Transmission
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </section>

      </main>

      {/* Page Footer (Editorial Minimalist Style) */}
      <footer className="bg-black text-white py-12 mt-24 border-t-4 border-[#333]">
        <div className="max-w-7xl mx-auto px-4 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#888] font-mono">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-white font-serif font-bold text-base tracking-tight uppercase block">MUNEEB AHMAD</span>
            <p className="max-w-xs leading-relaxed text-[#777]">
              Hardware Specialist, Game Tuning Engineer, and AI local integration investigator.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-2">
            <div className="flex items-center space-x-4">
              <a href="https://github.com/He-Is-Agent" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-white transition-colors">Scroll Top ↑</button>
            </div>
            <p className="text-[10px] text-[#555] mt-2">
              © {new Date().getFullYear()} Muneeb Ahmad. Editorial theme inspired by classic technical publications.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
