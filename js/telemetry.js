/**
 * MonsoonShield / JalRaksha - Early Warning Telemetry & IMD Meteorologist Desk
 * Real-time gauge rendering, IMD Synoptic bulletins, wind gust meters, rainfall intensity scales, and tidal surges.
 */

class TelemetryEngine {
  constructor() {
    this.rainfallData = [
      { hour: '00:00', mm: 12 },
      { hour: '02:00', mm: 18 },
      { hour: '04:00', mm: 35 },
      { hour: '06:00', mm: 68 },
      { hour: '08:00', mm: 95 },
      { hour: '10:00', mm: 142 },
      { hour: '12:00', mm: 185 },
      { hour: '14:00', mm: 210 }
    ];

    this.gauges = {
      mithiRiver: { name: 'Mithi River Gauge #4', currentM: 4.85, dangerM: 4.20, warningM: 3.50, status: 'Danger' },
      ulhasRiver: { name: 'Ulhas Basin Gauge #2', currentM: 6.10, dangerM: 6.80, warningM: 5.50, status: 'Warning' },
      powaiLake: { name: 'Powai Spillway Discharge', currentM: 2.30, dangerM: 2.10, warningM: 1.80, status: 'Overflowing' },
      windGauge: { currentKmh: 68, maxKmh: 120, dangerKmh: 75, status: 'Squally Winds' }
    };

    this.init();
  }

  init() {
    this.renderGauges();
    this.renderRainfallChart();
    this.renderTidalSchedule();
    this.renderIMDBulletins();
  }

  renderGauges() {
    this.drawRadialGauge('gauge-mithi', this.gauges.mithiRiver.currentM, 6.0, this.gauges.mithiRiver.dangerM, 'M');
    this.drawRadialGauge('gauge-ulhas', this.gauges.ulhasRiver.currentM, 8.0, this.gauges.ulhasRiver.dangerM, 'M');
    this.drawRadialGauge('gauge-powai', this.gauges.powaiLake.currentM, 3.0, this.gauges.powaiLake.dangerM, 'M');
    this.drawRadialGauge('gauge-wind', this.gauges.windGauge.currentKmh, this.gauges.windGauge.maxKmh, this.gauges.windGauge.dangerKmh, 'KM/H');
  }

  drawRadialGauge(canvasId, value, max, dangerThreshold, unit) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 160;
    const h = canvas.height = 130;
    const cx = w / 2;
    const cy = h - 20;
    const radius = 55;

    ctx.clearRect(0, 0, w, h);

    // Background track
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.8, Math.PI * 2.2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value percentage
    const pct = Math.min(1, Math.max(0, value / max));
    const startAngle = Math.PI * 0.8;
    const endAngle = startAngle + pct * (Math.PI * 1.4);

    const isDanger = value >= dangerThreshold;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = isDanger ? '#ef4444' : (value >= dangerThreshold * 0.8 ? '#f59e0b' : '#06b6d4');
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value Text
    ctx.fillStyle = isDanger ? '#ef4444' : '#ffffff';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${value.toFixed(value > 10 ? 0 : 2)}${unit}`, cx, cy - 12);

    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(`Alert: ${dangerThreshold}${unit}`, cx, cy + 8);
  }

  renderRainfallChart() {
    const canvas = document.getElementById('rainfall-chart-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = canvas.width = rect.width || 600;
    const h = canvas.height = 200;

    ctx.clearRect(0, 0, w, h);

    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const maxMm = 250;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let mm = 50; mm <= maxMm; mm += 50) {
      const y = padding.top + chartH - (mm / maxMm) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${mm}mm`, padding.left - 8, y + 3);
    }

    // Critical Red Line (150mm)
    const dangerY = padding.top + chartH - (150 / maxMm) * chartH;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, dangerY);
    ctx.lineTo(w - padding.right, dangerY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f87171';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('CRITICAL FLOOD THRESHOLD (150mm)', padding.left + 10, dangerY - 6);

    // Bar chart with gradient
    const barWidth = chartW / this.rainfallData.length - 16;
    this.rainfallData.forEach((item, index) => {
      const x = padding.left + index * (chartW / this.rainfallData.length) + 8;
      const barHeight = (item.mm / maxMm) * chartH;
      const y = padding.top + chartH - barHeight;

      const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
      if (item.mm >= 150) {
        grad.addColorStop(0, '#ef4444');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0.2)');
      } else {
        grad.addColorStop(0, '#0284c7');
        grad.addColorStop(1, 'rgba(2, 132, 199, 0.2)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Top value
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.mm}`, x + barWidth / 2, y - 4);

      // X label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter, sans-serif';
      ctx.fillText(item.hour, x + barWidth / 2, h - padding.bottom + 18);
    });
  }

  renderTidalSchedule() {
    const container = document.getElementById('tidal-schedule-container');
    if (!container) return;

    const tides = [
      { time: '04:15 AM', height: '4.87m (High Surge)', type: 'High Tide', alert: true },
      { time: '10:30 AM', height: '1.20m', type: 'Low Tide', alert: false },
      { time: '04:45 PM', height: '5.12m (Severe Peak)', type: 'High Tide', alert: true },
      { time: '11:10 PM', height: '0.95m', type: 'Low Tide', alert: false }
    ];

    container.innerHTML = tides.map(t => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(30, 41, 59, 0.4); border-radius: var(--radius-sm); border: 1px solid ${t.alert ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'};">
        <div>
          <strong style="color: ${t.alert ? 'var(--color-danger)' : '#fff'}; font-size: 0.85rem;">${t.time}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 6px;">[${t.type}]</span>
        </div>
        <div style="font-family: var(--font-mono); font-weight: 700; font-size: 0.85rem; color: ${t.alert ? '#fca5a5' : 'var(--color-accent)'};">
          ${t.height}
        </div>
      </div>
    `).join('');
  }

  renderIMDBulletins() {
    const container = document.getElementById('imd-bulletins-container');
    if (!container) return;

    const advisories = window.appStorage.getIMDAdvisories();
    container.innerHTML = advisories.map(adv => `
      <div class="card" style="margin-bottom: 12px; border-color: ${adv.severity === 'Red Alert' ? 'var(--color-danger)' : 'var(--color-warning)'};">
        <div class="card-header" style="padding-bottom: 8px; margin-bottom: 8px;">
          <div>
            <strong style="color: #fff; font-size: 0.95rem;">${adv.title}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${adv.source} • ${adv.issuedTime}</div>
          </div>
          <span class="badge-triage ${adv.severity === 'Red Alert' ? 'critical' : 'high'}">${adv.severity}</span>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-main); display: flex; flex-direction: column; gap: 6px;">
          <div>🌧️ <strong>Precipitation:</strong> ${adv.rainfallForecast}</div>
          <div>💨 <strong>Wind Forecast:</strong> ${adv.windForecast}</div>
          <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: var(--radius-sm); border-left: 3px solid var(--color-danger); color: #fca5a5;">
            <strong>⚠️ IMD Action Directive:</strong> ${adv.advisoryAction}
          </div>
        </div>
      </div>
    `).join('');
  }
}

window.TelemetryEngine = TelemetryEngine;
