/**
 * MonsoonShield / JalRaksha - Offline Survival, First Aid & Missing Persons Registry
 * Essential crisis survival knowledge, community check-ins, and search bulletin.
 */

class SurvivalGuideManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupAccordions();
    this.renderMissingPersons();
    this.renderSafeCheckins();
    this.setupForms();
  }

  setupAccordions() {
    document.querySelectorAll('.protocol-header').forEach(header => {
      header.addEventListener('click', () => {
        const parent = header.parentElement;
        const wasOpen = parent.classList.contains('open');
        document.querySelectorAll('.protocol-accordion').forEach(a => a.classList.remove('open'));
        if (!wasOpen) {
          parent.classList.add('open');
          window.emergencyAudio.playUiBeep(1100, 0.05);
        }
      });
    });
  }

  setupForms() {
    // Missing person form
    const mpForm = document.getElementById('report-missing-form');
    if (mpForm) {
      mpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleMissingPersonSubmit();
      });
    }

    // Safe Check-in form
    const safeForm = document.getElementById('safe-checkin-form');
    if (safeForm) {
      safeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSafeCheckinSubmit();
      });
    }

    // Search filter
    const searchInput = document.getElementById('missing-person-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderMissingPersons(e.target.value);
      });
    }
  }

  handleMissingPersonSubmit() {
    const name = document.getElementById('mp-name')?.value.trim();
    const age = document.getElementById('mp-age')?.value;
    const gender = document.getElementById('mp-gender')?.value;
    const location = document.getElementById('mp-location')?.value.trim();
    const clothing = document.getElementById('mp-clothing')?.value.trim();
    const contact = document.getElementById('mp-contact')?.value.trim();

    if (!name || !location || !contact) return;

    const newPerson = window.appStorage.addMissingPerson({
      fullName: name,
      age: age || 'Unknown',
      gender: gender || 'Unspecified',
      lastSeenLocation: location,
      lastSeenTime: 'Just Reported',
      clothing: clothing || 'Not specified',
      contactPerson: contact
    });

    document.getElementById('report-missing-form').reset();
    this.renderMissingPersons();
    window.app.showToast(`Missing person report registered: ${newPerson.fullName} (${newPerson.id})`, 'success');
  }

  handleSafeCheckinSubmit() {
    const name = document.getElementById('sc-name')?.value.trim();
    const family = document.getElementById('sc-family')?.value;
    const shelter = document.getElementById('sc-shelter')?.value.trim();
    const msg = document.getElementById('sc-message')?.value.trim();

    if (!name) return;

    window.appStorage.addSafeCheckin({
      name: name,
      familyCount: family || 1,
      currentShelter: shelter || 'Safe at High Ground',
      message: msg || 'We have reached a safe place.'
    });

    document.getElementById('safe-checkin-form').reset();
    this.renderSafeCheckins();
    window.app.showToast(`Safety status recorded! Relatives can now search your name.`, 'success');
  }

  renderMissingPersons(searchQuery = '') {
    const container = document.getElementById('missing-persons-list');
    if (!container) return;

    const list = window.appStorage.getMissingPersons();
    const query = searchQuery.toLowerCase().trim();

    const filtered = query
      ? list.filter(p => p.fullName.toLowerCase().includes(query) || p.lastSeenLocation.toLowerCase().includes(query) || p.id.toLowerCase().includes(query))
      : list;

    if (!filtered.length) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: var(--text-dim);">
          No matching records found.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => `
      <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 14px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <div>
            <strong style="font-size: 1rem; color: #fff;">${p.fullName}</strong>
            <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 8px;">Age: ${p.age} | ${p.gender}</span>
          </div>
          <span class="badge-triage ${p.status === 'Found Safe' ? 'resolved' : 'critical'}">${p.status}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 4px;">
          <div>📍 <strong>Last Seen:</strong> ${p.lastSeenLocation} (${p.lastSeenTime})</div>
          <div>👕 <strong>Description:</strong> ${p.clothing}</div>
          <div>📞 <strong>Contact Kin:</strong> <span style="color: var(--color-accent); font-weight: 600;">${p.contactPerson}</span></div>
        </div>
      </div>
    `).join('');
  }

  renderSafeCheckins() {
    const container = document.getElementById('safe-checkins-list');
    if (!container) return;

    const list = window.appStorage.getSafeCheckins();

    container.innerHTML = list.map(sc => `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: var(--radius-md); padding: 12px; margin-bottom: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <strong style="color: var(--color-success); font-size: 0.92rem;">✅ ${sc.name} (${sc.familyCount} Person${sc.familyCount > 1 ? 's' : ''})</strong>
          <span style="font-size: 0.72rem; color: var(--text-dim); font-family: var(--font-mono);">${sc.safeTime}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-main);">📍 <strong>Location:</strong> ${sc.currentShelter}</div>
        <div style="font-size: 0.78rem; color: var(--text-muted); font-style: italic; margin-top: 4px;">"${sc.message}"</div>
      </div>
    `).join('');
  }
}

window.SurvivalGuideManager = SurvivalGuideManager;
