export interface AIModel {
  id: string;
  name: string;
  family: string;
  parameters: number; // in billions
  contextWindow: string;
  description: string;
  notes: string;
}

export interface GPUModel {
  name: string;
  brand: 'NVIDIA' | 'AMD' | 'Intel' | 'Apple' | 'Custom';
  vram: number; // in GB
  bandwidth: number; // in GB/s
  busWidth: string;
  generation: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'llama-3-8b',
    name: 'Llama 3 8B',
    family: 'Meta Llama',
    parameters: 8.0,
    contextWindow: '8K',
    description: 'Meta\'s highly popular small language model, perfect for local deployment on modern consumer GPUs.',
    notes: 'Runs exceptionally fast on standard hardware, very versatile for general tasks.'
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    family: 'Meta Llama',
    parameters: 70.0,
    contextWindow: '8K',
    description: 'High-intelligence model from Meta. Requires multi-GPU setups or heavy quantization for consumer cards.',
    notes: 'Best for complex reasoning, code generation, and multi-turn instruction following.'
  },
  {
    id: 'deepseek-r1-1.5b',
    name: 'DeepSeek-R1 Distill Qwen 1.5B',
    family: 'DeepSeek',
    parameters: 1.5,
    contextWindow: '32K',
    description: 'Ultra-lightweight reasoning model distilled from DeepSeek-R1. Can run on almost any device (even smartphones).',
    notes: 'Very fast reasoning speed, suitable for low-end hardware.'
  },
  {
    id: 'deepseek-r1-8b',
    name: 'DeepSeek-R1 Distill Llama 8B',
    family: 'DeepSeek',
    parameters: 8.0,
    contextWindow: '32K',
    description: 'Reasoning model distilled from DeepSeek-R1, built on top of Llama 3 8B. Highly capable for coding and math.',
    notes: 'Incredible math & logic capabilities for its size.'
  },
  {
    id: 'deepseek-r1-14b',
    name: 'DeepSeek-R1 Distill Qwen 14B',
    family: 'DeepSeek',
    parameters: 14.0,
    contextWindow: '32K',
    description: 'Medium-weight reasoning model distilled from DeepSeek-R1, built on top of Qwen 2.5 14B. Balance of speed & logic.',
    notes: 'Strikes an excellent sweet spot for 16GB-24GB VRAM cards.'
  },
  {
    id: 'deepseek-r1-32b',
    name: 'DeepSeek-R1 Distill Qwen 32B',
    family: 'DeepSeek',
    parameters: 32.0,
    contextWindow: '32K',
    description: 'Heavyweight reasoning model distilled from DeepSeek-R1. Unbelievable coding and scientific capacity.',
    notes: 'Requires dual-GPU or extreme quantization to fit on a single consumer GPU.'
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    family: 'Mistral AI',
    parameters: 7.2,
    contextWindow: '32K',
    description: 'Highly efficient attention-based model. Known for sliding window attention and fast prompt processing.',
    notes: 'An all-time favorite for local applications and fine-tuning.'
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini 3.8B',
    family: 'Microsoft',
    parameters: 3.8,
    contextWindow: '128K',
    description: 'Microsoft\'s lightweight model trained on highly curated educational textbooks and synthetic datasets.',
    notes: 'Massive context window (128K) and strong linguistic reasoning for its tiny size.'
  },
  {
    id: 'gemma-2-9b',
    name: 'Gemma 2 9B',
    family: 'Google',
    parameters: 9.2,
    contextWindow: '8K',
    description: 'Google\'s highly advanced open-weights model. Outperforms many larger models in raw knowledge and reasoning.',
    notes: 'Features sliding window attention and logit soft-capping.'
  },
  {
    id: 'gemma-2-27b',
    name: 'Gemma 2 27B',
    family: 'Google',
    parameters: 27.2,
    contextWindow: '8K',
    description: 'Large consumer-class model from Google. Extremely high intelligence, fits beautifully on 24GB GPUs at standard quantization.',
    notes: 'One of the most capable models available below 30B parameters.'
  }
];

export const GPUS: GPUModel[] = [
  { name: 'NVIDIA GeForce RTX 4090', brand: 'NVIDIA', vram: 24, bandwidth: 1008, busWidth: '384-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 4080 Super', brand: 'NVIDIA', vram: 16, bandwidth: 736, busWidth: '256-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 4070 Ti Super', brand: 'NVIDIA', vram: 16, bandwidth: 672, busWidth: '256-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 4070 Super', brand: 'NVIDIA', vram: 12, bandwidth: 504, busWidth: '192-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 4060 Ti 16GB', brand: 'NVIDIA', vram: 16, bandwidth: 288, busWidth: '128-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 4060 Ti 8GB', brand: 'NVIDIA', vram: 8, bandwidth: 288, busWidth: '128-bit', generation: 'Ada Lovelace' },
  { name: 'NVIDIA GeForce RTX 3090 / 3090 Ti', brand: 'NVIDIA', vram: 24, bandwidth: 1008, busWidth: '384-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 3080 Ti', brand: 'NVIDIA', vram: 12, bandwidth: 912, busWidth: '384-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 3080 10GB', brand: 'NVIDIA', vram: 10, bandwidth: 760, busWidth: '320-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 3070 Ti', brand: 'NVIDIA', vram: 8, bandwidth: 608, busWidth: '256-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 3060 12GB', brand: 'NVIDIA', vram: 12, bandwidth: 360, busWidth: '192-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 3060 Ti 8GB', brand: 'NVIDIA', vram: 8, bandwidth: 448, busWidth: '256-bit', generation: 'Ampere' },
  { name: 'NVIDIA GeForce RTX 2080 Ti', brand: 'NVIDIA', vram: 11, bandwidth: 616, busWidth: '352-bit', generation: 'Turing' },
  { name: 'AMD Radeon RX 7900 XTX', brand: 'AMD', vram: 24, bandwidth: 960, busWidth: '384-bit', generation: 'RDNA 3' },
  { name: 'AMD Radeon RX 7900 XT', brand: 'AMD', vram: 20, bandwidth: 800, busWidth: '320-bit', generation: 'RDNA 3' },
  { name: 'AMD Radeon RX 7800 XT', brand: 'AMD', vram: 16, bandwidth: 624, busWidth: '256-bit', generation: 'RDNA 3' },
  { name: 'AMD Radeon RX 6800 XT', brand: 'AMD', vram: 16, bandwidth: 512, busWidth: '256-bit', generation: 'RDNA 2' },
  { name: 'Apple M3 Max (Unified Memory)', brand: 'Apple', vram: 128, bandwidth: 400, busWidth: 'Dynamic', generation: 'Apple Silicon' },
  { name: 'Apple M3 Pro (Unified Memory)', brand: 'Apple', vram: 36, bandwidth: 150, busWidth: 'Dynamic', generation: 'Apple Silicon' },
  { name: 'Apple M2 Ultra (Unified Memory)', brand: 'Apple', vram: 192, bandwidth: 800, busWidth: 'Dynamic', generation: 'Apple Silicon' },
  { name: 'Intel Arc A770 16GB', brand: 'Intel', vram: 16, bandwidth: 560, busWidth: '256-bit', generation: 'Alchemist' }
];

export interface CompatibilityResult {
  canRun: 'fully' | 'partially' | 'no';
  requiredVram: number;
  remainingVram: number;
  estTokensPerSec: number;
  offloadPercentage: number;
  ramUsageGb: number;
  recommendation: string;
  statusText: string;
  severityColor: string; // Tailwind class colors
}

export function calculateCompatibility(
  model: AIModel,
  gpu: GPUModel,
  userVramOverride: number,
  systemRam: number,
  quantization: 'fp16' | 'int8' | 'int4'
): CompatibilityResult {
  const actualVram = userVramOverride > 0 ? userVramOverride : gpu.vram;
  
  // VRAM calculation:
  // Base size: model parameters in billions * bytes per parameter
  // fp16 = 2 bytes, int8 = 1 byte, int4 = 0.5 bytes (approx)
  let bytesPerParam = 2.0;
  if (quantization === 'int8') bytesPerParam = 1.05; // 1 byte + slight metadata overhead
  if (quantization === 'int4') bytesPerParam = 0.55; // 0.5 byte + slight metadata overhead
  
  const rawModelSizeGb = model.parameters * bytesPerParam;
  
  // Context window memory overhead (very rough estimate: ~0.5GB to 2GB depending on size)
  const contextOverheadGb = quantization === 'int4' ? 0.8 : quantization === 'int8' ? 1.2 : 2.0;
  const totalRequiredMemoryGb = parseFloat((rawModelSizeGb + contextOverheadGb).toFixed(2));
  
  let canRun: 'fully' | 'partially' | 'no' = 'fully';
  let offloadPercentage = 100;
  let remainingVram = actualVram - totalRequiredMemoryGb;
  let ramUsageGb = 0;
  
  if (totalRequiredMemoryGb <= actualVram - 0.5) { // Leave 0.5GB for OS/Display
    canRun = 'fully';
    offloadPercentage = 100;
    remainingVram = parseFloat(remainingVram.toFixed(2));
  } else {
    // We must offload to CPU RAM
    const deficitGb = totalRequiredMemoryGb - (actualVram - 0.5);
    ramUsageGb = parseFloat(deficitGb.toFixed(2));
    
    const availableVramForModel = Math.max(0, actualVram - 0.5);
    offloadPercentage = Math.round((availableVramForModel / totalRequiredMemoryGb) * 100);
    remainingVram = 0;
    
    // Check if system RAM can hold the rest
    if (ramUsageGb <= (systemRam - 4)) { // Leave 4GB for OS
      canRun = 'partially';
    } else {
      canRun = 'no';
    }
  }
  
  // Estimate tokens per second
  // Model size impacts speed, but memory bandwidth is the primary bottleneck for LLM inference (especially on consumer hardware).
  // Formula: Speed (t/s) = Memory Bandwidth (GB/s) / Model Size (GB)
  // Adjusted for quantization speedup / latency, system offload penalty, and brand architecture.
  let baseBandwidth = gpu.bandwidth;
  if (gpu.brand === 'Apple') {
    // Apple unified memory is fast, but CPU/GPU sharing introduces slight factors
    baseBandwidth = gpu.bandwidth * 0.85;
  }
  
  let inferenceBandwidth = baseBandwidth;
  if (canRun === 'partially') {
    // Offloading to system RAM (DDR4/DDR5) is extremely slow compared to GDDR6/VRAM.
    // DDR5 is roughly 60-80 GB/s. DDR4 is 30-50 GB/s.
    // We compute a weighted average based on offload percentage.
    const systemRamBandwidth = systemRam >= 32 ? 70 : 45; // dual channel DDR5 vs standard DDR4
    const gpuWeight = offloadPercentage / 100;
    const cpuWeight = 1 - gpuWeight;
    inferenceBandwidth = (baseBandwidth * gpuWeight) + (systemRamBandwidth * cpuWeight);
  }
  
  let estTokensPerSec = inferenceBandwidth / totalRequiredMemoryGb;
  
  // Cap speed realistically based on consumer engines (like llama.cpp)
  // Extremely small models might reach 120 t/s, large ones on offload might drop to 1-2 t/s.
  if (gpu.brand === 'NVIDIA' && gpu.generation === 'Ada Lovelace') {
    estTokensPerSec *= 1.15; // Ada Lovelace has improved tensor cores and cache
  }
  
  // Scale down for quantization computation overhead
  if (quantization === 'int4') {
    estTokensPerSec *= 0.85; // Dequantization overhead
  }
  
  estTokensPerSec = parseFloat(Math.min(150, Math.max(0.5, estTokensPerSec)).toFixed(1));
  if (canRun === 'no') {
    estTokensPerSec = 0;
  }
  
  let recommendation = '';
  let statusText = '';
  let severityColor = '';
  
  if (canRun === 'fully') {
    statusText = 'Fully Capable (100% VRAM)';
    severityColor = 'emerald';
    recommendation = `Fantastic match! The selected model fits entirely in your ${gpu.brand} GPU VRAM. You will experience lightning-fast native inference speed (~${estTokensPerSec} tokens/sec) without offloading overhead.`;
    if (remainingVram < 2) {
      recommendation += ' Note: VRAM buffer is tight. Close heavy background apps or browser tabs.';
    }
  } else if (canRun === 'partially') {
    statusText = `Partial Offload (${offloadPercentage}% VRAM / ${100 - offloadPercentage}% CPU)`;
    severityColor = 'amber';
    recommendation = `Fits with memory offloading! The model is larger than your GPU's VRAM. The engine (e.g., Llama.cpp) will run ${offloadPercentage}% of layers on your GPU and offload ${100 - offloadPercentage}% (${ramUsageGb} GB) to your system RAM. Inference will run at ~${estTokensPerSec} tokens/sec.`;
    if (estTokensPerSec < 5) {
      recommendation += ' WARNING: The generation speed is extremely slow. We highly recommend using INT4 quantization or selecting a lighter model (e.g., 8B or 1.5B).';
    } else {
      recommendation += ' Recommend using dual-channel fast DDR5 memory for optimal offloaded speed.';
    }
  } else {
    statusText = 'Incompatible (Out of Memory)';
    severityColor = 'rose';
    recommendation = `Insufficient memory. The model + context (${totalRequiredMemoryGb} GB) exceeds your combined VRAM (${actualVram} GB) and available system RAM (leaving 4GB for OS). If you attempt to load this, your system will crash (Out-Of-Memory) or run at less than 0.2 tokens/sec. Recommendation: Select INT4 quantization, switch to a lighter model, or upgrade hardware.`;
  }
  
  return {
    canRun,
    requiredVram: totalRequiredMemoryGb,
    remainingVram: parseFloat(remainingVram.toFixed(2)),
    estTokensPerSec,
    offloadPercentage,
    ramUsageGb,
    recommendation,
    statusText,
    severityColor
  };
}
