/**
 * Live RainWise / JalRaksha - Master Application Controller
 * Manages tab routing, high contrast theme, language switcher, toast engine, and live disaster simulation.
 */

class MonsoonApp {
  constructor() {
    this.currentTab = 'map-tab';
    this.isHighContrast = false;
    this.init();
  }

  init() {
    this.setupTabs();
    this.setupHeaderActions();
    this.setupLanguageSwitcher();
    this.startLiveClock();
    this.startSimulationEngine();
  }

  setupTabs() {
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
        window.emergencyAudio.playUiBeep(950, 0.04);
      });
    });
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll('.nav-tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    // Update Panes
    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });

    // If switching to map, trigger map resize
    if (tabId === 'map-tab' && window.floodMap) {
      setTimeout(() => window.floodMap.resize(), 50);
    }
  }

  setupLanguageSwitcher() {
    const selector = document.getElementById('language-select');
    if (selector) {
      selector.addEventListener('change', (e) => {
        if (window.i18n) {
          window.i18n.setLanguage(e.target.value);
        }
      });
    }
  }

  setupHeaderActions() {
    // High Contrast Toggle
    const hcBtn = document.getElementById('toggle-contrast-btn');
    if (hcBtn) {
      hcBtn.addEventListener('click', () => {
        this.isHighContrast = !this.isHighContrast;
        document.body.classList.toggle('high-contrast-mode', this.isHighContrast);
        hcBtn.innerHTML = this.isHighContrast ? '☀️ Normal Mode' : '⚡ 2G / High Contrast';
        this.showToast(this.isHighContrast ? 'Switched to Ultra-Low Bandwidth High Contrast Mode' : 'Switched to Standard Emergency HUD', 'info');
      });
    }

    // Audio Mute Toggle
    const muteBtn = document.getElementById('toggle-mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        window.emergencyAudio.isMuted = !window.emergencyAudio.isMuted;
        muteBtn.innerHTML = window.emergencyAudio.isMuted ? '🔇 Unmute' : '🔊 Audio ON';
      });
    }

    // Siren Toggle
    const sirenBtn = document.getElementById('siren-toggle-btn');
    if (sirenBtn) {
      sirenBtn.addEventListener('click', () => {
        window.emergencyAudio.toggleEmergencySiren();
      });
    }

    // Live Incident Simulation Trigger
    const simBtn = document.getElementById('trigger-simulation-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.triggerRandomIncident();
      });
    }
  }

  triggerRandomIncident() {
    const incidents = [
      () => {
        const newSos = window.appStorage.addSOSRequest({
          name: 'Pooja & Senior Citizens (Group of 6)',
          phone: '+91 98450 11223',
          pincode: '400070',
          category: 'Medical Emergency',
          headcount: 6,
          priority: 'critical',
          locationText: 'Sector 7 Creek Embankment - Temple steps (PIN 400070)',
          details: 'Water surged rapidly by 2 feet. Oxygen concentrator running on battery.',
          coords: { x: 230 + Math.random() * 60, y: 220 + Math.random() * 40 }
        });
        window.sosManager.renderSOSList();
        window.sosManager.updateStats();
        window.emergencyAudio.playEmergencySiren();
        this.showToast(`🚨 NEW CRITICAL SOS: #${newSos.id} at PIN 400070`, 'danger');
      },
      () => {
        const shelters = window.appStorage.getShelters();
        const randShelter = shelters[Math.floor(Math.random() * shelters.length)];
        window.appStorage.updateShelterOccupancy(randShelter.id, randShelter.capacityOccupied + 35);
        window.shelterManager.renderShelters();
        window.shelterManager.updateLogisticsMetrics();
        this.showToast(`⛺ Shelter Update: ${randShelter.name} received 35 evacuated citizens`, 'info');
      },
      () => {
        const boats = window.appStorage.getBoats();
        const randBoat = boats[Math.floor(Math.random() * boats.length)];
        randBoat.coords.x += (Math.random() - 0.5) * 40;
        randBoat.coords.y += (Math.random() - 0.5) * 40;
        window.emergencyAudio.playRadarPing();
        this.showToast(`🚤 Vessel ${randBoat.name} updated telemetry waypoint`, 'info');
      }
    ];

    const randomFn = incidents[Math.floor(Math.random() * incidents.length)];
    randomFn();
  }

  startSimulationEngine() {
    setInterval(() => {
      if (Math.random() > 0.6) {
        const boats = window.appStorage.getBoats();
        boats.forEach(b => {
          b.coords.x += (Math.random() - 0.5) * 1.5;
          b.coords.y += (Math.random() - 0.5) * 1.5;
        });
      }
    }, 3000);
  }

  startLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    const updateTime = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST';
    };
    setInterval(updateTime, 1000);
    updateTime();
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'danger') icon = '🚨';
    else if (type === 'success') icon = '✅';
    else if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
}

// Bootstrap once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MonsoonApp();
  window.floodMap = new window.FloodMapEngine('flood-map-canvas');
  window.sosManager = new window.SOSManager();
  window.shelterManager = new window.ShelterManager();
  window.telemetryEngine = new window.TelemetryEngine();
  window.survivalManager = new window.SurvivalGuideManager();
  if (window.i18n) window.i18n.init();
});
