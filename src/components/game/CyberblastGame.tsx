import React, { useEffect, useRef, useState, useCallback } from 'react';
import { sound } from '../../utils/audio';
import { SaveSlot } from '../../types/savesync';
import { stringToHex, calculateCRC32 } from '../../utils/hexHelper';
import { Volume2, VolumeX, Maximize2, Minimize2, Play, RefreshCw, BookmarkCheck, ArrowLeft } from 'lucide-react';

interface CyberblastGameProps {
  onSaveCreated: (slot: SaveSlot) => void;
  onExit?: () => void;
  loadSlot?: SaveSlot | null;
}

type GameMode = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  color: string;
  radius: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: 'drone' | 'speeder' | 'titan';
  shootCooldown: number;
  telegraphTimer: number;
  width: number;
  height: number;
  color: string;
}

interface CheckpointItem {
  x: number;
  y: number;
  collected: boolean;
  name: string;
  pulse: number;
}

export const CyberblastGame: React.FC<CyberblastGameProps> = ({
  onSaveCreated,
  onExit,
  loadSlot,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<GameMode>('TITLE');
  const [isMuted, setIsMuted] = useState(sound.isMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSaveFeedback, setLastSaveFeedback] = useState<string | null>(null);

  // HUD Readouts kept in ref to decouple from 60fps canvas loop
  const hudRef = useRef({
    hp: 100,
    maxHp: 100,
    energy: 100,
    score: 0,
    wave: 1,
    credits: 0,
    checkpoint: 'Sector 1 Gate',
    statusMsg: 'Ready',
  });
  const [hudState, setHudState] = useState({ ...hudRef.current });

  // Game state held in mutable refs to avoid React re-rendering the loop
  const engineRef = useRef({
    player: {
      x: 120,
      y: 270,
      vx: 0,
      vy: 0,
      speed: 320,
      hp: 100,
      maxHp: 100,
      energy: 100,
      score: 0,
      wave: 1,
      credits: 0,
      checkpoint: 'Sector 1 Gate',
      dashTimer: 0,
      dashCooldown: 0,
      shootCooldown: 0,
      squashX: 1,
      squashY: 1,
      invulnerableTimer: 0,
    },
    bullets: [] as Bullet[],
    enemies: [] as Enemy[],
    particles: [] as Particle[],
    checkpoints: [] as CheckpointItem[],
    heldKeys: {} as Record<string, boolean>,
    justPressedKeys: {} as Record<string, boolean>,
    cameraShake: 0,
    hitstopTimer: 0,
    lastFrameTime: performance.now(),
    enemySpawnTimer: 1.5,
    waveEnemiesRemaining: 8,
    isBossSpawned: false,
    stars: [] as { x: number; y: number; speed: number; size: number; color: string }[],
  });

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Initialize Stars background
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        speed: 30 + Math.random() * 120,
        size: Math.random() > 0.8 ? 2 : 1,
        color: Math.random() > 0.5 ? '#38bdf8' : '#a855f7',
      });
    }
    engineRef.current.stars = stars;
  }, []);

  // Handle Loading Slot
  useEffect(() => {
    if (loadSlot && loadSlot.payloadData) {
      const data = loadSlot.payloadData;
      const p = engineRef.current.player;
      p.hp = data.hp ?? 100;
      p.score = data.score ?? 0;
      p.wave = data.level ?? 1;
      p.credits = data.currency ?? 0;
      p.checkpoint = data.location ?? 'Restored Checkpoint';

      hudRef.current.hp = p.hp;
      hudRef.current.score = p.score;
      hudRef.current.wave = p.wave;
      hudRef.current.credits = p.credits;
      hudRef.current.checkpoint = p.checkpoint;
      hudRef.current.statusMsg = `Loaded ${loadSlot.slotNumber}`;
      setHudState({ ...hudRef.current });
      setMode('PLAYING');
      sound.playSaveChime();
    }
  }, [loadSlot]);

  // Trigger Save function
  const triggerSaveGame = useCallback(
    (slotType = 'QuickSave (F5)') => {
      const p = engineRef.current.player;
      sound.playSaveChime();

      const payloadObj = {
        playerName: 'Axel Steel',
        level: p.wave,
        score: p.score,
        hp: p.hp,
        currency: p.credits,
        location: p.checkpoint,
        timestamp: new Date().toISOString(),
      };

      const jsonStr = JSON.stringify(payloadObj);
      const hex = stringToHex(jsonStr);
      const checksum = calculateCRC32(jsonStr);

      const newSlot: SaveSlot = {
        id: `slot_cb_${Date.now()}`,
        slotNumber: slotType,
        name: `${p.checkpoint} (Wave ${p.wave})`,
        timestamp: new Date().toISOString(),
        sizeBytes: 1024 * 64,
        inGameLevel: `Sector ${p.wave}`,
        playtime: `${Math.floor(p.score / 600)}m ${Math.floor((p.score % 600) / 10)}s`,
        checksum,
        payloadHex: hex,
        payloadData: payloadObj,
        isCloudSynced: false,
      };

      onSaveCreated(newSlot);
      setLastSaveFeedback(`Saved: ${newSlot.name} [CRC: ${checksum}]`);
      setTimeout(() => setLastSaveFeedback(null), 3500);
    },
    [onSaveCreated]
  );

  // Key Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll on arrow / space
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (!engineRef.current.heldKeys[e.code]) {
        engineRef.current.justPressedKeys[e.code] = true;
      }
      engineRef.current.heldKeys[e.code] = true;

      if (e.code === 'KeyF' && (e.altKey || e.ctrlKey)) {
        setIsFullscreen((prev) => !prev);
      }

      if (e.code === 'KeyM') {
        handleToggleMute();
      }

      if (e.code === 'Escape') {
        setMode((prev) => (prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev));
      }

      if (e.code === 'F5' && mode === 'PLAYING') {
        e.preventDefault();
        triggerSaveGame('QuickSave (F5)');
      }

      if ((e.code === 'Enter' || e.code === 'Space') && mode === 'TITLE') {
        setMode('PLAYING');
        sound.playClick();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current.heldKeys[e.code] = false;
    };

    const handleBlur = () => {
      engineRef.current.heldKeys = {};
      engineRef.current.justPressedKeys = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [mode, handleToggleMute, triggerSaveGame]);

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset loop timer
    engineRef.current.lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - engineRef.current.lastFrameTime) / 1000;
      engineRef.current.lastFrameTime = currentTime;
      // Clamp delta time to 50ms (avoid spiral of death)
      const dt = Math.min(rawDt, 0.05);

      const engine = engineRef.current;
      const { player, heldKeys, justPressedKeys } = engine;

      // Handle Hitstop (30-80ms simulation pause on heavy hit)
      if (engine.hitstopTimer > 0) {
        engine.hitstopTimer -= dt;
      } else if (mode === 'PLAYING') {
        // --- 1. UPDATE STARS (Parallax) ---
        for (const star of engine.stars) {
          star.x -= star.speed * dt;
          if (star.x < 0) {
            star.x = 960;
            star.y = Math.random() * 540;
          }
        }

        // --- 2. PLAYER INPUT & MOTION ---
        let moveX = 0;
        let moveY = 0;
        if (heldKeys['KeyW'] || heldKeys['ArrowUp']) moveY -= 1;
        if (heldKeys['KeyS'] || heldKeys['ArrowDown']) moveY += 1;
        if (heldKeys['KeyA'] || heldKeys['ArrowLeft']) moveX -= 1;
        if (heldKeys['KeyD'] || heldKeys['ArrowRight']) moveX += 1;

        // Normalize diagonal
        if (moveX !== 0 && moveY !== 0) {
          const invSqrt2 = 0.7071;
          moveX *= invSqrt2;
          moveY *= invSqrt2;
        }

        // Dash action (Shift or KeyJ)
        if ((justPressedKeys['ShiftLeft'] || justPressedKeys['ShiftRight'] || justPressedKeys['KeyK']) && player.dashCooldown <= 0) {
          player.dashTimer = 0.16;
          player.dashCooldown = 0.8;
          player.invulnerableTimer = 0.2;
          player.squashX = 1.4;
          player.squashY = 0.7;
          sound.playDash();

          // Spawn dash ghost particles
          for (let i = 0; i < 8; i++) {
            engine.particles.push({
              x: player.x + (Math.random() - 0.5) * 16,
              y: player.y + (Math.random() - 0.5) * 16,
              vx: -180 + (Math.random() - 0.5) * 60,
              vy: (Math.random() - 0.5) * 60,
              life: 0.25,
              maxLife: 0.25,
              color: '#38bdf8',
              size: 4 + Math.random() * 3,
            });
          }
        }

        const isDashing = player.dashTimer > 0;
        const currentSpeed = isDashing ? player.speed * 2.4 : player.speed;
        player.vx = moveX * currentSpeed;
        player.vy = moveY * currentSpeed;

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Boundaries clamp (960 x 540)
        player.x = Math.max(30, Math.min(930, player.x));
        player.y = Math.max(30, Math.min(510, player.y));

        if (player.dashTimer > 0) player.dashTimer -= dt;
        if (player.dashCooldown > 0) player.dashCooldown -= dt;
        if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt;

        // Squash-and-stretch easing return to 1
        player.squashX += (1 - player.squashX) * 12 * dt;
        player.squashY += (1 - player.squashY) * 12 * dt;

        // Shooting (Space or KeyJ)
        player.shootCooldown -= dt;
        if ((heldKeys['Space'] || heldKeys['KeyJ']) && player.shootCooldown <= 0) {
          player.shootCooldown = 0.16;
          player.squashX = 0.85;
          player.squashY = 1.2;
          sound.playLaser();

          engine.bullets.push({
            x: player.x + 22,
            y: player.y,
            vx: 780,
            vy: 0,
            isPlayer: true,
            color: '#38bdf8',
            radius: 4,
          });

          // Recoil muzzle particle
          engine.particles.push({
            x: player.x + 24,
            y: player.y,
            vx: -80,
            vy: (Math.random() - 0.5) * 40,
            life: 0.1,
            maxLife: 0.1,
            color: '#7dd3fc',
            size: 3,
          });
        }

        // --- 3. BULLETS UPDATE ---
        for (let i = engine.bullets.length - 1; i >= 0; i--) {
          const b = engine.bullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Out of screen
          if (b.x < -20 || b.x > 980 || b.y < -20 || b.y > 560) {
            engine.bullets.splice(i, 1);
            continue;
          }

          // Player bullets hitting enemies
          if (b.isPlayer) {
            let hit = false;
            for (let j = engine.enemies.length - 1; j >= 0; j--) {
              const enemy = engine.enemies[j];
              const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
              if (dist < enemy.width / 2 + b.radius) {
                hit = true;
                enemy.hp -= 25;
                sound.playHit();

                // Spark particles
                for (let k = 0; k < 4; k++) {
                  engine.particles.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 200,
                    vy: (Math.random() - 0.5) * 200,
                    life: 0.2,
                    maxLife: 0.2,
                    color: '#facc15',
                    size: 3,
                  });
                }

                if (enemy.hp <= 0) {
                  // Defeated!
                  sound.playExplosion();
                  engine.cameraShake = enemy.type === 'titan' ? 14 : 6;
                  engine.hitstopTimer = enemy.type === 'titan' ? 0.08 : 0.03;

                  player.score += enemy.type === 'titan' ? 2500 : 350;
                  player.credits += enemy.type === 'titan' ? 150 : 25;

                  // Explosion explosion particles
                  const pCount = enemy.type === 'titan' ? 36 : 14;
                  for (let k = 0; k < pCount; k++) {
                    const angle = Math.random() * Math.PI * 2;
                    const spd = 60 + Math.random() * 240;
                    engine.particles.push({
                      x: enemy.x,
                      y: enemy.y,
                      vx: Math.cos(angle) * spd,
                      vy: Math.sin(angle) * spd,
                      life: 0.4 + Math.random() * 0.3,
                      maxLife: 0.7,
                      color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
                      size: 3 + Math.random() * 5,
                    });
                  }

                  // Chance to spawn Data Core checkpoint
                  if (Math.random() > 0.45 || enemy.type === 'titan') {
                    engine.checkpoints.push({
                      x: enemy.x,
                      y: enemy.y,
                      collected: false,
                      name: `Data Core #${player.credits}`,
                      pulse: 0,
                    });
                  }

                  engine.enemies.splice(j, 1);
                }
                break;
              }
            }
            if (hit) {
              engine.bullets.splice(i, 1);
              continue;
            }
          } else {
            // Enemy bullet hitting player
            const dist = Math.hypot(b.x - player.x, b.y - player.y);
            if (dist < 18 + b.radius && player.invulnerableTimer <= 0) {
              player.hp = Math.max(0, player.hp - 15);
              player.invulnerableTimer = 0.5;
              engine.cameraShake = 8;
              sound.playHit();
              engine.bullets.splice(i, 1);

              if (player.hp <= 0) {
                setMode('GAMEOVER');
              }
              continue;
            }
          }
        }

        // --- 4. ENEMIES SPAWN & AI ---
        engine.enemySpawnTimer -= dt;
        if (engine.enemySpawnTimer <= 0 && engine.waveEnemiesRemaining > 0) {
          engine.waveEnemiesRemaining--;
          engine.enemySpawnTimer = 1.4 + Math.random() * 1.2;

          const isTitan = engine.waveEnemiesRemaining === 0 && !engine.isBossSpawned;
          if (isTitan) {
            engine.isBossSpawned = true;
            engine.enemies.push({
              id: Date.now(),
              x: 1000,
              y: 270,
              vx: -60,
              vy: 0,
              hp: 200,
              maxHp: 200,
              type: 'titan',
              shootCooldown: 1.2,
              telegraphTimer: 0.6,
              width: 54,
              height: 54,
              color: '#dc2626',
            });
          } else {
            const types: ('drone' | 'speeder')[] = ['drone', 'speeder'];
            const eType = types[Math.floor(Math.random() * types.length)];
            engine.enemies.push({
              id: Date.now() + Math.random(),
              x: 980,
              y: 60 + Math.random() * 420,
              vx: eType === 'speeder' ? -220 : -130,
              vy: (Math.random() - 0.5) * 80,
              hp: eType === 'speeder' ? 30 : 50,
              maxHp: eType === 'speeder' ? 30 : 50,
              type: eType,
              shootCooldown: 1.5 + Math.random(),
              telegraphTimer: 0.5,
              width: eType === 'speeder' ? 24 : 32,
              height: eType === 'speeder' ? 20 : 32,
              color: eType === 'speeder' ? '#eab308' : '#a855f7',
            });
          }
        }

        // Update enemies
        for (let i = engine.enemies.length - 1; i >= 0; i--) {
          const e = engine.enemies[i];
          e.x += e.vx * dt;
          e.y += e.vy * dt;

          // Bounce vertically
          if (e.y < 40 || e.y > 500) {
            e.vy *= -1;
          }

          // Enemy shooting
          e.shootCooldown -= dt;
          if (e.shootCooldown <= 0 && e.x < 900) {
            e.shootCooldown = e.type === 'titan' ? 1.0 : 2.0;
            // Fire towards player
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            engine.bullets.push({
              x: e.x - 10,
              y: e.y,
              vx: Math.cos(angle) * 260,
              vy: Math.sin(angle) * 260,
              isPlayer: false,
              color: '#f87171',
              radius: 5,
            });
          }

          // Enemy out of screen
          if (e.x < -60) {
            engine.enemies.splice(i, 1);
          }
        }

        // Check wave complete
        if (engine.waveEnemiesRemaining <= 0 && engine.enemies.length === 0) {
          player.wave += 1;
          player.checkpoint = `Sector ${player.wave} Perimeter`;
          engine.waveEnemiesRemaining = 8 + player.wave * 3;
          engine.isBossSpawned = false;
          player.hp = Math.min(100, player.hp + 30);
          player.credits += 100;
          sound.playSaveChime();

          // Auto-save on wave victory!
          triggerSaveGame('AutoSave (Wave Passed)');
        }

        // --- 5. DATA CORE CHECKPOINTS ---
        for (let i = engine.checkpoints.length - 1; i >= 0; i--) {
          const cp = engine.checkpoints[i];
          cp.pulse += dt * 4;
          const dist = Math.hypot(cp.x - player.x, cp.y - player.y);
          if (dist < 32) {
            sound.playPickup();
            player.credits += 40;
            player.score += 200;
            player.checkpoint = `Data Vault ${player.credits}G`;
            engine.checkpoints.splice(i, 1);

            // Floating text particle
            for (let k = 0; k < 6; k++) {
              engine.particles.push({
                x: player.x,
                y: player.y,
                vx: (Math.random() - 0.5) * 80,
                vy: -60 - Math.random() * 40,
                life: 0.4,
                maxLife: 0.4,
                color: '#34d399',
                size: 3,
              });
            }
          }
        }

        // --- 6. PARTICLES ---
        for (let i = engine.particles.length - 1; i >= 0; i--) {
          const p = engine.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          if (p.life <= 0) {
            engine.particles.splice(i, 1);
          }
        }

        // Camera Shake Decay
        if (engine.cameraShake > 0) {
          engine.cameraShake -= dt * 30;
          if (engine.cameraShake < 0) engine.cameraShake = 0;
        }

        // Sync to React HUD state at quiet throttled intervals
        hudRef.current.hp = Math.round(player.hp);
        hudRef.current.score = player.score;
        hudRef.current.wave = player.wave;
        hudRef.current.credits = player.credits;
        hudRef.current.checkpoint = player.checkpoint;
        setHudState({ ...hudRef.current });
      }

      // Clear justPressedKeys at end of frame
      engineRef.current.justPressedKeys = {};

      // --- 7. RENDERING CANVAS ---
      ctx.save();

      // Screen shake translation
      if (engine.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * engine.cameraShake;
        const shakeY = (Math.random() - 0.5) * engine.cameraShake;
        ctx.translate(shakeX, shakeY);
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 960, 540);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#111827');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 960, 540);

      // Starfield
      for (const star of engine.stars) {
        ctx.fillStyle = star.color;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Grid floor / ceiling perspective lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 0; y < 540; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(960, y);
        ctx.stroke();
      }

      // Render Checkpoints / Data Cores
      for (const cp of engine.checkpoints) {
        ctx.save();
        ctx.translate(cp.x, cp.y);
        const s = 1 + Math.sin(cp.pulse) * 0.2;
        ctx.scale(s, s);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      // Render Bullets
      for (const b of engine.bullets) {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.restore();
      }

      // Render Enemies
      for (const e of engine.enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);

        // Body
        ctx.fillStyle = e.color;
        ctx.beginPath();
        if (e.type === 'titan') {
          // Hexagon Titan Mech
          for (let a = 0; a < 6; a++) {
            const angle = (a * Math.PI) / 3;
            const px = Math.cos(angle) * (e.width / 2);
            const py = Math.sin(angle) * (e.height / 2);
            if (a === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else if (e.type === 'speeder') {
          // Sharp dart
          ctx.moveTo(e.width / 2, 0);
          ctx.lineTo(-e.width / 2, -e.height / 2);
          ctx.lineTo(-e.width / 4, 0);
          ctx.lineTo(-e.width / 2, e.height / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          // Drone
          ctx.arc(0, 0, e.width / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Enemy Health Bar
        if (e.hp < e.maxHp) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(-e.width / 2, -e.height / 2 - 10, e.width, 4);
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(-e.width / 2, -e.height / 2 - 10, (e.hp / e.maxHp) * e.width, 4);
        }

        ctx.restore();
      }

      // Render Player
      if (player.invulnerableTimer <= 0 || Math.floor(currentTime / 50) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.scale(player.squashX, player.squashY);

        // Cyber fighter ship body
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-16, -14);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-16, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(2, 0, 7, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Thruster flame
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-10, -5);
        ctx.lineTo(-20 - Math.random() * 8, 0);
        ctx.lineTo(-10, 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // Render Particles
      for (const p of engine.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, triggerSaveGame]);

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-slate-950 text-white select-none ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full rounded-xl overflow-hidden border border-slate-800'
      }`}
    >
      {/* Canvas Viewport */}
      <div className="relative w-full max-w-[960px] aspect-[16/9] bg-slate-900 overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full block object-contain"
        />

        {/* World-Matched Low-Occlusion HUD Overlay (pointer-events: none) */}
        {mode === 'PLAYING' && (
          <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
            {/* Top Status Cluster */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700/60 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">SHIELD</span>
                  <div className="w-24 h-2 bg-slate-800 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all duration-150 ${
                        hudState.hp > 40 ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${hudState.hp}%` }}
                    />
                  </div>
                  <span className="tabular-nums font-semibold text-slate-200">{hudState.hp}%</span>
                </div>
                <span className="text-slate-600">·</span>
                <div>
                  <span className="text-slate-400">SCORE </span>
                  <span className="text-sky-400 font-bold tabular-nums">{hudState.score}</span>
                </div>
                <span className="text-slate-600">·</span>
                <div>
                  <span className="text-slate-400">SECTOR </span>
                  <span className="text-amber-400 font-bold tabular-nums">{hudState.wave}</span>
                </div>
              </div>

              {/* Action Buttons (Save Slot, Mute, Fullscreen) */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => triggerSaveGame('QuickSave (F5)')}
                  className="flex items-center gap-1.5 px-3 py-1 bg-sky-600/90 hover:bg-sky-500 text-white font-medium text-xs rounded transition-colors"
                  title="Create in-game QuickSave to sync"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>QuickSave (F5)</span>
                </button>
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                  title="Toggle Mute (M)"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bottom Perimeter Feedback */}
            <div className="flex items-end justify-between text-xs font-mono">
              <div className="text-slate-400 bg-slate-900/60 px-2 py-1 rounded border border-slate-800">
                WASD / Arrows: Move · Space: Shoot · Shift: Dash · Esc: Pause · F5: Save
              </div>
              {lastSaveFeedback && (
                <div className="bg-emerald-950/90 text-emerald-300 border border-emerald-600 px-3 py-1.5 rounded shadow-lg animate-pulse">
                  ✓ {lastSaveFeedback}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Title Screen Overlay */}
        {mode === 'TITLE' && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
            {/* Inline SVG Title Lockup with 35% negative space */}
            <div className="mb-4">
              <svg width="340" height="70" viewBox="0 0 340 70" className="drop-shadow-lg">
                <defs>
                  <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <text
                  x="170"
                  y="36"
                  textAnchor="middle"
                  fill="url(#titleGrad)"
                  fontSize="28"
                  fontWeight="900"
                  fontFamily="system-ui, sans-serif"
                  letterSpacing="2"
                >
                  CYBERBLAST
                </text>
                <text
                  x="170"
                  y="58"
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="monospace"
                  letterSpacing="4"
                >
                  GALACTIC FURY · SANDBOX EMULATOR
                </text>
              </svg>
            </div>

            <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
              Real-time playable arcade testbed for Android save sync. Advance sectors, defeat the
              Titan Mech, collect Data Cores, and generate authentic binary `.sav` slots.
            </p>

            <button
              onClick={() => {
                setMode('PLAYING');
                sound.playClick();
              }}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm rounded-lg shadow-lg hover:shadow-sky-500/25 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter / Space to Start Mission</span>
            </button>

            <div className="mt-6 text-xs text-slate-400 font-mono">
              WASD Move · Space Shoot · Shift Dash · Esc Pause · F5 QuickSave
            </div>
          </div>
        )}

        {/* Paused Modal */}
        {mode === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">MISSION PAUSED</h2>
            <div className="text-xs text-slate-400 font-mono mb-6">
              Sector: {hudState.wave} · Score: {hudState.score} · Shield: {hudState.hp}%
            </div>

            <div className="flex flex-col gap-2.5 w-60">
              <button
                onClick={() => setMode('PLAYING')}
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded transition-colors"
              >
                Resume Game (Esc)
              </button>
              <button
                onClick={() => triggerSaveGame('Manual Save (Pause Menu)')}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded border border-slate-700 transition-colors"
              >
                Save Current Checkpoint
              </button>
              <button
                onClick={() => {
                  engineRef.current.player.hp = 100;
                  engineRef.current.player.score = 0;
                  engineRef.current.player.wave = 1;
                  setMode('PLAYING');
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded border border-slate-700 transition-colors"
              >
                Restart Mission
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full py-2 text-slate-400 hover:text-white text-xs transition-colors"
                >
                  Exit to Library Dashboard
                </button>
              )}
            </div>
          </div>
        )}

        {/* Game Over Modal */}
        {mode === 'GAMEOVER' && (
          <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-black text-red-400 mb-1 tracking-wider">HULL BREACHED</h2>
            <p className="text-xs text-slate-300 font-mono mb-6">
              Final Score: {hudState.score} · Reached Sector {hudState.wave}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  engineRef.current.player.hp = 100;
                  engineRef.current.player.score = 0;
                  engineRef.current.player.wave = 1;
                  setMode('PLAYING');
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded transition-colors"
              >
                Respawn from Checkpoint
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded transition-colors"
                >
                  Back to Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sub-bar below game when in embedded mode */}
      {!isFullscreen && (
        <div className="w-full max-w-[960px] bg-slate-900 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-200">Sandbox Emulator Engine</span>
            <span>·</span>
            <span>60 FPS Clamped Simulation</span>
            <span>·</span>
            <span className="tabular-nums">Live Saves: Auto-Synced</span>
          </div>
          {onExit && (
            <button
              onClick={onExit}
              className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Library</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
