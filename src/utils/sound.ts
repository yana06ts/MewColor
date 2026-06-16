// Procedural Audio Synthesizer using Web Audio API for rewarding offline feedback

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on user interaction to comply with browser policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Toggle sound
  public toggle(state?: boolean) {
    this.enabled = state !== undefined ? state : !this.enabled;
    return this.enabled;
  }

  // Play a soft cute pop sound with varying pitch based on selected coordinates or index
  public playPop(pitchMultiplier: number = 1.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Cute bubble synthesis
    osc.type = "sine";
    const startFreq = 260 * pitchMultiplier;
    const endFreq = 620 * pitchMultiplier;
    
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Play a rewarding chord when a color is finished
  public playSuccessColor() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Arpeggio C Major C4 -> E4 -> G4 -> C5
    const notes = [261.63, 329.63, 392.00, 523.25];
    const delay = 0.07;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * delay);

      const startTime = this.ctx!.currentTime + idx * delay;
      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Full level completion celebration chime
  public playCompleteLevel() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Happy retro scale
    const notes = [329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const delay = 0.09;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * delay);
      
      const startTime = this.ctx!.currentTime + idx * delay;
      gain.gain.setValueAtTime(0.0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Play a gentle meow sound procedurally synthesized!
  // Cat meow sweep: starts with nasal vibration, sweeps rapidly up, then slightly down with 'ow' formants
  public playMeow() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const time = this.ctx.currentTime;
    
    // Core fundamental frequency
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // Formant overtones
    const gainNode = this.ctx.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Feline formant characteristics: starts around 300Hz, sweeps to 850Hz, down to 600Hz
    osc1.type = "triangle";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(280, time);
    osc1.frequency.exponentialRampToValueAtTime(580, time + 0.08); // Meee-
    osc1.frequency.exponentialRampToValueAtTime(750, time + 0.22); // -ooo-
    osc1.frequency.linearRampToValueAtTime(450, time + 0.48);      // -www

    osc2.frequency.setValueAtTime(560, time);
    osc2.frequency.exponentialRampToValueAtTime(1160, time + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(1500, time + 0.22);
    osc2.frequency.linearRampToValueAtTime(900, time + 0.48);

    // Gain envelope: soft start ("m"), swelling up ("eeow"), and gentle release
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(0.08, time + 0.05); // m -> e
    gainNode.gain.linearRampToValueAtTime(0.12, time + 0.22); // peak sound
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.49); // fading tail

    // Start oscillators
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.5);
    osc2.stop(time + 0.5);
  }

  // Play a gentle buzz/err sound
  public playError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.15);
  }
}

export const SOUNDS = new SoundEngine();
export default SOUNDS;
