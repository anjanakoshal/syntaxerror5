/**
 * MonsoonShield / JalRaksha - SOS Emergency & Distress Dispatch Controller
 * Manages one-tap distress broadcasts, priority triage, SMS/WhatsApp payload generation, and rescue tracking.
 */

class SOSManager {
  constructor() {
    this.currentFilter = 'all';
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderSOSList();
    this.updateStats();
  }

  setupEventListeners() {
    const sosForm = document.getElementById('sos-request-form');
    if (sosForm) {
      sosForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    const gpsBtn = document.getElementById('auto-gps-btn');
    if (gpsBtn) {
      gpsBtn.addEventListener('click', () => {
        this.detectLocation();
      });
    }
  }

  detectLocation() {
    const locInput = document.getElementById('sos-location-input');
    const coordsInput = document.getElementById('sos-coords-hidden');
    if (!locInput) return;

    locInput.value = 'Locating GPS satellites...';
    window.emergencyAudio.playUiBeep(1000, 0.1);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lng = pos.coords.longitude.toFixed(4);
          locInput.value = `Sector 7, Near River Basin (GPS: ${lat}° N, ${lng}° E)`;
          if (coordsInput) {
            coordsInput.value = JSON.stringify({ x: 350 + Math.random() * 80, y: 320 + Math.random() * 60 });
          }
          window.app.showToast('GPS Lock Acquired with high precision', 'success');
        },
        () => {
          // Fallback location
          locInput.value = 'Sector 4, Near High Ground School (19.0760° N, 72.8777° E)';
          if (coordsInput) {
            coordsInput.value = JSON.stringify({ x: 390, y: 310 });
          }
          window.app.showToast('GPS simulation fallback applied', 'warning');
        },
        { timeout: 5000 }
      );
    } else {
      locInput.value = 'Sector 4, Near High Ground School (19.0760° N, 72.8777° E)';
      if (coordsInput) {
        coordsInput.value = JSON.stringify({ x: 390, y: 310 });
      }
    }
  }

  handleFormSubmit() {
    const nameInput = document.getElementById('sos-name');
    const phoneInput = document.getElementById('sos-phone');
    const locationInput = document.getElementById('sos-location-input');
    const detailsInput = document.getElementById('sos-details');
    const typeRadio = document.querySelector('input[name="sos-type"]:checked');
    const headcountInput = document.getElementById('sos-headcount');

    if (!nameInput || !phoneInput || !typeRadio) return;

    const category = typeRadio.value;
    let priority = 'moderate';
    if (category === 'Rooftop Stranded' || category === 'Medical Emergency') {
      priority = 'critical';
    } else if (category === 'Drinking Water & Food' || category === 'Elderly / Children') {
      priority = 'high';
    }

    const coords = {
      x: 280 + Math.floor(Math.random() * 320),
      y: 200 + Math.floor(Math.random() * 220)
    };

    const newSOS = window.appStorage.addSOSRequest({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      category: category,
      headcount: headcountInput ? headcountInput.value : 1,
      priority: priority,
      locationText: locationInput ? locationInput.value.trim() : 'Unspecified Coordinates',
      details: detailsInput ? detailsInput.value.trim() : 'Urgent assistance requested.',
      coords: coords
    });

    window.emergencyAudio.playEmergencySiren();
    window.app.showToast(`🚨 Priority SOS Dispatched: ${newSOS.id}`, 'danger');

    // Reset Form
    nameInput.value = '';
    phoneInput.value = '';
    if (detailsInput) detailsInput.value = '';

    this.renderSOSList();
    this.updateStats();

    // Trigger dispatch modal with instant SMS/WhatsApp share links
    this.openDispatchModal(newSOS);
  }

  openDispatchModal(sos) {
    const modal = document.getElementById('dispatch-modal');
    const content = document.getElementById('dispatch-modal-content');
    if (!modal || !content) return;

    const shareText = encodeURIComponent(
      `🚨 [EMERGENCY FLOOD RESCUE] SOS #${sos.id}\nName: ${sos.name}\nPeople: ${sos.headcount || 1}\nCategory: ${sos.category}\nLocation: ${sos.locationText}\nDetails: ${sos.details}\nPhone: ${sos.phone}\nBroadcasted via Live RainWise.`
    );

    const waLink = `https://wa.me/?text=${shareText}`;
    const smsLink = `sms:112?body=${shareText}`;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 2.5rem; margin-bottom: 6px;">📢</div>
        <h3 style="color: var(--color-danger); font-size: 1.3rem;">SOS Request #${sos.id} Queued</h3>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Disaster Control Center & NDRF field units have been notified.</p>
      </div>

      <div class="card" style="margin-bottom: 16px; background: rgba(30, 41, 59, 0.6);">
        <div style="font-size: 0.88rem; line-height: 1.6;">
          <div><strong>Distress Level:</strong> <span class="badge-triage ${sos.priority}">${sos.priority.toUpperCase()}</span></div>
          <div><strong>Victim:</strong> ${sos.name} (${sos.headcount || 1} people)</div>
          <div><strong>Category:</strong> ${sos.category}</div>
          <div><strong>Location:</strong> ${sos.locationText}</div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        <a href="${waLink}" target="_blank" class="btn btn-success" style="width: 100%;">
          💬 Send to WhatsApp Emergency Groups
        </a>
        <a href="${smsLink}" class="btn btn-warning" style="width: 100%;">
          📱 Fallback Low-Bandwidth SMS (112)
        </a>
        <button class="btn btn-danger" onclick="window.emergencyAudio.startRescueBeacon()" style="width: 100%;">
          🚨 Turn On Night Strobe Beacon & Audio Siren
        </button>
        <button class="btn btn-secondary" onclick="window.sosManager.closeDispatchModal()" style="width: 100%;">
          Close Window
        </button>
      </div>
    `;

    modal.classList.add('active');
  }

  closeDispatchModal() {
    const modal = document.getElementById('dispatch-modal');
    if (modal) modal.classList.remove('active');
  }

  renderSOSList() {
    const container = document.getElementById('sos-list-container');
    if (!container) return;

    const allRequests = window.appStorage.getSOSRequests();
    let filtered = allRequests;

    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'pending') filtered = allRequests.filter(s => s.status === 'Pending Dispatch');
      else if (this.currentFilter === 'assigned') filtered = allRequests.filter(s => s.status === 'Assigned' || s.status === 'Dispatch En Route');
      else if (this.currentFilter === 'resolved') filtered = allRequests.filter(s => s.status === 'Resolved');
    }

    if (!filtered.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <div style="font-size: 2rem; margin-bottom: 8px;">✅</div>
          <div>No distress signals in this category.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(sos => `
      <div class="sos-card-item ${sos.priority}">
        <div class="sos-header">
          <div class="sos-victim-name">
            <span>🚨 ${sos.name}</span>
            <span class="badge-triage ${sos.priority}">${sos.priority}</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono);">${sos.id}</span>
        </div>
        <div class="sos-details">
          <div><strong>Category:</strong> ${sos.category}</div>
          <div><strong>Location:</strong> ${sos.locationText}</div>
          <div><strong>Phone:</strong> <a href="tel:${sos.phone}" style="color: var(--color-accent);">${sos.phone}</a></div>
          <div><strong>Status:</strong> <span style="color: #fff; font-weight: 700;">${sos.status}</span></div>
          ${sos.assignedBoat ? `<div><strong>Boat:</strong> 🚤 ${sos.assignedBoat}</div>` : ''}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); background: rgba(0,0,0,0.2); padding: 8px; border-radius: var(--radius-sm);">
          "${sos.details}"
        </div>
        <div class="sos-actions">
          ${sos.status !== 'Resolved' ? `
            <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.78rem;" onclick="window.sosManager.dispatchRescueToSOS('${sos.id}')">
              🚤 Dispatch Boat
            </button>
            <button class="btn btn-success" style="padding: 4px 10px; font-size: 0.78rem;" onclick="window.sosManager.markResolved('${sos.id}')">
              ✓ Mark Rescued
            </button>
          ` : `
            <span style="color: var(--color-success); font-size: 0.78rem; font-weight: 700;">✅ Evacuation Complete</span>
          `}
          <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.78rem; margin-left: auto;" onclick="window.sosManager.locateOnMap('${sos.id}')">
            🗺️ Locate Pin
          </button>
        </div>
      </div>
    `).join('');
  }

  dispatchRescueToSOS(sosId) {
    const boats = window.appStorage.getBoats().filter(b => b.status === 'available' || b.status === 'en-route');
    const assigned = boats.length ? boats[0].id : 'NDRF Quick Response 01';
    window.appStorage.updateSOSStatus(sosId, 'Dispatch En Route', assigned);
    this.renderSOSList();
    this.updateStats();
    window.app.showToast(`Boat ${assigned} assigned to SOS #${sosId}`, 'success');
  }

  markResolved(sosId) {
    window.appStorage.updateSOSStatus(sosId, 'Resolved');
    this.renderSOSList();
    this.updateStats();
    window.app.showToast(`SOS #${sosId} marked as safely rescued!`, 'success');
  }

  locateOnMap(sosId) {
    const sos = window.appStorage.getSOSRequests().find(s => s.id === sosId);
    if (!sos || !window.floodMap) return;

    window.app.switchTab('map-tab');
    window.floodMap.pan = {
      x: (window.floodMap.width / 2) - sos.coords.x * window.floodMap.scale,
      y: (window.floodMap.height / 2) - sos.coords.y * window.floodMap.scale
    };
    window.floodMap.renderDetailsPanel({ type: 'sos', data: sos });
  }

  setFilter(filter) {
    this.currentFilter = filter;
    document.querySelectorAll('.sos-filter-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.getElementById(`filter-${filter}`);
    if (targetBtn) targetBtn.classList.add('active');
    this.renderSOSList();
  }

  updateStats() {
    const list = window.appStorage.getSOSRequests();
    const activeCount = list.filter(s => s.status !== 'Resolved').length;
    const criticalCount = list.filter(s => s.priority === 'critical' && s.status !== 'Resolved').length;

    const elActive = document.getElementById('stat-active-sos');
    const elCritical = document.getElementById('stat-critical-sos');
    const badgeTab = document.getElementById('sos-badge-count');

    if (elActive) elActive.textContent = activeCount;
    if (elCritical) elCritical.textContent = criticalCount;
    if (badgeTab) badgeTab.textContent = activeCount;
  }
}

window.SOSManager = SOSManager;
