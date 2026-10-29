// Procedural Web Audio API sound synthesizer - zero external asset dependencies
// Includes authentic PlayStation 5 ambient backsound generator and UI click sound effects

class SoundController {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  // PS5 Ambient Backsound state
  public isAmbientPlaying: boolean = false;
  private ambientGainNode: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientLfo: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientIntervalId: any = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isAmbientPlaying) {
      this.stopAmbientMusic();
    }
    return this.isMuted;
  }

  // ==========================================
  // PLAYSTATION 5 AMBIENT BACKSOUND SYNTHESIZER
  // ==========================================
  // Generates the serene, ethereal, swelling atmospheric PS5 ambient pad

  public startAmbientMusic() {
    if (this.isMuted || this.isAmbientPlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      this.isAmbientPlaying = true;
      const t = this.ctx.currentTime;

      // Master ambient gain node
      this.ambientGainNode = this.ctx.createGain();
      this.ambientGainNode.gain.setValueAtTime(0.001, t);
      // Gentle fade in over 2.5 seconds
      this.ambientGainNode.gain.linearRampToValueAtTime(0.09, t + 2.5);

      // Low-pass filter for velvety console warmth
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(520, t);
      this.ambientFilter.Q.setValueAtTime(1.8, t);

      // LFO filter sweep (0.08 Hz slow breathing cycle)
      this.ambientLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.ambientLfo.type = 'sine';
      this.ambientLfo.frequency.setValueAtTime(0.08, t);
      lfoGain.gain.setValueAtTime(240, t);

      this.ambientLfo.connect(lfoGain);
      lfoGain.connect(this.ambientFilter.frequency);
      this.ambientLfo.start(t);

      // PS5 Ambient Chord: Dmaj9 / Bm11 ethereal voicings
      // D2 (73.4), A2 (110.0), F#3 (185.0), C#4 (277.2), E4 (329.6), A4 (440.0)
      const baseFreqs = [73.42, 110.0, 185.0, 277.18, 329.63, 440.0];
      this.ambientOscillators = [];

      baseFreqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();

        // Alternating triangle and sine for soft oceanic texture
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        // Subtle micro-detuning (+/- 1.5 to 3 cents) for rich analog chorusing
        const detuneCents = (idx % 2 === 0 ? 1 : -1) * (1.5 + idx * 0.8);
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detuneCents, t);

        // Lower gain for higher shimmer notes
        const noteGain = 0.05 / (1 + idx * 0.25);
        oscGain.gain.setValueAtTime(noteGain, t);

        osc.connect(oscGain);
        oscGain.connect(this.ambientFilter!);
        osc.start(t);

        this.ambientOscillators.push(osc);
      });

      this.ambientFilter.connect(this.ambientGainNode);
      this.ambientGainNode.connect(this.ctx.destination);

      // Generative chord progression shifting every 8 seconds
      // Cycles gently between Dmaj9 (warm triumphant) and Gmaj7 (serene resting)
      let chordStep = 0;
      const chords = [
        [73.42, 110.0, 185.0, 277.18, 329.63], // Dmaj9
        [98.0, 146.83, 196.0, 293.66, 369.99], // Gmaj7
        [61.74, 123.47, 164.81, 246.94, 329.63], // Bm7
        [87.31, 130.81, 174.61, 261.63, 349.23], // Fmaj7
      ];

      this.ambientIntervalId = setInterval(() => {
        if (!this.ctx || !this.isAmbientPlaying || this.ambientOscillators.length === 0) return;
        chordStep = (chordStep + 1) % chords.length;
        const currentChord = chords[chordStep];
        const now = this.ctx.currentTime;

        this.ambientOscillators.forEach((osc, i) => {
          if (currentChord[i]) {
            osc.frequency.exponentialRampToValueAtTime(currentChord[i], now + 4.0);
          }
        });
      }, 8000);
    } catch (e) {
      console.error('PS5 Ambient synth failed:', e);
      this.isAmbientPlaying = false;
    }
  }

  public stopAmbientMusic() {
    if (!this.isAmbientPlaying) return;
    this.isAmbientPlaying = false;

    if (this.ambientIntervalId) {
      clearInterval(this.ambientIntervalId);
      this.ambientIntervalId = null;
    }

    if (this.ctx && this.ambientGainNode) {
      try {
        const t = this.ctx.currentTime;
        this.ambientGainNode.gain.cancelScheduledValues(t);
        this.ambientGainNode.gain.setValueAtTime(this.ambientGainNode.gain.value, t);
        this.ambientGainNode.gain.linearRampToValueAtTime(0.0001, t + 1.2);

        setTimeout(() => {
          this.ambientOscillators.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch (err) {}
          });
          if (this.ambientLfo) {
            try {
              this.ambientLfo.stop();
              this.ambientLfo.disconnect();
            } catch (err) {}
          }
          this.ambientOscillators = [];
          this.ambientLfo = null;
          this.ambientFilter = null;
          this.ambientGainNode = null;
        }, 1300);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public toggleAmbientMusic(): boolean {
    if (this.isAmbientPlaying) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }

  // ==========================================
  // PLAYSTATION 5 UI CLICK & NAVIGATION SOUNDS
  // ==========================================

  // Signature PS5 UI Click / Button Press (crisp, elegant glass ping)
  public playPS5Click() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // High frequency crystal ping
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1480, t);
    osc1.frequency.exponentialRampToValueAtTime(740, t + 0.05);

    // Warm resonant body
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, t); // D5
    osc2.frequency.exponentialRampToValueAtTime(293.66, t + 0.07);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.07);
    osc2.stop(t + 0.07);
  }

  // PS5 UI Navigation Focus Tick (soft glassy blip)
  public playPS5Focus() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(580, t);
    osc.frequency.exponentialRampToValueAtTime(920, t + 0.035);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // PS5 UI Confirm (resonant PlayStation chord chime)
  public playPS5Confirm() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(587.33, t); // D5
    osc1.frequency.exponentialRampToValueAtTime(1174.66, t + 0.16); // D6

    osc2.frequency.setValueAtTime(880, t); // A5

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.24);
    osc2.stop(t + 0.24);
  }

  // PS5 UI Back / Cancel
  public playPS5Back() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.09);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // PS5 Control Center Open
  public playPS5ControlCenter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(392, t); // G4
    osc.frequency.setValueAtTime(587.33, t + 0.08); // D5
    osc.frequency.setValueAtTime(880, t + 0.16); // A5

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  // ==========================================
  // GAMEPLAY SOUNDS (Cyberblast Live Runner)
  // ==========================================

  public playLaser() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(30, t + 0.28);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playSaveChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      const startT = t + idx * 0.06;
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.18, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startT);
      osc.stop(startT + 0.25);
    });
  }

  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.14);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playDash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playClick() {
    this.playPS5Click();
  }
}

export const sound = new SoundController();
