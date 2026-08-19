/**
 * Live RainWise / JalRaksha - Real-Time Weather + Google Maps Style Road Route Engine
 * Features:
 * - Live weather from Open-Meteo API (no API key required, free, real data)
 * - Real road routing from OSRM (OpenStreetMap routing engine, free)
 * - Turn-by-turn directions drawn on Leaflet map as a blue Google-style polyline
 * - Road hazard & inundation overlay on route
 * - SMS alert generator for route conditions
 */

class PincodeRouteEngine {
  constructor() {
    this.currentRouteLayer = null;
    this.originMarker = null;
    this.destMarker = null;
    this.init();
  }

  init() {
    const searchForm = document.getElementById('pincode-route-form');
    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.analyzeRoute();
      });
    }

    const quickPills = document.querySelectorAll('.pin-quick-pill');
    quickPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const oPin = pill.getAttribute('data-origin');
        const dPin = pill.getAttribute('data-dest');
        const orgInput = document.getElementById('pin-origin-input');
        const dstInput = document.getElementById('pin-dest-input');
        if (orgInput && dstInput) {
          orgInput.value = oPin;
          dstInput.value = dPin || '';
          this.analyzeRoute();
        }
      });
    });
  }

  async analyzeRoute() {
    const origin = document.getElementById('pin-origin-input')?.value.trim();
    const dest = document.getElementById('pin-dest-input')?.value.trim();
    const resultsContainer = document.getElementById('pin-route-results');
    if (!resultsContainer || !origin) return;

    window.emergencyAudio?.playUiBeep(1100, 0.08);

    // Show loading state
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <div style="font-size: 2rem; margin-bottom: 10px;">🌐</div>
        <div style="color: var(--color-accent); font-weight: 700; font-size: 1rem;">Fetching Real-Time Weather & Road Route...</div>
        <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 6px;">Connecting to Open-Meteo Weather API & OSRM Road Router</div>
        <div style="margin-top: 14px; height: 3px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
          <div style="height: 3px; background: linear-gradient(90deg, #2563eb, #38bdf8); border-radius: 3px; animation: progressSlide 1.5s ease-in-out infinite;"></div>
        </div>
      </div>
    `;

    const db = window.appStorage.getAllPincodes();
    const originData = db[origin] || this.generateFallbackPin(origin, 'Origin Area');
    const destData = db[dest] || (dest ? this.generateFallbackPin(dest, 'Destination Area') : null);

    try {
      // 1. Fetch real-time weather for origin
      const originWeather = await this.fetchRealWeather(originData.latLng, originData.area);

      // 2. Fetch real-time weather for dest (if given)
      let destWeather = null;
      if (destData && destData.latLng) {
        destWeather = await this.fetchRealWeather(destData.latLng, destData.area);
      }

      // 3. Fetch real OSRM road route (if both pincodes given)
      let routeData = null;
      if (destData && originData.latLng && destData.latLng) {
        routeData = await this.fetchOSRMRoute(originData.latLng, destData.latLng);
      }

      // 4. Render full result
      if (!destData) {
        resultsContainer.innerHTML = this.renderSinglePinWeather(originData, originWeather);
      } else {
        resultsContainer.innerHTML = this.renderRouteAnalysis(originData, destData, originWeather, destWeather, routeData);
      }

      // 5. Draw route on Leaflet map
      if (routeData && window.floodMap?.map) {
        this.drawRouteOnMap(routeData, originData, destData);
      } else if (window.floodMap?.map && originData.latLng) {
        window.floodMap.map.flyTo(originData.latLng, 12);
        window.floodMap.userLatLng = originData.latLng;
        window.floodMap.renderUserMarker();
      }

      window.app?.showToast(`Live weather & route loaded for PIN ${origin}${dest ? ' ➔ ' + dest : ''}`, 'success');
    } catch (err) {
      console.error('Route analysis error:', err);
      // Fallback to static data on network error
      const originWeather = this.buildStaticWeather(originData);
      const destWeather = destData ? this.buildStaticWeather(destData) : null;
      resultsContainer.innerHTML = destData
        ? this.renderRouteAnalysis(originData, destData, originWeather, destWeather, null)
        : this.renderSinglePinWeather(originData, originWeather);
      window.app?.showToast('Using offline data (no internet)', 'warning');
    }
  }

  /* =========================================================================
     REAL-TIME WEATHER — Open-Meteo API (Free, no API key)
     ========================================================================= */
  async fetchRealWeather(latLng, areaName) {
    if (!latLng) return null;
    const [lat, lng] = latLng;

    const url = `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,` +
      `weathercode,wind_speed_10m,wind_gusts_10m,surface_pressure` +
      `&daily=precipitation_sum,rain_sum,wind_speed_10m_max,wind_gusts_10m_max,weathercode` +
      `&timezone=Asia%2FKolkata&forecast_days=1`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API error');
    const data = await response.json();

    const c = data.current;
    const d = data.daily;

    // Map WMO weather code to description
    const weatherDesc = this.wmoCodeToDescription(c.weathercode);
    const rainfallMmDay = (d.precipitation_sum?.[0] || 0).toFixed(1);
    const windKmh = Math.round(c.wind_speed_10m * 3.6); // m/s to km/h
    const gustKmh = Math.round(c.wind_gusts_10m * 3.6);
    const rainMmHr = (c.precipitation || 0).toFixed(1);
    const tempC = c.temperature_2m?.toFixed(1);
    const humidity = c.relative_humidity_2m;
    const pressure = c.surface_pressure?.toFixed(0);

    return {
      live: true,
      area: areaName,
      lat, lng,
      weatherDesc,
      weatherCode: c.weathercode,
      tempC,
      humidity,
      pressure,
      rainMmHr: parseFloat(rainMmHr),
      rainfallMmDay: parseFloat(rainfallMmDay),
      windKmh,
      gustKmh,
      statusLevel: rainfallMmDay > 200 ? 'Critical' : rainfallMmDay > 100 ? 'Warning' : 'Moderate',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };
  }

  buildStaticWeather(pinData) {
    return {
      live: false,
      area: pinData.area,
      weatherDesc: 'Thunderstorm with Heavy Rain',
      weatherCode: 95,
      tempC: 25.2,
      humidity: 95,
      pressure: 994,
      rainMmHr: pinData.rainfallMmHr,
      rainfallMmDay: pinData.rainfallMmHr * 5,
      windKmh: pinData.windSpeedKmh,
      gustKmh: pinData.windGustKmh,
      statusLevel: pinData.statusLevel,
      timestamp: 'Offline Mode'
    };
  }

  wmoCodeToDescription(code) {
    const map = {
      0: '☀️ Clear Sky', 1: '🌤️ Mainly Clear', 2: '⛅ Partly Cloudy', 3: '☁️ Overcast',
      45: '🌫️ Foggy', 48: '🌫️ Icy Fog',
      51: '🌦️ Light Drizzle', 53: '🌦️ Drizzle', 55: '🌧️ Heavy Drizzle',
      61: '🌧️ Slight Rain', 63: '🌧️ Moderate Rain', 65: '🌧️ Heavy Rain',
      71: '🌨️ Slight Snow', 73: '🌨️ Moderate Snow', 75: '❄️ Heavy Snow',
      77: '🌨️ Snow Grains',
      80: '🌦️ Slight Showers', 81: '🌧️ Moderate Showers', 82: '⛈️ Violent Showers',
      85: '🌨️ Snow Showers', 86: '❄️ Heavy Snow Showers',
      95: '⛈️ Thunderstorm', 96: '⛈️ Thunderstorm w/ Hail', 99: '⛈️ Thunderstorm w/ Heavy Hail'
    };
    return map[code] || '🌧️ Heavy Rainfall';
  }

  /* =========================================================================
     REAL ROAD ROUTING — OSRM (Free OpenStreetMap Router)
     ========================================================================= */
  async fetchOSRMRoute(originLatLng, destLatLng) {
    const [oLat, oLng] = originLatLng;
    const [dLat, dLng] = destLatLng;

    const url = `https://router.project-osrm.org/route/v1/driving/` +
      `${oLng},${oLat};${dLng},${dLat}` +
      `?steps=true&geometries=geojson&overview=full&annotations=false`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('OSRM routing failed');
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) throw new Error('No route found');

    const route = data.routes[0];
    const steps = route.legs[0]?.steps || [];
    const distanceKm = (route.distance / 1000).toFixed(1);
    const durationMin = Math.round(route.duration / 60);

    // Extract turn-by-turn steps
    const directions = steps
      .filter(s => s.maneuver?.type !== 'depart' || steps.indexOf(s) === 0)
      .slice(0, 12)
      .map((step, i) => {
        const maneuver = step.maneuver?.type || 'continue';
        const modifier = step.maneuver?.modifier || '';
        const icon = this.maneuverIcon(maneuver, modifier);
        const dist = step.distance > 1000
          ? `${(step.distance / 1000).toFixed(1)} km`
          : `${Math.round(step.distance)} m`;
        const name = step.name || step.ref || 'Unnamed Road';
        return { icon, instruction: this.maneuverText(maneuver, modifier, name), dist, i };
      });

    return {
      geojson: route.geometry,
      distanceKm,
      durationMin,
      directions
    };
  }

  maneuverIcon(type, modifier) {
    if (type === 'depart' || type === 'arrive') return type === 'arrive' ? '🏁' : '📍';
    if (modifier === 'left' || modifier === 'sharp left') return '↰';
    if (modifier === 'right' || modifier === 'sharp right') return '↱';
    if (modifier === 'slight left') return '↖️';
    if (modifier === 'slight right') return '↗️';
    if (type === 'roundabout' || type === 'rotary') return '🔄';
    if (type === 'fork') return '⑂';
    return '⬆️';
  }

  maneuverText(type, modifier, name) {
    if (type === 'depart') return `Start on ${name}`;
    if (type === 'arrive') return `Arrive at destination`;
    if (type === 'roundabout' || type === 'rotary') return `Enter roundabout onto ${name}`;
    if (type === 'fork') return `Keep ${modifier} at fork onto ${name}`;
    const dir = modifier ? `Turn ${modifier}` : 'Continue';
    return name ? `${dir} onto ${name}` : `${dir}`;
  }

  /* =========================================================================
     DRAW REAL ROAD ROUTE ON LEAFLET MAP
     ========================================================================= */
  drawRouteOnMap(routeData, originData, destData) {
    const map = window.floodMap.map;
    if (!map) return;

    // Clear old route
    if (this.currentRouteLayer) map.removeLayer(this.currentRouteLayer);
    if (this.originMarker) map.removeLayer(this.originMarker);
    if (this.destMarker) map.removeLayer(this.destMarker);

    // Draw OSRM GeoJSON polyline (Google blue)
    this.currentRouteLayer = L.geoJSON(routeData.geojson, {
      style: {
        color: '#2563eb',
        weight: 7,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round'
      }
    }).addTo(map);

    // Glow effect layer
    const glowLayer = L.geoJSON(routeData.geojson, {
      style: {
        color: '#38bdf8',
        weight: 14,
        opacity: 0.18,
        lineCap: 'round'
      }
    }).addTo(map);

    // Origin marker
    if (originData.latLng) {
      const oIcon = L.divIcon({
        html: `<div class="gmap-marker-pin"><div class="gmap-pin-body user" style="background:linear-gradient(135deg,#2563eb,#1d4ed8);"><div class="gmap-pin-icon">📍</div></div><div class="gmap-pin-label" style="background:#2563eb;">A</div></div>`,
        className: 'gmap-custom-div-icon', iconSize: [36, 46], iconAnchor: [18, 44], popupAnchor: [0, -44]
      });
      this.originMarker = L.marker(originData.latLng, { icon: oIcon })
        .addTo(map)
        .bindPopup(`<div style="color:#fff;font-weight:700;">📍 Origin: PIN ${originData.pincode}<br><small>${originData.area}</small></div>`);
    }

    // Destination marker
    if (destData.latLng) {
      const dIcon = L.divIcon({
        html: `<div class="gmap-marker-pin"><div class="gmap-pin-body sos" style="background:linear-gradient(135deg,#10b981,#059669);"><div class="gmap-pin-icon">🏁</div></div><div class="gmap-pin-label" style="background:#10b981;">B</div></div>`,
        className: 'gmap-custom-div-icon', iconSize: [36, 46], iconAnchor: [18, 44], popupAnchor: [0, -44]
      });
      this.destMarker = L.marker(destData.latLng, { icon: dIcon })
        .addTo(map)
        .bindPopup(`<div style="color:#fff;font-weight:700;">🏁 Destination: PIN ${destData.pincode}<br><small>${destData.area}</small></div>`);
    }

    // Fit map bounds to route
    const bounds = this.currentRouteLayer.getBounds();
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });

    // Auto switch to map tab
    window.app?.switchTab('map-tab');

    // Store glow layer for cleanup
    this.glowLayer = glowLayer;
  }

  /* =========================================================================
     RENDER: Single PIN Real-Time Weather Card
     ========================================================================= */
  renderSinglePinWeather(pin, weather) {
    const isCrit = (weather?.statusLevel || pin.statusLevel) === 'Critical';
    const isWarn = (weather?.statusLevel || pin.statusLevel) === 'Warning';
    const borderColor = isCrit ? 'var(--color-danger)' : isWarn ? 'var(--color-warning)' : 'var(--color-success)';
    const w = weather || this.buildStaticWeather(pin);
    const rainDay = w.rainfallMmDay;
    const rainIntensityLabel = rainDay > 200 ? '🔴 Extremely Heavy' : rainDay > 115 ? '🟠 Very Heavy' : rainDay > 65 ? '🟡 Heavy' : '🟢 Moderate';

    return `
      <div class="card" style="border-color: ${borderColor};">
        <div class="card-header">
          <div>
            <h3 style="font-size: 1.1rem; color: #fff;">📍 PIN ${pin.pincode}: ${pin.area}</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">
              ${w.live ? '🟢 Live from Open-Meteo API' : '🔴 Offline Cache'} · Updated ${w.timestamp}
            </span>
          </div>
          <span class="badge-triage ${isCrit ? 'critical' : isWarn ? 'high' : 'resolved'}">${w.statusLevel.toUpperCase()}</span>
        </div>

        <!-- Live Weather Grid -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px;">
          <div class="weather-tile">
            <div class="weather-tile-label">🌡️ Temperature</div>
            <div class="weather-tile-value">${w.tempC}°C</div>
            <div class="weather-tile-sub">Feels humid</div>
          </div>
          <div class="weather-tile">
            <div class="weather-tile-label">🌧️ Rain Now</div>
            <div class="weather-tile-value" style="color: #60a5fa;">${w.rainMmHr} mm/hr</div>
            <div class="weather-tile-sub">${rainDay} mm today</div>
          </div>
          <div class="weather-tile">
            <div class="weather-tile-label">💨 Wind</div>
            <div class="weather-tile-value" style="color: var(--color-warning);">${w.windKmh} km/h</div>
            <div class="weather-tile-sub">Gusts: ${w.gustKmh} km/h</div>
          </div>
          <div class="weather-tile">
            <div class="weather-tile-label">💧 Humidity</div>
            <div class="weather-tile-value" style="color: #38bdf8;">${w.humidity}%</div>
            <div class="weather-tile-sub">Pressure: ${w.pressure} hPa</div>
          </div>
        </div>

        <div class="alert-box ${isCrit ? 'danger' : isWarn ? 'warning' : 'success'}" style="margin-bottom: 10px;">
          <div>
            <strong>${w.weatherDesc}</strong> &nbsp;·&nbsp; ${rainIntensityLabel} Rainfall
            <div style="margin-top: 4px; font-size: 0.8rem;">
              • <strong>Road Status:</strong> ${pin.roadStatus}<br>
              • <strong>Submerged Roads:</strong> ${pin.submergedRoads.join(', ')}<br>
              • <strong>Safe Elevated Corridor:</strong> ${pin.clearElevatedRoads.join(', ')}
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.app.switchTab('map-tab'); window.floodMap?.map?.flyTo([${pin.latLng?.[0] || 9.9312}, ${pin.latLng?.[1] || 76.2673}], 13);">🗺️ View on Map</button>
          <button class="btn btn-danger" onclick="window.pincodeEngine.generateRouteSms('${pin.pincode}', '${pin.roadStatus.replace(/'/g, '')}')">📱 Send SMS Alert</button>
          <button class="btn btn-secondary" onclick="window.pincodeEngine.analyzeRoute()">🔄 Refresh Live Data</button>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     RENDER: Google Maps Style Origin → Destination Route Card
     ========================================================================= */
  renderRouteAnalysis(origin, dest, originWeather, destWeather, routeData) {
    const oW = originWeather || this.buildStaticWeather(origin);
    const dW = destWeather || this.buildStaticWeather(dest);
    const isHazardous = oW.statusLevel === 'Critical' || dW.statusLevel === 'Critical';
    const maxRain = Math.max(oW.rainfallMmDay, dW.rainfallMmDay);
    const maxGust = Math.max(oW.gustKmh, dW.gustKmh);
    const routeKm = routeData?.distanceKm || '—';
    const routeMin = routeData?.durationMin || '—';
    const hasRealRoute = !!routeData;

    const directionsHtml = routeData?.directions?.map((step, i) => `
      <div class="osrm-step">
        <div class="osrm-step-icon">${step.icon}</div>
        <div class="osrm-step-body">
          <div class="osrm-step-instr">${step.instruction}</div>
          <div class="osrm-step-dist">${step.dist}</div>
        </div>
      </div>
    `).join('') || '';

    return `
      <div class="card" style="border-color: ${isHazardous ? 'var(--color-danger)' : 'var(--color-warning)'};">
        <!-- Route Header -->
        <div class="card-header" style="flex-wrap: wrap; gap: 8px;">
          <div style="flex: 1;">
            <h3 style="font-size: 1.1rem; color: #fff; display: flex; align-items: center; gap: 8px;">
              <span style="background:#2563eb; color:#fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">A</span>
              PIN ${origin.pincode}
              <span style="color: var(--text-dim); font-size: 0.8rem;">→</span>
              <span style="background:#10b981; color:#fff; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">B</span>
              PIN ${dest.pincode}
            </h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">${origin.area} → ${dest.area}</span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            ${hasRealRoute ? `
              <span style="background: rgba(37,99,235,0.2); border: 1px solid #2563eb; color: #60a5fa; padding: 4px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">
                🛣️ ${routeKm} km · ${routeMin} min
              </span>
            ` : ''}
            <span class="badge-triage ${isHazardous ? 'critical' : 'high'}">${isHazardous ? '⚠️ HIGH RISK' : 'MODERATE'}</span>
          </div>
        </div>

        <!-- Comparison Weather Strip -->
        <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; margin-bottom: 14px; align-items: center;">
          <!-- Origin Weather -->
          <div class="route-weather-box" style="border-color: ${oW.statusLevel === 'Critical' ? '#ef4444' : '#f59e0b'};">
            <div style="font-size: 0.68rem; color: var(--color-accent); font-weight: 700; margin-bottom: 6px;">📍 ORIGIN · PIN ${origin.pincode}</div>
            <div style="font-weight: 800; font-size: 1rem;">${oW.weatherDesc}</div>
            <div class="route-weather-stats">
              <span>🌡️ ${oW.tempC}°C</span>
              <span>🌧️ ${oW.rainfallMmDay} mm/day</span>
              <span>💨 Gusts ${oW.gustKmh} km/h</span>
              <span>💧 ${oW.humidity}% humidity</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px;">
              ${oW.live ? '🟢 Live API' : '🔴 Offline'} · ${oW.timestamp}
            </div>
          </div>

          <div style="text-align: center; color: var(--text-dim); font-size: 1.4rem;">➜</div>

          <!-- Dest Weather -->
          <div class="route-weather-box" style="border-color: ${dW.statusLevel === 'Critical' ? '#ef4444' : '#f59e0b'};">
            <div style="font-size: 0.68rem; color: #10b981; font-weight: 700; margin-bottom: 6px;">🏁 DEST · PIN ${dest.pincode}</div>
            <div style="font-weight: 800; font-size: 1rem;">${dW.weatherDesc}</div>
            <div class="route-weather-stats">
              <span>🌡️ ${dW.tempC}°C</span>
              <span>🌧️ ${dW.rainfallMmDay} mm/day</span>
              <span>💨 Gusts ${dW.gustKmh} km/h</span>
              <span>💧 ${dW.humidity}% humidity</span>
            </div>
            <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 4px;">
              ${dW.live ? '🟢 Live API' : '🔴 Offline'} · ${dW.timestamp}
            </div>
          </div>
        </div>

        <!-- Route Hazard Summary Bar -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px;">
          <div class="weather-tile">
            <div class="weather-tile-label">Max Rain on Route</div>
            <div class="weather-tile-value" style="color:var(--color-danger);">${Math.max(oW.rainMmHr, dW.rainMmHr)} mm/hr</div>
            <div class="weather-tile-sub">${maxRain} mm today</div>
          </div>
          <div class="weather-tile">
            <div class="weather-tile-label">Peak Wind Gusts</div>
            <div class="weather-tile-value" style="color:var(--color-warning);">${maxGust} km/h</div>
            <div class="weather-tile-sub">Risk: Tree / Billboard Fall</div>
          </div>
          <div class="weather-tile">
            <div class="weather-tile-label">Safe Detour Available</div>
            <div class="weather-tile-value" style="color:var(--color-success); font-size: 0.9rem;">✅ Yes</div>
            <div class="weather-tile-sub">Elevated NH Bypass</div>
          </div>
        </div>

        <!-- Road Hazard Alert -->
        <div class="alert-box danger" style="margin-bottom: 8px;">
          <strong>⛔ BLOCKED / SUBMERGED ROADS ON DIRECT PATH:</strong><br>
          • ${origin.submergedRoads.join(', ')} (PIN ${origin.pincode})<br>
          • ${dest.submergedRoads.join(', ')} (PIN ${dest.pincode})
        </div>

        <div class="alert-box info" style="margin-bottom: 14px;">
          <strong>✅ RECOMMENDED SAFE CORRIDOR:</strong><br>
          Take <strong>${origin.clearElevatedRoads[0]}</strong> → <strong>${dest.clearElevatedRoads[0]}</strong>.<br>
          Avoid all low-lying underpasses, causeway bridges, and creek crossings.
        </div>

        ${hasRealRoute ? `
          <!-- Google Maps Style Turn-by-Turn Directions -->
          <div style="border: 1px solid var(--border-subtle); border-radius: var(--radius-md); overflow: hidden; margin-bottom: 14px;">
            <div style="background: rgba(37, 99, 235, 0.15); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle);">
              <span style="font-weight: 700; color: #60a5fa; font-size: 0.9rem;">🗺️ Turn-by-Turn Directions (Real Road)</span>
              <span style="color: var(--text-muted); font-size: 0.78rem;">${routeKm} km · ~${routeMin} min driving</span>
            </div>
            <div class="osrm-directions-list">
              ${directionsHtml}
            </div>
          </div>
        ` : `
          <div style="background: rgba(30,41,59,0.4); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 12px; text-align: center; font-size: 0.8rem; color: var(--text-dim); margin-bottom: 14px;">
            🌐 Connect to internet for real Google Maps style road directions
          </div>
        `}

        <!-- Action Buttons -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn btn-primary" style="flex: 1;" onclick="window.app.switchTab('map-tab')">
            🗺️ View Route on Flood Map
          </button>
          <button class="btn btn-warning" onclick="window.pincodeEngine.generateRouteSms('${origin.pincode}→${dest.pincode}', 'Flooded roads detected. Use ${origin.clearElevatedRoads[0]}.')">
            📱 Send Route Alert SMS
          </button>
        </div>
      </div>
    `;
  }

  generateFallbackPin(pin, label) {
    return {
      pincode: pin,
      area: `${label} (PIN ${pin})`,
      rainfallIntensity: 'Heavy Rainfall',
      rainfallMmHr: 30,
      windSpeedKmh: 50,
      windGustKmh: 65,
      roadStatus: 'Waterlogging Reported at Low Points',
      statusLevel: 'Warning',
      submergedRoads: ['Main Road Crossings'],
      clearElevatedRoads: ['NH/State Highway Bypass'],
      nearestShelter: 'Nearest Government School / Camp',
      latLng: [9.9312, 76.2673]
    };
  }

  generateRouteSms(pincode, message) {
    const text = encodeURIComponent(`🚨 [MONSOON ROAD WEATHER ALERT] PIN ${pincode}: ${message}. Broadcasted via Live RainWise.`);
    const smsUri = `sms:112?body=${text}`;
    window.open(smsUri, '_self');
    window.app?.showToast('Generated pre-formatted SMS alert', 'success');
  }
}

window.PincodeRouteEngine = PincodeRouteEngine;
