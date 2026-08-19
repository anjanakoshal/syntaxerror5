/**
 * MonsoonShield / JalRaksha - Audio Synthesizer & Rescue Strobe Beacon
 * Uses Web Audio API to create hardware-level emergency sirens & sound alerts
 */

class EmergencyAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isSirenPlaying = false;
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.sirenInterval = null;
    this.isStrobeActive = false;
    this.strobeInterval = null;
    this.isMuted = false;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play short interactive UI sound effects
  playUiBeep(freq = 880, duration = 0.08, type = 'sine') {
    if (this.isMuted) return;
    try {
      this.initContext();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio Beep Error:', e);
    }
  }

  playRadarPing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.4);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Radar Ping Error:', e);
    }
  }

  // Dual-frequency oscillating emergency siren (NDRF / Disaster alert style)
  toggleEmergencySiren() {
    if (this.isSirenPlaying) {
      this.stopEmergencySiren();
      return false;
    } else {
      this.startEmergencySiren();
      return true;
    }
  }

  startEmergencySiren() {
    this.initContext();
    if (this.isSirenPlaying) return;

    try {
      this.isSirenPlaying = true;
      const now = this.audioCtx.currentTime;

      this.sirenOscillator = this.audioCtx.createOscillator();
      this.sirenGain = this.audioCtx.createGain();

      this.sirenOscillator.type = 'sawtooth';
      this.sirenOscillator.frequency.setValueAtTime(650, now);

      this.sirenGain.gain.setValueAtTime(0.3, now);

      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);
      this.sirenOscillator.start(now);

      // Oscillate frequency between 500Hz and 950Hz
      let high = false;
      this.sirenInterval = setInterval(() => {
        if (!this.sirenOscillator || !this.audioCtx) return;
        const time = this.audioCtx.currentTime;
        const targetFreq = high ? 950 : 520;
        this.sirenOscillator.frequency.linearRampToValueAtTime(targetFreq, time + 0.55);
        high = !high;
      }, 600);

      // Update button UI if present
      const sirenBtn = document.getElementById('siren-toggle-btn');
      if (sirenBtn) {
        sirenBtn.classList.add('btn-danger', 'btn-sos-glow');
        sirenBtn.innerHTML = '📢 STOP SIREN';
      }
    } catch (e) {
      console.error('Siren Start Error:', e);
    }
  }

  stopEmergencySiren() {
    if (!this.isSirenPlaying) return;
    try {
      if (this.sirenInterval) {
        clearInterval(this.sirenInterval);
        this.sirenInterval = null;
      }
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      this.isSirenPlaying = false;

      const sirenBtn = document.getElementById('siren-toggle-btn');
      if (sirenBtn) {
        sirenBtn.classList.remove('btn-danger', 'btn-sos-glow');
        sirenBtn.classList.add('btn-secondary');
        sirenBtn.innerHTML = '📢 EMERGENCY SIREN';
      }
    } catch (e) {
      console.error('Siren Stop Error:', e);
    }
  }

  // High-Intensity Night-Rescue Strobe Screen Beacon
  startRescueBeacon() {
    this.isStrobeActive = true;
    const overlay = document.getElementById('beacon-overlay');
    if (!overlay) return;

    overlay.classList.add('active');
    this.startEmergencySiren();

    let toggle = false;
    this.strobeInterval = setInterval(() => {
      if (!this.isStrobeActive) return;
      if (toggle) {
        overlay.classList.remove('strobe-white');
        overlay.classList.add('strobe-red');
      } else {
        overlay.classList.remove('strobe-red');
        overlay.classList.add('strobe-white');
      }
      toggle = !toggle;
    }, 180);
  }

  stopRescueBeacon() {
    this.isStrobeActive = false;
    if (this.strobeInterval) {
      clearInterval(this.strobeInterval);
      this.strobeInterval = null;
    }
    const overlay = document.getElementById('beacon-overlay');
    if (overlay) {
      overlay.classList.remove('active', 'strobe-white', 'strobe-red');
    }
    this.stopEmergencySiren();
  }
}

window.emergencyAudio = new EmergencyAudioEngine();
