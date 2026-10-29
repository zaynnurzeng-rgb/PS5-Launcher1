/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmulatorPlatform, GameItem } from '../types/savesync';

export interface ExtractedColorPalette {
  primary: string;           // Hex code (e.g., #ef4444)
  secondary: string;         // Hex code (e.g., #f97316)
  darkCharcoal: string;      // Dark charcoal background tint (e.g., #0d0505)
  accentGlow: string;        // CSS rgba glow
  accentBorder: string;      // Tailwind border class (e.g., border-red-500/40)
  accentBgGlass: string;     // Tailwind glass background class (e.g., bg-red-950/40)
  accentText: string;        // Tailwind text class (e.g., text-red-400)
  badgeBg: string;           // Tailwind badge background
  badgeText: string;         // Tailwind badge text
  radialAtmosphere: string;  // CSS radial-gradient string
  brandName: string;         // Descriptive name (e.g., 'Fiery Crimson & Dark Charcoal')
}

export interface EmulatorTheme {
  id: EmulatorPlatform;
  displayName: string;
  systemName: string;
  hardwareGeneration: string;
  primaryColor: string;
  accentColor: string;
  palette: ExtractedColorPalette;
  badgeBg: string;
  badgeText: string;
  gradient: string;
  githubSystemFolder: string;
  description: string;
  wallpaperSvg: string;
}

export const EMULATOR_THEMES: Record<EmulatorPlatform, EmulatorTheme> = {
  ppsspp: {
    id: 'ppsspp',
    displayName: 'PPSSPP Engine',
    systemName: 'Sony PlayStation Portable (PSP)',
    hardwareGeneration: '333MHz MIPS R4000 · 32MB RAM',
    primaryColor: '#006FCD',
    accentColor: '#38bdf8',
    palette: {
      primary: '#006FCD',
      secondary: '#38bdf8',
      darkCharcoal: '#020b18',
      accentGlow: 'rgba(0, 111, 205, 0.35)',
      accentBorder: 'border-sky-500/35',
      accentBgGlass: 'bg-blue-950/40',
      accentText: 'text-sky-300',
      badgeBg: 'bg-blue-950/80',
      badgeText: 'text-sky-300',
      radialAtmosphere: 'radial-gradient(circle at 80% 20%, rgba(0, 111, 205, 0.35) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%)',
      brandName: 'PSP Cosmic Silk Blue & Ambient PlayStation Cyan',
    },
    badgeBg: 'bg-blue-950/80',
    badgeText: 'text-sky-300',
    gradient: 'from-blue-950 via-slate-950 to-black',
    githubSystemFolder: 'Sony - PlayStation Portable',
    description: 'Iconic Sony PSP cosmic fluid silk waves with glowing PlayStation geometric constellation.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="pspGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23020617"/><stop offset="30%" stop-color="%23001845"/><stop offset="70%" stop-color="%23002855"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%230077b6" stop-opacity="0.35"/><stop offset="50%" stop-color="%2338bdf8" stop-opacity="0.65"/><stop offset="100%" stop-color="%23023e8a" stop-opacity="0.2"/></linearGradient><linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2303045e" stop-opacity="0.2"/><stop offset="50%" stop-color="%230096c7" stop-opacity="0.45"/><stop offset="100%" stop-color="%2348cae4" stop-opacity="0.3"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23pspGrad)"/><path d="M-100 480 Q 400 220 960 540 T 2020 380 L 2020 1080 L -100 1080 Z" fill="url(%23waveGrad1)" filter="blur(30px)"/><path d="M-100 620 Q 520 780 1100 520 T 2020 680 L 2020 1080 L -100 1080 Z" fill="url(%23waveGrad2)" filter="blur(40px)"/><circle cx="1550" cy="280" r="140" fill="none" stroke="%2338bdf8" stroke-width="3" opacity="0.25"/><polygon points="320,240 380,340 260,340" fill="none" stroke="%2338bdf8" stroke-width="3" opacity="0.25"/><rect x="850" y="160" width="100" height="100" fill="none" stroke="%2338bdf8" stroke-width="3" opacity="0.2"/><line x1="1300" y1="420" x2="1380" y2="500" stroke="%2338bdf8" stroke-width="3" opacity="0.25"/><line x1="1380" y1="420" x2="1300" y2="500" stroke="%2338bdf8" stroke-width="3" opacity="0.25"/></svg>`,
  },
  aethersx2: {
    id: 'aethersx2',
    displayName: 'AetherSX2 / NetherSX2',
    systemName: 'Sony PlayStation 2 (PS2)',
    hardwareGeneration: 'Emotion Engine 294MHz · 32MB RDRAM',
    primaryColor: '#003791',
    accentColor: '#60a5fa',
    palette: {
      primary: '#003791',
      secondary: '#60a5fa',
      darkCharcoal: '#020617',
      accentGlow: 'rgba(37, 99, 235, 0.35)',
      accentBorder: 'border-indigo-500/35',
      accentBgGlass: 'bg-indigo-950/40',
      accentText: 'text-indigo-300',
      badgeBg: 'bg-indigo-950/80',
      badgeText: 'text-indigo-300',
      radialAtmosphere: 'radial-gradient(circle at 80% 20%, rgba(37, 99, 235, 0.35) 0%, rgba(96, 165, 250, 0.12) 50%, transparent 75%)',
      brandName: 'PS2 Emotion Engine Obsidian & Electric Blue',
    },
    badgeBg: 'bg-indigo-950/80',
    badgeText: 'text-indigo-300',
    gradient: 'from-indigo-950 via-slate-950 to-black',
    githubSystemFolder: 'Sony - PlayStation 2',
    description: 'PlayStation 2 Emotion Engine monoliths rising from midnight obsidian mist with neon electric blue energy columns.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="ps2Grad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23020617"/><stop offset="50%" stop-color="%230a1128"/><stop offset="100%" stop-color="%23000411"/></linearGradient><linearGradient id="towerGrad" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%231e3a8a" stop-opacity="0.8"/><stop offset="70%" stop-color="%230f172a" stop-opacity="0.95"/><stop offset="100%" stop-color="%23020617"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23ps2Grad)"/><rect x="350" y="240" width="110" height="680" fill="url(%23towerGrad)" stroke="%233b82f6" stroke-width="2" opacity="0.6"/><rect x="520" y="380" width="85" height="540" fill="url(%23towerGrad)" stroke="%2360a5fa" stroke-width="1.5" opacity="0.5"/><rect x="1350" y="180" width="140" height="740" fill="url(%23towerGrad)" stroke="%232563eb" stroke-width="2" opacity="0.7"/><rect x="1540" y="320" width="95" height="600" fill="url(%23towerGrad)" stroke="%2338bdf8" stroke-width="1.5" opacity="0.5"/><circle cx="960" cy="540" r="450" fill="%231d4ed8" opacity="0.12" filter="blur(80px)"/><text x="960" y="980" font-family="monospace" font-size="28" fill="%233b82f6" opacity="0.3" text-anchor="middle" letter-spacing="12">EMOTION ENGINE 128-BIT</text></svg>`,
  },
  citra: {
    id: 'citra',
    displayName: 'Citra / Lime3DS',
    systemName: 'Nintendo 3DS',
    hardwareGeneration: 'Dual ARM11 MPCore · 128MB FCRAM · 3D Parallax',
    primaryColor: '#d97706',
    accentColor: '#f59e0b',
    palette: {
      primary: '#d97706',
      secondary: '#06b6d4',
      darkCharcoal: '#140b04',
      accentGlow: 'rgba(217, 119, 6, 0.35)',
      accentBorder: 'border-amber-500/35',
      accentBgGlass: 'bg-amber-950/40',
      accentText: 'text-amber-300',
      badgeBg: 'bg-amber-950/80',
      badgeText: 'text-amber-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 25%, rgba(217, 119, 6, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 75%)',
      brandName: 'Nintendo 3DS Crimson, Golden Amber & Stereoscopic Cyan',
    },
    badgeBg: 'bg-amber-950/80',
    badgeText: 'text-amber-300',
    gradient: 'from-amber-950 via-slate-950 to-black',
    githubSystemFolder: 'Nintendo - Nintendo 3DS',
    description: 'Stereoscopic golden amber Triforce crystal aura with dual-screen geometric reflections.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="citraGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a0e05"/><stop offset="50%" stop-color="%230f0c08"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23f59e0b" stop-opacity="0.6"/><stop offset="50%" stop-color="%23fbbf24" stop-opacity="0.8"/><stop offset="100%" stop-color="%23d97706" stop-opacity="0.4"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23citraGrad)"/><polygon points="960,260 1120,540 800,540" fill="none" stroke="url(%23goldGlow)" stroke-width="4" opacity="0.6"/><polygon points="800,540 960,820 640,820" fill="none" stroke="url(%23goldGlow)" stroke-width="4" opacity="0.5"/><polygon points="1120,540 1280,820 960,820" fill="none" stroke="url(%23goldGlow)" stroke-width="4" opacity="0.5"/><circle cx="960" cy="540" r="320" fill="%23d97706" opacity="0.12" filter="blur(90px)"/><text x="960" y="940" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23fbbf24" opacity="0.4" text-anchor="middle" letter-spacing="8">STEREOSCOPIC 3D SYSTEM</text></svg>`,
  },
  dolphin: {
    id: 'dolphin',
    displayName: 'Dolphin Emulator',
    systemName: 'Nintendo GameCube / Wii',
    hardwareGeneration: 'IBM Gekko 485MHz · ATI Flipper GPU · 24MB 1T-SRAM',
    primaryColor: '#581c87',
    accentColor: '#a855f7',
    palette: {
      primary: '#7e22ce',
      secondary: '#c084fc',
      darkCharcoal: '#0e031a',
      accentGlow: 'rgba(126, 34, 206, 0.38)',
      accentBorder: 'border-purple-500/35',
      accentBgGlass: 'bg-purple-950/40',
      accentText: 'text-purple-300',
      badgeBg: 'bg-purple-950/80',
      badgeText: 'text-purple-300',
      radialAtmosphere: 'radial-gradient(circle at 80% 20%, rgba(126, 34, 206, 0.38) 0%, rgba(192, 132, 252, 0.12) 48%, transparent 72%)',
      brandName: 'GameCube Indigo Violet & Supernova Amethyst',
    },
    badgeBg: 'bg-purple-950/80',
    badgeText: 'text-purple-300',
    gradient: 'from-purple-950 via-slate-950 to-black',
    githubSystemFolder: 'Nintendo - GameCube',
    description: 'GameCube iconic indigo purple with 3D isometric wireframe cube lattice and Gekko violet glow.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="dolGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e0836"/><stop offset="50%" stop-color="%23120422"/><stop offset="100%" stop-color="%23020617"/></linearGradient><linearGradient id="purpleGlow" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23c084fc"/><stop offset="100%" stop-color="%236b21a8"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23dolGrad)"/><g transform="translate(960, 480)" stroke="url(%23purpleGlow)" stroke-width="3" fill="none" opacity="0.5"><polygon points="0,-180 156,-90 156,90 0,180 -156,90 -156,-90"/><line x1="0" y1="0" x2="0" y2="180"/><line x1="0" y1="0" x2="156" y2="-90"/><line x1="0" y1="0" x2="-156" y2="-90"/><circle cx="0" cy="0" r="280" stroke="%239333ea" stroke-width="1.5" stroke-dasharray="8 8" opacity="0.4"/></g><circle cx="960" cy="480" r="380" fill="%237e22ce" opacity="0.15" filter="blur(100px)"/><text x="960" y="860" font-family="monospace" font-size="22" fill="%23c084fc" opacity="0.4" text-anchor="middle" letter-spacing="10">GAMECUBE 485MHz GEKKO ENGINE</text></svg>`,
  },
  skyline: {
    id: 'skyline',
    displayName: 'Skyline / Strato',
    systemName: 'Nintendo Switch',
    hardwareGeneration: 'Custom NVIDIA Tegra X1 · Maxwell 256-core · 4GB LPDDR4',
    primaryColor: '#e11d48',
    accentColor: '#38bdf8',
    palette: {
      primary: '#e11d48',
      secondary: '#00c3e3',
      darkCharcoal: '#0a040d',
      accentGlow: 'rgba(225, 29, 72, 0.35)',
      accentBorder: 'border-rose-500/35',
      accentBgGlass: 'bg-rose-950/40',
      accentText: 'text-rose-300',
      badgeBg: 'bg-rose-950/80',
      badgeText: 'text-rose-300',
      radialAtmosphere: 'radial-gradient(circle at 25% 25%, rgba(0, 195, 227, 0.28) 0%, transparent 55%), radial-gradient(circle at 85% 25%, rgba(225, 29, 72, 0.32) 0%, transparent 55%)',
      brandName: 'Joy-Con Neon Split: Cyan Left & Crimson Right',
    },
    badgeBg: 'bg-rose-950/80',
    badgeText: 'text-rose-300',
    gradient: 'from-rose-950 via-slate-950 to-sky-950',
    githubSystemFolder: 'Nintendo - Nintendo Switch',
    description: 'Switch Joy-Con dual neon split: Neon Cyan left aura and Neon Crimson Red right aura with dark carbon textures.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="switchGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23022538"/><stop offset="35%" stop-color="%23020617"/><stop offset="65%" stop-color="%23020617"/><stop offset="100%" stop-color="%233b0914"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23switchGrad)"/><circle cx="280" cy="540" r="340" fill="%2300b4d8" opacity="0.22" filter="blur(120px)"/><circle cx="1640" cy="540" r="340" fill="%23ff3366" opacity="0.22" filter="blur(120px)"/><line x1="960" y1="120" x2="960" y2="960" stroke="%23334155" stroke-width="2" stroke-dasharray="12 12" opacity="0.4"/><g transform="translate(960, 540)"><rect x="-60" y="-120" width="50" height="240" rx="25" fill="%2300b4d8" opacity="0.4"/><rect x="10" y="-120" width="50" height="240" rx="25" fill="%23ff3366" opacity="0.4"/><circle cx="-35" cy="-50" r="14" fill="%23020617"/><circle cx="35" cy="50" r="14" fill="%23020617"/></g><text x="960" y="860" font-family="sans-serif" font-weight="900" font-size="22" fill="%23cbd5e1" opacity="0.35" text-anchor="middle" letter-spacing="12">HYBRID CONSOLE ARCHITECTURE</text></svg>`,
  },
  duckstation: {
    id: 'duckstation',
    displayName: 'DuckStation',
    systemName: 'Sony PlayStation (PS1)',
    hardwareGeneration: '33.8MHz MIPS R3000A · 2MB RAM · 1MB VRAM',
    primaryColor: '#475569',
    accentColor: '#94a3b8',
    palette: {
      primary: '#64748b',
      secondary: '#cbd5e1',
      darkCharcoal: '#090d16',
      accentGlow: 'rgba(100, 116, 139, 0.35)',
      accentBorder: 'border-slate-500/35',
      accentBgGlass: 'bg-slate-900/50',
      accentText: 'text-slate-300',
      badgeBg: 'bg-slate-900/80',
      badgeText: 'text-slate-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 25%, rgba(100, 116, 139, 0.32) 0%, rgba(203, 213, 225, 0.1) 45%, transparent 70%)',
      brandName: 'PS1 Industrial 1994 Matte Slate & Geometric Silver',
    },
    badgeBg: 'bg-slate-900/80',
    badgeText: 'text-slate-300',
    gradient: 'from-slate-900 via-slate-950 to-black',
    githubSystemFolder: 'Sony - PlayStation',
    description: 'Original 1994 PlayStation industrial matte gray polygons with diamond rainbow chromatic aberration.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%23090d16"/><polygon points="960,340 1140,640 780,640" fill="none" stroke="%2394a3b8" stroke-width="3" opacity="0.4"/><polygon points="960,380 1100,620 820,620" fill="none" stroke="%23e2e8f0" stroke-width="1.5" opacity="0.25"/><circle cx="960" cy="540" r="400" fill="%23475569" opacity="0.1" filter="blur(100px)"/><text x="960" y="880" font-family="monospace" font-size="24" fill="%2394a3b8" opacity="0.4" text-anchor="middle" letter-spacing="12">32-BIT RISC ARCHITECTURE 1994</text></svg>`,
  },
  retroarch: {
    id: 'retroarch',
    displayName: 'RetroArch Multi-Core',
    systemName: 'Libretro Unified Emulation',
    hardwareGeneration: 'Multi-Core Virtual Architecture (70+ Systems)',
    primaryColor: '#059669',
    accentColor: '#10b981',
    palette: {
      primary: '#059669',
      secondary: '#34d399',
      darkCharcoal: '#02160e',
      accentGlow: 'rgba(5, 150, 105, 0.35)',
      accentBorder: 'border-emerald-500/35',
      accentBgGlass: 'bg-emerald-950/40',
      accentText: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 25%, rgba(5, 150, 105, 0.35) 0%, rgba(52, 211, 153, 0.12) 50%, transparent 75%)',
      brandName: 'Phosphor CRT Phosphor Scanline Emerald',
    },
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    gradient: 'from-emerald-950 via-slate-950 to-black',
    githubSystemFolder: 'Libretro - Multi System',
    description: 'Retro CRT phosphor scanlines with 8-bit space invader matrix and emerald CRT glow.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%23021b14"/><circle cx="960" cy="540" r="420" fill="%23059669" opacity="0.15" filter="blur(120px)"/><g transform="translate(960,480)" fill="%2310b981" opacity="0.4"><rect x="-70" y="-50" width="140" height="30" rx="4"/><rect x="-50" y="-20" width="100" height="40" rx="4"/><rect x="-90" y="0" width="30" height="30" rx="4"/><rect x="60" y="0" width="30" height="30" rx="4"/><circle cx="-30" cy="-35" r="8" fill="%23021b14"/><circle cx="30" cy="-35" r="8" fill="%23021b14"/></g><text x="960" y="860" font-family="monospace" font-size="22" fill="%2334d399" opacity="0.4" text-anchor="middle" letter-spacing="10">LIBRETRO MULTI-CORE ECOSYSTEM</text></svg>`,
  },
  builtin_runner: {
    id: 'builtin_runner',
    displayName: 'PS5 Live Sandbox',
    systemName: 'Built-in Hardware Runner',
    hardwareGeneration: '60 FPS Direct Canvas · Real-Time Save State Engine',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    palette: {
      primary: '#0284c7',
      secondary: '#ec4899',
      darkCharcoal: '#031427',
      accentGlow: 'rgba(2, 132, 199, 0.38)',
      accentBorder: 'border-sky-500/35',
      accentBgGlass: 'bg-sky-950/40',
      accentText: 'text-sky-300',
      badgeBg: 'bg-sky-950/80',
      badgeText: 'text-sky-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(2, 132, 199, 0.35) 0%, rgba(236, 72, 153, 0.15) 50%, transparent 75%)',
      brandName: 'PlayStation 5 Lightbar Ambient Blue & Cyber Neon',
    },
    badgeBg: 'bg-sky-950/80',
    badgeText: 'text-sky-300',
    gradient: 'from-sky-950 via-slate-950 to-purple-950',
    githubSystemFolder: 'PlayStation 5 - Built-in Runner',
    description: 'Futuristic neon cyberpunk grid, cybernetic speed lines, and Axel Steel high-tech combat arena.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23032541"/><stop offset="50%" stop-color="%230a0826"/><stop offset="100%" stop-color="%232b0938"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23cyberGrad)"/><g stroke="%2338bdf8" stroke-width="1.5" opacity="0.25"><line x1="0" y1="650" x2="1920" y2="650"/><line x1="0" y1="720" x2="1920" y2="720"/><line x1="0" y1="810" x2="1920" y2="810"/><line x1="0" y1="920" x2="1920" y2="920"/><line x1="960" y1="580" x2="0" y2="1080"/><line x1="960" y1="580" x2="384" y2="1080"/><line x1="960" y1="580" x2="768" y2="1080"/><line x1="960" y1="580" x2="1152" y2="1080"/><line x1="960" y1="580" x2="1536" y2="1080"/><line x1="960" y1="580" x2="1920" y2="1080"/></g><circle cx="960" cy="450" r="180" fill="none" stroke="%23ec4899" stroke-width="3" opacity="0.4"/><circle cx="960" cy="450" r="320" fill="%2338bdf8" opacity="0.15" filter="blur(100px)"/><text x="960" y="520" font-family="sans-serif" font-weight="900" font-size="36" fill="%23f472b6" opacity="0.3" text-anchor="middle" letter-spacing="16">CYBERBLAST LIVE SANDBOX</text></svg>`,
  },
  native_android: {
    id: 'native_android',
    displayName: 'Android Game Space',
    systemName: 'Native Android APK',
    hardwareGeneration: 'Vulkan 1.3 / OpenGL ES 3.2 · ARM64-v8a',
    primaryColor: '#16a34a',
    accentColor: '#4ade80',
    palette: {
      primary: '#16a34a',
      secondary: '#4ade80',
      darkCharcoal: '#031a0e',
      accentGlow: 'rgba(22, 163, 74, 0.35)',
      accentBorder: 'border-emerald-500/35',
      accentBgGlass: 'bg-emerald-950/40',
      accentText: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/80',
      badgeText: 'text-emerald-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 25%, rgba(22, 163, 74, 0.35) 0%, rgba(74, 222, 128, 0.12) 50%, transparent 75%)',
      brandName: 'Vulkan Android Native Emerald & Forest Dark',
    },
    badgeBg: 'bg-emerald-950/80',
    badgeText: 'text-emerald-300',
    gradient: 'from-emerald-950 via-slate-950 to-black',
    githubSystemFolder: 'Android - Native Titles',
    description: 'Vulkan-accelerated native Android game environment with direct scoped storage integration.',
    wallpaperSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="%23031a0e"/><circle cx="960" cy="540" r="360" fill="%2322c55e" opacity="0.12" filter="blur(110px)"/><text x="960" y="880" font-family="sans-serif" font-weight="bold" font-size="22" fill="%234ade80" opacity="0.35" text-anchor="middle" letter-spacing="12">VULKAN ANDROID RUNTIME</text></svg>`,
  },
};

/**
 * Game Specific Ultra-HD Blurred Hero Art & Color Palette Extraction
 */
export interface GameHeroAsset {
  heroWallpaper: string;
  palette: ExtractedColorPalette;
  themeDescription: string;
}

export const GAME_HERO_ASSETS: Record<string, GameHeroAsset> = {
  game_chained_fury: {
    heroWallpaper: '/src/assets/images/boxart_god_of_war_psp_1793286023208.jpg',
    palette: {
      primary: '#ef4444',
      secondary: '#f97316',
      darkCharcoal: '#0d0404',
      accentGlow: 'rgba(239, 68, 68, 0.38)',
      accentBorder: 'border-red-500/40',
      accentBgGlass: 'bg-red-950/40',
      accentText: 'text-red-400',
      badgeBg: 'bg-red-950/85',
      badgeText: 'text-red-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(220, 38, 38, 0.40) 0%, rgba(249, 115, 22, 0.20) 45%, transparent 72%)',
      brandName: 'Fiery Crimson & Dark Charcoal',
    },
    themeDescription: 'Fiery crimson volcanic embers and dark obsidian charcoal matching Spartan blades of chaos.',
  },
  game_cyberblast: {
    heroWallpaper: '/src/assets/images/hero_chrono_raider_1793286022589.jpg',
    palette: {
      primary: '#06b6d4',
      secondary: '#a855f7',
      darkCharcoal: '#040714',
      accentGlow: 'rgba(6, 182, 212, 0.38)',
      accentBorder: 'border-cyan-500/40',
      accentBgGlass: 'bg-cyan-950/40',
      accentText: 'text-cyan-300',
      badgeBg: 'bg-cyan-950/85',
      badgeText: 'text-cyan-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(6, 182, 212, 0.38) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 75%)',
      brandName: 'Cyber Cyan & Electric Violet',
    },
    themeDescription: 'Neon cybernetic cyan speed trails with deep electric violet hyperdrive bloom.',
  },
  game_aethel_starblade: {
    heroWallpaper: '/src/assets/images/boxart_zelda_3ds_1793286023289.jpg',
    palette: {
      primary: '#10b981',
      secondary: '#f59e0b',
      darkCharcoal: '#02140d',
      accentGlow: 'rgba(16, 185, 129, 0.35)',
      accentBorder: 'border-emerald-500/40',
      accentBgGlass: 'bg-emerald-950/40',
      accentText: 'text-emerald-300',
      badgeBg: 'bg-emerald-950/85',
      badgeText: 'text-emerald-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(16, 185, 129, 0.35) 0%, rgba(245, 158, 11, 0.22) 50%, transparent 75%)',
      brandName: 'Celestial Emerald & Runic Amber Gold',
    },
    themeDescription: 'Ancient Master Starblade forest emerald with sacred Triforce golden amber aura.',
  },
  game_tokyo_drift: {
    heroWallpaper: '/src/assets/images/boxart_racing_ps2_1793286022995.jpg',
    palette: {
      primary: '#38bdf8',
      secondary: '#f43f5e',
      darkCharcoal: '#020617',
      accentGlow: 'rgba(56, 189, 248, 0.35)',
      accentBorder: 'border-sky-500/40',
      accentBgGlass: 'bg-sky-950/40',
      accentText: 'text-sky-300',
      badgeBg: 'bg-sky-950/85',
      badgeText: 'text-sky-300',
      radialAtmosphere: 'radial-gradient(circle at 80% 20%, rgba(56, 189, 248, 0.35) 0%, rgba(244, 63, 94, 0.20) 50%, transparent 75%)',
      brandName: 'Midnight C1 Blue & Crimson Tail Lights',
    },
    themeDescription: 'Shuto Expressway midnight asphalt with twin-turbo boost blue and neon brake trails.',
  },
  game_dolphin_smash: {
    heroWallpaper: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="smashGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a082b"/><stop offset="50%" stop-color="%230c0217"/><stop offset="100%" stop-color="%23030008"/></linearGradient><linearGradient id="smashCross" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23fbbf24" stop-opacity="0.7"/><stop offset="100%" stop-color="%23c084fc" stop-opacity="0.9"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23smashGrad)"/><circle cx="1280" cy="460" r="380" fill="%237e22ce" opacity="0.25" filter="blur(90px)"/><circle cx="960" cy="520" r="240" fill="none" stroke="url(%23smashCross)" stroke-width="12" opacity="0.6"/><line x1="720" y1="520" x2="1200" y2="520" stroke="url(%23smashCross)" stroke-width="12" opacity="0.6"/><line x1="880" y1="280" x2="880" y2="760" stroke="url(%23smashCross)" stroke-width="12" opacity="0.6"/><text x="960" y="860" font-family="sans-serif" font-weight="900" font-size="32" fill="%23fbbf24" opacity="0.4" text-anchor="middle" letter-spacing="14">ALL-STAR ARENA 100% ROSTER</text></svg>`,
    palette: {
      primary: '#a855f7',
      secondary: '#fbbf24',
      darkCharcoal: '#0d031c',
      accentGlow: 'rgba(168, 85, 247, 0.38)',
      accentBorder: 'border-purple-500/40',
      accentBgGlass: 'bg-purple-950/40',
      accentText: 'text-purple-300',
      badgeBg: 'bg-purple-950/85',
      badgeText: 'text-purple-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(168, 85, 247, 0.38) 0%, rgba(251, 191, 36, 0.22) 50%, transparent 75%)',
      brandName: 'Supernova Amethyst & Champion Gold',
    },
    themeDescription: 'Deep GameCube cosmic arena with supernova gold and vibrant amethyst flares.',
  },
  game_skyline_dread: {
    heroWallpaper: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"><defs><linearGradient id="dreadGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%232b0712"/><stop offset="50%" stop-color="%230b0206"/><stop offset="100%" stop-color="%23010c14"/></linearGradient></defs><rect width="1920" height="1080" fill="url(%23dreadGrad)"/><circle cx="680" cy="480" r="320" fill="%23e11d48" opacity="0.28" filter="blur(110px)"/><circle cx="1320" cy="520" r="300" fill="%2306b6d4" opacity="0.22" filter="blur(100px)"/><g transform="translate(960, 480)" stroke="%23f43f5e" stroke-width="2.5" fill="none" opacity="0.5"><circle cx="0" cy="0" r="160" stroke-dasharray="14 8"/><polygon points="0,-120 104,60 -104,60"/><circle cx="0" cy="0" r="28" fill="%23e11d48"/></g><text x="960" y="860" font-family="monospace" font-size="24" fill="%23fb7185" opacity="0.45" text-anchor="middle" letter-spacing="14">PLANET ZDR BIO-ZONE DETECTED</text></svg>`,
    palette: {
      primary: '#e11d48',
      secondary: '#06b6d4',
      darkCharcoal: '#0a030a',
      accentGlow: 'rgba(225, 29, 72, 0.38)',
      accentBorder: 'border-rose-500/40',
      accentBgGlass: 'bg-rose-950/40',
      accentText: 'text-rose-300',
      badgeBg: 'bg-rose-950/85',
      badgeText: 'text-rose-300',
      radialAtmosphere: 'radial-gradient(circle at 75% 20%, rgba(225, 29, 72, 0.38) 0%, rgba(6, 182, 212, 0.20) 50%, transparent 75%)',
      brandName: 'E.M.M.I. Neon Crimson & Power Suit Cyan',
    },
    themeDescription: 'Stealth research zone on Planet ZDR with optical sensor crimson and power-suit cyan.',
  },
};

export type BackdropMode = 'game' | 'emulator' | 'auto' | 'last_played';

const STORAGE_KEY_BACKDROP_MODE = 'savesync_backdrop_mode';
const STORAGE_KEY_LAST_PLAYED_ID = 'savesync_last_played_id';

export function getSavedBackdropMode(): BackdropMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BACKDROP_MODE);
    if (saved === 'game' || saved === 'emulator' || saved === 'auto' || saved === 'last_played') {
      return saved as BackdropMode;
    }
  } catch {}
  return 'game'; // Default to Game Selection Mode as requested
}

export function saveBackdropMode(mode: BackdropMode): void {
  try {
    localStorage.setItem(STORAGE_KEY_BACKDROP_MODE, mode);
  } catch {}
}

export function getSavedLastPlayedId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_LAST_PLAYED_ID);
  } catch {
    return null;
  }
}

export function saveLastPlayedId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_PLAYED_ID, id);
  } catch {}
}

/**
 * Extracts or resolves the color palette for a specific game
 */
export function getGameColorPalette(game: GameItem): ExtractedColorPalette {
  const asset = GAME_HERO_ASSETS[game.id];
  if (asset) {
    return asset.palette;
  }

  // Fallback to platform palette with custom game adjustments
  const theme = EMULATOR_THEMES[game.platform] || EMULATOR_THEMES.builtin_runner;
  return theme.palette;
}

export interface BackdropResolution {
  imageUrl: string;
  palette: ExtractedColorPalette;
  isEmulatorTheme: boolean;
  themeMode: 'game' | 'emulator' | 'auto';
  theme: EmulatorTheme;
  title: string;
  subtitle: string;
  paletteName: string;
}

/**
 * Resolves the dynamic adaptive backdrop and color palette based on selected game and mode
 */
export function resolveBackdrop(
  selectedGame: GameItem,
  mode: BackdropMode,
  allGames: GameItem[]
): BackdropResolution {
  const platformTheme = EMULATOR_THEMES[selectedGame.platform] || EMULATOR_THEMES.builtin_runner;
  const gameHero = GAME_HERO_ASSETS[selectedGame.id];

  // 1. Emulator Theme Mode: Matches the brand identity of the platform
  if (mode === 'emulator') {
    return {
      imageUrl: platformTheme.wallpaperSvg,
      palette: platformTheme.palette,
      isEmulatorTheme: true,
      themeMode: 'emulator',
      theme: platformTheme,
      title: platformTheme.displayName,
      subtitle: `${platformTheme.systemName} · ${platformTheme.hardwareGeneration}`,
      paletteName: platformTheme.palette.brandName,
    };
  }

  // 2. Last Played Mode
  if (mode === 'last_played') {
    const lastPlayedId = getSavedLastPlayedId();
    const lastPlayed = allGames.find((g) => g.id === lastPlayedId) || allGames[0] || selectedGame;
    const lastHero = GAME_HERO_ASSETS[lastPlayed.id];
    const image = lastHero?.heroWallpaper || lastPlayed.boxArt || platformTheme.wallpaperSvg;
    const palette = lastHero?.palette || getGameColorPalette(lastPlayed);

    return {
      imageUrl: image,
      palette,
      isEmulatorTheme: false,
      themeMode: 'game',
      theme: platformTheme,
      title: lastPlayed.title,
      subtitle: `Last Played: ${lastPlayed.lastPlayed} · ${lastPlayed.platformName}`,
      paletteName: palette.brandName,
    };
  }

  // 3. Game Selection Mode (or 'auto')
  // When a game (e.g., Chained Fury: Ascension) is active, the entire app background
  // dynamically displays a sleek, dark-themed, ultra-high-resolution blurred wallpaper or hero art
  // with smooth color extraction matching the game's key palette (e.g. fiery crimson & dark charcoal)
  const image = gameHero?.heroWallpaper || selectedGame.boxArt || platformTheme.wallpaperSvg;
  const palette = gameHero?.palette || getGameColorPalette(selectedGame);

  return {
    imageUrl: image,
    palette,
    isEmulatorTheme: false,
    themeMode: mode === 'auto' ? 'auto' : 'game',
    theme: platformTheme,
    title: selectedGame.title,
    subtitle: `${selectedGame.platformName} · ${palette.brandName}`,
    paletteName: palette.brandName,
  };
}
