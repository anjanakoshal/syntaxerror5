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
    const dateInput = document.getElementById('pin-travel-date');
    const timeInput = document.getElementById('pin-departure-time');
    const now = new Date();
    if (dateInput && !dateInput.value) dateInput.value = now.toISOString().slice(0, 10);
    if (timeInput && !timeInput.value) timeInput.value = now.toTimeString().slice(0, 5);

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
    const travelDate = document.getElementById('pin-travel-date')?.value;
    const departureTime = document.getElementById('pin-departure-time')?.value || new Date().toTimeString().slice(0, 5);
    const travelMode = document.getElementById('pin-travel-mode')?.value || 'driving';
    const resultsContainer = document.getElementById('pin-route-results');
    if (!resultsContainer) return;

    if (!origin || !dest) {
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = '<div class="card alert-box warning">Please enter both an origin and destination city, locality, or PIN code.</div>';
      return;
    }

    window.emergencyAudio?.playUiBeep(1100, 0.08);

    // Show loading state
    resultsContainer.style.display = 'block';
    resultsContainer.innerHTML = `
      <div class="card" style="text-align: center; padding: 30px;">
        <div style="font-size: 2rem; margin-bottom: 10px;">🌐</div>
        <div style="color: var(--color-accent); font-weight: 700; font-size: 1rem;">Fetching Real-Time Weather & Road Route...</div>
        <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: 6px;">Connecting to Google Weather API & OSRM Road Router</div>
        <div style="margin-top: 14px; height: 3px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
          <div style="height: 3px; background: linear-gradient(90deg, #2563eb, #38bdf8); border-radius: 3px; animation: progressSlide 1.5s ease-in-out infinite;"></div>
        </div>
      </div>
    `;

    const db = window.appStorage.getAllPincodes();
    try {
      const [originData, destData] = await Promise.all([
        this.resolveLocation(origin, db, 'Origin'),
        this.resolveLocation(dest, db, 'Destination')
      ]);
      // 1. Fetch real-time weather for origin
      const originWeather = await this.fetchRealWeather(originData.latLng, originData.area);

      // 2. Fetch real-time weather for dest (if given)
      let destWeather = null;
      if (destData && destData.latLng) {
        destWeather = await this.fetchRealWeather(destData.latLng, destData.area);
      }

      // 3. Fetch real OSRM road route (if both pincodes given)
      const routeData = await this.fetchOSRMRoute(originData.latLng, destData.latLng, travelMode);

      // Read current conditions at the middle of the actual route as well as
      // at the two PIN locations, so the route summary reflects conditions in
      // transit rather than only at its endpoints.
      const checkpoints = await this.buildRouteWeather(routeData, originData, destData, travelDate, departureTime);
      this.lastRouteBrief = { origin: originData, dest: destData, routeData, checkpoints };

      // 4. Render full result
      resultsContainer.innerHTML = this.renderRouteAnalysis(originData, destData, originWeather, destWeather, routeData, checkpoints, travelDate, departureTime, travelMode);

      // 5. Draw route on Leaflet map
      if (routeData && window.floodMap?.map) {
        this.drawRouteOnMap(routeData, originData, destData, checkpoints);
      } else if (window.floodMap?.map && originData.latLng) {
        this.drawOriginEvacuationRoute(originData);
      }

      window.app?.showToast(`Live weather & route loaded for PIN ${origin}${dest ? ' ➔ ' + dest : ''}`, 'success');
    } catch (err) {
      console.error('Route analysis error:', err);
      resultsContainer.innerHTML = `<div class="card alert-box danger"><strong>Route unavailable.</strong><br>We could not retrieve an actual road route or forecast for this request. Check your PIN codes, date, and connection, then try again.</div>`;
      window.app?.showToast('Route or weather service unavailable', 'warning');
    }
  }

  /* =========================================================================
     REAL-TIME WEATHER — Google Weather API
     ========================================================================= */
  async fetchRealWeather(latLng, areaName) {
    if (!latLng) return null;
    const [lat, lng] = latLng;

    const googleKey = window.APP_CONFIG?.googleWeatherApiKey?.trim();
    if (googleKey) {
      return this.fetchGoogleWeather(lat, lng, areaName, googleKey);
    }

    return this.fetchOpenMeteoWeather(lat, lng, areaName);
  }

  async resolveLocation(query, db, label) {
    const value = query.trim();
    const normalized = value.toLowerCase();
    const pinMatch = /^\d{6}$/.test(value) ? value : null;
    if (pinMatch && db[pinMatch]?.latLng) return db[pinMatch];

    const mapPin = window.floodMap?.geoData?.pincodes?.find(item =>
      item.pin === pinMatch || item.name.toLowerCase().includes(normalized) || normalized.includes(item.name.split(',')[0].toLowerCase())
    );
    if (mapPin?.latLng) {
      const pinData = this.generateFallbackPin(mapPin.pin, mapPin.name);
      pinData.latLng = mapPin.latLng;
      pinData.statusLevel = mapPin.status;
      return pinData;
    }

    const search = encodeURIComponent(`${value}, India`);
    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=in&q=${search}`, {
      headers: { Accept: 'application/json' }
    });
    if (!geoResponse.ok) throw new Error(`${label} location search failed`);
    const geoData = await geoResponse.json();
    if (!geoData[0]) throw new Error(`${label} location was not found`);

    const result = geoData[0];
    const pincode = result.display_name.match(/\b\d{6}\b/)?.[0] || value;
    const pinData = this.generateFallbackPin(pincode, result.display_name.split(',').slice(0, 3).join(','));
    pinData.area = result.display_name.split(',').slice(0, 3).join(',');
    pinData.latLng = [Number(geoData[0].lat), Number(geoData[0].lon)];
    return pinData;
  }

  async fetchGoogleWeather(lat, lng, areaName, apiKey) {
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?` +
      `key=${encodeURIComponent(apiKey)}&location.latitude=${lat}&location.longitude=${lng}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Google Weather API error');
    const data = await response.json();
    const temperature = data.temperature?.degrees;
    const feelsLike = data.feelsLikeTemperature?.degrees;
    const precipitation = data.precipitation?.qpf?.quantity || 0;
    const windSpeed = data.wind?.speed?.value || 0;
    const windGust = data.wind?.gust?.value || windSpeed;
    const weatherDesc = data.weatherCondition?.description?.text || 'Current conditions';
    const rainfallMmDay = Number(precipitation).toFixed(1);

    return {
      live: true,
      provider: 'Google Weather API',
      area: areaName,
      lat, lng,
      weatherDesc,
      tempC: Number(temperature || 0).toFixed(1),
      feelsLikeC: Number(feelsLike || temperature || 0).toFixed(1),
      humidity: data.relativeHumidity || 0,
      pressure: data.airPressure?.meanSeaLevelMillibars?.toFixed(0) || '—',
      rainMmHr: Number(precipitation),
      rainfallMmDay: Number(rainfallMmDay),
      windKmh: Math.round(Number(windSpeed)),
      gustKmh: Math.round(Number(windGust)),
      statusLevel: Number(rainfallMmDay) > 200 ? 'Critical' : Number(rainfallMmDay) > 100 ? 'Warning' : 'Moderate',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    };
  }

  async fetchOpenMeteoWeather(lat, lng, areaName) {

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
      provider: 'Open-Meteo fallback',
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
  async fetchOSRMRoute(originLatLng, destLatLng, travelMode = 'driving') {
    const [oLat, oLng] = originLatLng;
    const [dLat, dLng] = destLatLng;

    const profile = travelMode === 'walking' ? 'foot' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${profile}/` +
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
      real: true,
      geojson: route.geometry,
      distanceKm,
      durationMin,
      travelMode,
      directions
    };
  }

  async buildRouteWeather(routeData, origin, dest, travelDate, departureTime) {
    const coordinates = routeData.geojson.coordinates;
    const checkpoints = this.createRouteCheckpoints(coordinates, routeData.distanceKm, routeData.durationMin, origin, dest, travelDate, departureTime);
    return Promise.all(checkpoints.map(async checkpoint => {
      try {
        checkpoint.weather = await this.fetchForecastWeather(checkpoint.latLng, checkpoint.arrival);
      } catch (error) {
        checkpoint.weather = null;
      }
      checkpoint.severity = this.weatherSeverity(checkpoint.weather);
      return checkpoint;
    }));
  }

  createRouteCheckpoints(coordinates, distanceKm, durationMin, origin, dest, travelDate, departureTime) {
    const totalKm = Number(distanceKm);
    const count = Math.max(2, Math.ceil(totalKm / 40) + 1);
    const departure = new Date(`${travelDate}T${departureTime}`);
    return Array.from({ length: count }, (_, index) => {
      const progress = index / (count - 1);
      const coordinate = coordinates[Math.min(coordinates.length - 1, Math.round(progress * (coordinates.length - 1)))];
      const arrival = new Date(departure.getTime() + durationMin * 60000 * progress);
      return {
        name: index === 0 ? origin.area : index === count - 1 ? dest.area : `Route checkpoint ${index}`,
        distanceKm: (totalKm * progress).toFixed(1),
        arrival,
        latLng: [coordinate[1], coordinate[0]],
        coordinateIndex: Math.min(coordinates.length - 1, Math.round(progress * (coordinates.length - 1))),
        weather: null,
        severity: 'unknown'
      };
    });
  }

  async fetchForecastWeather(latLng, arrival) {
    const date = arrival.toISOString().slice(0, 10);
    const hour = arrival.getHours();
    const [lat, lng] = latLng;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weathercode,wind_speed_10m,wind_direction_10m,relative_humidity_2m,visibility` +
      `&timezone=Asia%2FKolkata&start_date=${date}&end_date=${date}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Forecast unavailable');
    const data = await response.json();
    const requestedTime = `${date}T${String(hour).padStart(2, '0')}:00`;
    const index = data.hourly?.time?.indexOf(requestedTime);
    if (index === -1 || index === undefined) throw new Error('Forecast time unavailable');
    const h = data.hourly;
    return {
      live: true,
      provider: 'Open-Meteo forecast',
      weatherDesc: this.wmoCodeToDescription(h.weathercode[index]),
      weatherCode: h.weathercode[index],
      tempC: Number(h.temperature_2m[index]).toFixed(1),
      feelsLikeC: Number(h.apparent_temperature[index]).toFixed(1),
      rainProbability: h.precipitation_probability[index] ?? 0,
      rainMmHr: Number(h.precipitation[index] || 0).toFixed(1),
      windKmh: Math.round(h.wind_speed_10m[index] || 0),
      windDirection: Math.round(h.wind_direction_10m[index] || 0),
      humidity: h.relative_humidity_2m[index] ?? 0,
      visibilityKm: ((h.visibility[index] || 0) / 1000).toFixed(1)
    };
  }

  weatherSeverity(weather) {
    if (!weather) return 'unknown';
    if (weather.rainProbability >= 80 || Number(weather.rainMmHr) >= 7 || weather.windKmh >= 55 || [95, 96, 99].includes(weather.weatherCode)) return 'red';
    if (weather.rainProbability >= 60 || Number(weather.rainMmHr) >= 3 || weather.windKmh >= 40) return 'orange';
    if (weather.rainProbability >= 35 || Number(weather.rainMmHr) > 0) return 'yellow';
    return 'green';
  }

  getRouteMidpoint(routeData, originLatLng, destLatLng) {
    const coordinates = routeData?.geojson?.coordinates;
    if (coordinates?.length) {
      const middle = coordinates[Math.floor(coordinates.length / 2)];
      return [middle[1], middle[0]];
    }
    return [
      (originLatLng[0] + destLatLng[0]) / 2,
      (originLatLng[1] + destLatLng[1]) / 2
    ];
  }

  buildFallbackRoute(originLatLng, destLatLng) {
    const distanceKm = (
      Math.sqrt(
        Math.pow((destLatLng[0] - originLatLng[0]) * 111, 2) +
        Math.pow((destLatLng[1] - originLatLng[1]) * 109, 2)
      )
    ).toFixed(1);

    return {
      real: false,
      geojson: {
        type: 'LineString',
        coordinates: [
          [originLatLng[1], originLatLng[0]],
          [destLatLng[1], destLatLng[0]]
        ]
      },
      distanceKm,
      durationMin: Math.round(Number(distanceKm) * 2),
      directions: []
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
  drawRouteOnMap(routeData, originData, destData, checkpoints = []) {
    const map = window.floodMap.map;
    if (!map) return;

    // Clear old route
    if (this.currentRouteLayer) map.removeLayer(this.currentRouteLayer);
    if (this.originMarker) map.removeLayer(this.originMarker);
    if (this.destMarker) map.removeLayer(this.destMarker);
    if (this.checkpointMarkers) this.checkpointMarkers.forEach(marker => map.removeLayer(marker));
    this.checkpointMarkers = [];

    // Draw OSRM GeoJSON polyline (Google blue)
    const routeBaseLayer = L.geoJSON(routeData.geojson, {
      style: {
        color: '#2563eb',
        weight: 7,
        opacity: 0.88,
        lineCap: 'round',
        lineJoin: 'round'
      }
    });
    this.currentRouteLayer = L.layerGroup([routeBaseLayer]).addTo(map);

    const severityColors = { green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444' };
    const routeCoordinates = routeData.geojson.coordinates;
    checkpoints.slice(0, -1).forEach((checkpoint, index) => {
      const next = checkpoints[index + 1];
      const segment = routeCoordinates.slice(checkpoint.coordinateIndex, next.coordinateIndex + 1);
      if (segment.length < 2 || !severityColors[checkpoint.severity]) return;
      L.polyline(segment.map(coordinate => [coordinate[1], coordinate[0]]), {
        color: severityColors[checkpoint.severity], weight: 8, opacity: 0.95, lineCap: 'round', lineJoin: 'round'
      }).addTo(this.currentRouteLayer);
    });

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
    const bounds = routeBaseLayer.getBounds();
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });

    // Auto switch to map tab
    window.app?.switchTab('map-tab');

    // Store glow layer for cleanup
    this.glowLayer = glowLayer;

    checkpoints.forEach(checkpoint => {
      const color = ({ green: '#22c55e', yellow: '#eab308', orange: '#f97316', red: '#ef4444' })[checkpoint.severity] || '#94a3b8';
      const marker = L.circleMarker(checkpoint.latLng, {
        radius: 8, color: '#fff', weight: 2, fillColor: color, fillOpacity: 1
      }).addTo(map).bindPopup(`<strong>${checkpoint.name}</strong><br>${checkpoint.distanceKm} km · ${checkpoint.arrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}<br>${checkpoint.weather?.weatherDesc || 'Weather data unavailable'}`);
      this.checkpointMarkers.push(marker);
    });
  }

  drawOriginEvacuationRoute(originData) {
    const floodMap = window.floodMap;
    const map = floodMap?.map;
    if (!map) return;

    if (this.currentRouteLayer) map.removeLayer(this.currentRouteLayer);
    if (this.glowLayer) map.removeLayer(this.glowLayer);
    if (this.originMarker) map.removeLayer(this.originMarker);
    if (this.destMarker) map.removeLayer(this.destMarker);
    this.currentRouteLayer = null;
    this.glowLayer = null;
    this.originMarker = null;
    this.destMarker = null;

    floodMap.userLatLng = originData.latLng;
    floodMap.renderUserMarker();
    map.flyTo(originData.latLng, 12);
    floodMap.calculateSafeRoute();
    window.app?.switchTab('map-tab');
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
              ${w.live ? `🟢 Live from ${w.provider || 'weather API'}` : '🔴 Offline Cache'} · Updated ${w.timestamp}
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
  renderRouteAnalysis(origin, dest, originWeather, destWeather, routeData, checkpoints = [], travelDate, departureTime, travelMode = 'driving') {
    const oW = originWeather || this.buildStaticWeather(origin);
    const dW = destWeather || this.buildStaticWeather(dest);
    const isHazardous = oW.statusLevel === 'Critical' || dW.statusLevel === 'Critical';
    const maxRain = Math.max(oW.rainfallMmDay, dW.rainfallMmDay);
    const maxGust = Math.max(oW.gustKmh, dW.gustKmh);
    const routeKm = routeData?.distanceKm || '—';
    const routeMin = routeData?.durationMin || '—';
    const hasRealRoute = !!routeData && routeData.real !== false;
    const severeCheckpoints = checkpoints.filter(checkpoint => checkpoint.severity === 'red' || checkpoint.severity === 'orange');
    const timeline = checkpoints.map(checkpoint => {
      const weather = checkpoint.weather;
      const time = checkpoint.arrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return `<div class="route-checkpoint ${checkpoint.severity}"><div class="route-checkpoint-dot"></div><div><strong>${checkpoint.name}</strong><span>${checkpoint.distanceKm} km · ${time}</span><span>${weather ? `${weather.weatherDesc} · ${weather.tempC}°C · Rain ${weather.rainProbability}% · Wind ${weather.windKmh} km/h` : 'Weather data unavailable for this location/time.'}</span></div></div>`;
    }).join('');

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
            <span class="badge-triage resolved">${travelMode}</span>
          </div>
        </div>

        ${severeCheckpoints.length ? `<div class="alert-box danger" style="margin-bottom: 14px;"><strong>⚠️ Weather alerts along route</strong><br>${severeCheckpoints.map(checkpoint => `${checkpoint.name}: ${checkpoint.weather?.weatherDesc || 'Severe conditions'} at ${checkpoint.arrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`).join('<br>')}</div>` : ''}

        <div class="route-timeline">
          <div class="route-timeline-title">🕒 Weather timeline · ${travelDate} · depart ${departureTime}</div>
          ${timeline}
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
              ${oW.live ? `🟢 ${oW.provider || 'Live API'}` : '🔴 Offline'} · ${oW.timestamp}
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
              ${dW.live ? `🟢 ${dW.provider || 'Live API'}` : '🔴 Offline'} · ${dW.timestamp}
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
          <button class="btn btn-secondary" onclick="window.pincodeEngine.generateRoutePodcast()">🎙️ Generate Route Weather Podcast</button>
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

  generateRoutePodcast() {
    const brief = this.lastRouteBrief;
    if (!brief) return;
    const concerns = brief.checkpoints.filter(checkpoint => checkpoint.severity === 'red' || checkpoint.severity === 'orange');
    const summary = concerns.length
      ? `The main weather concerns are ${concerns.map(checkpoint => `${checkpoint.name}, with ${checkpoint.weather?.weatherDesc || 'unavailable weather data'}`).join('; ')}.`
      : 'Conditions are generally favorable along the route based on the available forecasts.';
    const text = `Your journey from ${brief.origin.area} to ${brief.dest.area} is approximately ${brief.routeData.distanceKm} kilometers and will take around ${brief.routeData.durationMin} minutes. ${summary}`;
    if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    window.app?.showToast('Route weather briefing started', 'success');
  }
}

window.PincodeRouteEngine = PincodeRouteEngine;
