/**
 * MonsoonShield / JalRaksha - Shelter & Relief Logistics Controller
 * Manages relief camps, bed capacity, food/medical inventory, and volunteer task force.
 */

class ShelterManager {
  constructor() {
    this.volunteerTasks = [
      { id: 'VT-01', role: 'Motorboat Rescue Operator', location: 'Mithi Basin Boat Depot', urgency: 'Immediate', volunteersNeeded: 8, registered: 5 },
      { id: 'VT-02', role: 'Emergency Medical Officer / Nurse', location: 'St. Mary High School Camp', urgency: 'Immediate', volunteersNeeded: 6, registered: 4 },
      { id: 'VT-03', role: 'Dry Ration Packing & Airdrop Loading', location: 'Central Sports Complex Hub', urgency: 'High', volunteersNeeded: 25, registered: 19 },
      { id: 'VT-04', role: 'River Bund Sandbagging Crew', location: 'Sector 7 Creek Embankment', urgency: 'Urgent', volunteersNeeded: 40, registered: 32 }
    ];
    this.init();
  }

  init() {
    this.renderShelters();
    this.renderVolunteerTasks();
    this.updateLogisticsMetrics();
  }

  renderShelters() {
    const container = document.getElementById('shelter-cards-grid');
    if (!container) return;

    const shelters = window.appStorage.getShelters();
    container.innerHTML = shelters.map(sh => {
      const pct = Math.round((sh.capacityOccupied / sh.capacityTotal) * 100);
      let statusColor = 'var(--color-success)';
      if (pct > 90) statusColor = 'var(--color-danger)';
      else if (pct > 75) statusColor = 'var(--color-warning)';

      return `
        <div class="card" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="card-header" style="margin-bottom: 0;">
            <div>
              <span class="card-title">⛺ ${sh.name}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">${sh.sector}</span>
            </div>
            <span class="badge-triage ${sh.status === 'Open' ? 'resolved' : 'high'}">${sh.status}</span>
          </div>

          <!-- Capacity Bar -->
          <div class="capacity-bar-wrapper">
            <div class="capacity-bar-labels">
              <span>Occupancy: <strong>${sh.capacityOccupied} / ${sh.capacityTotal}</strong></span>
              <span style="color: ${statusColor}; font-weight: 700;">${pct}%</span>
            </div>
            <div class="capacity-bar-track">
              <div class="capacity-bar-fill ${pct > 90 ? 'danger' : (pct > 75 ? 'warning' : '')}" style="width: ${pct}%;"></div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem; background: rgba(0,0,0,0.2); padding: 10px; border-radius: var(--radius-sm);">
            <div>🛏️ <strong>Beds Free:</strong> ${sh.bedsAvailable}</div>
            <div>💧 <strong>Water:</strong> ${sh.waterPurificationLpd.toLocaleString()} L/day</div>
            <div>⚡ <strong>Gen Backup:</strong> ${sh.generatorFuelHours} hrs</div>
            <div>🍲 <strong>Rations:</strong> ${sh.foodPackets} pkts</div>
          </div>

          <div style="font-size: 0.8rem; color: var(--text-muted);">
            👨‍⚕️ <strong>Medical Staff:</strong> ${sh.medicalTeam}
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 8px; margin-top: auto;">
            <button class="btn btn-secondary" style="flex: 1; font-size: 0.78rem;" onclick="window.shelterManager.openSupplyModal('${sh.id}')">
              📦 Request Supplies
            </button>
            <button class="btn btn-primary" style="flex: 1; font-size: 0.78rem;" onclick="window.floodMap.setDestination('${sh.id}')">
              🧭 Evacuate Here
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderVolunteerTasks() {
    const container = document.getElementById('volunteer-tasks-container');
    if (!container) return;

    container.innerHTML = this.volunteerTasks.map(task => `
      <div style="background: rgba(30, 41, 59, 0.4); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="font-weight: 700; font-size: 0.9rem; color: #fff; display: flex; align-items: center; gap: 6px;">
            <span>🤝 ${task.role}</span>
            <span class="badge-triage critical" style="font-size: 0.65rem;">${task.urgency}</span>
          </div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">📍 ${task.location}</div>
          <div style="font-size: 0.75rem; color: var(--color-accent);">Slots: ${task.registered} / ${task.volunteersNeeded} Registered</div>
        </div>
        <button class="btn btn-success" style="font-size: 0.78rem; padding: 6px 12px;" onclick="window.shelterManager.registerVolunteer('${task.id}')">
          ✋ Enlist
        </button>
      </div>
    `).join('');
  }

  registerVolunteer(taskId) {
    const task = this.volunteerTasks.find(t => t.id === taskId);
    if (task) {
      if (task.registered < task.volunteersNeeded) {
        task.registered++;
        this.renderVolunteerTasks();
        window.app.showToast(`You have enlisted for: ${task.role}! Reporting details sent.`, 'success');
      } else {
        window.app.showToast('This task squad has reached maximum capacity.', 'info');
      }
    }
  }

  openSupplyModal(shelterId) {
    const shelter = window.appStorage.getShelters().find(s => s.id === shelterId);
    if (!shelter) return;

    const modal = document.getElementById('dispatch-modal');
    const content = document.getElementById('dispatch-modal-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="color: var(--color-accent); font-size: 1.2rem; margin-bottom: 4px;">📦 Requisition Relief Supplies</h3>
        <p style="font-size: 0.82rem; color: var(--text-muted);">Target Camp: <strong>${shelter.name}</strong></p>
      </div>

      <form onsubmit="event.preventDefault(); window.shelterManager.submitSupplyRequest('${shelter.id}');">
        <div class="form-group">
          <label class="form-label">Supply Category</label>
          <select id="req-supply-category" class="form-select">
            <option value="Drinking Water & Chlorine Tablets">💧 Drinking Water Tanks (5000L) & Chlorine</option>
            <option value="Dry Ration Food Packets">🍲 Ready-to-Eat Food Packets (x500)</option>
            <option value="Anti-Snake Venom & Emergency Medical Kits">💉 Anti-Snake Venom & ORS Kits</option>
            <option value="Generator Fuel (Diesel)">⚡ Diesel Fuel (200 Litres)</option>
            <option value="Blankets & Dry Clothes">🛏️ Blankets & Tarpaulin Sheets (x200)</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Urgency Level</label>
          <select id="req-supply-urgency" class="form-select">
            <option value="Immediate (< 2 Hours)">🔴 Immediate Airdrop / Boat (< 2 Hours)</option>
            <option value="Standard (< 6 Hours)">🟡 Standard Logistics (< 6 Hours)</option>
          </select>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Submit Requisition</button>
          <button type="button" class="btn btn-secondary" onclick="window.sosManager.closeDispatchModal()">Cancel</button>
        </div>
      </form>
    `;

    modal.classList.add('active');
  }

  submitSupplyRequest(shelterId) {
    const shelter = window.appStorage.getShelters().find(s => s.id === shelterId);
    const category = document.getElementById('req-supply-category')?.value;
    window.sosManager.closeDispatchModal();
    window.app.showToast(`Supply dispatch queued for ${shelter ? shelter.name : 'camp'}: ${category}`, 'success');
  }

  updateLogisticsMetrics() {
    const shelters = window.appStorage.getShelters();
    const totalCap = shelters.reduce((acc, s) => acc + s.capacityTotal, 0);
    const totalOccupied = shelters.reduce((acc, s) => acc + s.capacityOccupied, 0);
    const totalBeds = shelters.reduce((acc, s) => acc + s.bedsAvailable, 0);
    const totalFood = shelters.reduce((acc, s) => acc + s.foodPackets, 0);

    const elTotalCap = document.getElementById('metric-total-shelters-cap');
    const elAvailableBeds = document.getElementById('metric-available-beds');
    const elFoodSupply = document.getElementById('metric-food-supply');

    if (elTotalCap) elTotalCap.textContent = `${totalOccupied} / ${totalCap}`;
    if (elAvailableBeds) elAvailableBeds.textContent = totalBeds;
    if (elFoodSupply) elFoodSupply.textContent = `${totalFood.toLocaleString()} pkts`;
  }
}

window.ShelterManager = ShelterManager;
