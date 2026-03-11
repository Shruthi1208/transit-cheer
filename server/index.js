import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ─── Hyderabad Bus Routes Data ──────────────────────────────────────────────
const ROUTES = [
  {
    id: 'R219D',
    name: 'Route 219D',
    description: 'Kukatpally → Ameerpet → Secunderabad',
    color: '#3B82F6',
    stops: [
      { id: 'S1',  name: 'Kukatpally',       lat: 17.4947, lng: 78.3996, order: 1 },
      { id: 'S2',  name: 'KPHB Colony',       lat: 17.4906, lng: 78.3846, order: 2 },
      { id: 'S3',  name: 'JNTU',              lat: 17.4930, lng: 78.3912, order: 3 },
      { id: 'S4',  name: 'Balanagar X Roads', lat: 17.4711, lng: 78.4111, order: 4 },
      { id: 'S5',  name: 'Moosapet',          lat: 17.4578, lng: 78.4186, order: 5 },
      { id: 'S6',  name: 'SR Nagar',          lat: 17.4519, lng: 78.4347, order: 6 },
      { id: 'S7',  name: 'Erragadda',         lat: 17.4486, lng: 78.4361, order: 7 },
      { id: 'S8',  name: 'Ameerpet',          lat: 17.4375, lng: 78.4483, order: 8 },
      { id: 'S9',  name: 'Punjagutta',        lat: 17.4280, lng: 78.4486, order: 9 },
      { id: 'S10', name: 'Begumpet',          lat: 17.4417, lng: 78.4689, order: 10 },
      { id: 'S11', name: 'Paradise',          lat: 17.4436, lng: 78.4853, order: 11 },
      { id: 'S12', name: 'Secunderabad',      lat: 17.4395, lng: 78.4992, order: 12 },
    ],
  },
  {
    id: 'R10C',
    name: 'Route 10C',
    description: 'LB Nagar → Abids → Secunderabad',
    color: '#10B981',
    stops: [
      { id: 'T1', name: 'LB Nagar',       lat: 17.3481, lng: 78.5523, order: 1 },
      { id: 'T2', name: 'Dilsukhnagar',   lat: 17.3686, lng: 78.5265, order: 2 },
      { id: 'T3', name: 'Koti',           lat: 17.3850, lng: 78.4858, order: 3 },
      { id: 'T4', name: 'Abids',          lat: 17.3950, lng: 78.4736, order: 4 },
      { id: 'T5', name: 'Nampally',       lat: 17.3955, lng: 78.4686, order: 5 },
      { id: 'T6', name: 'Lakdikapul',     lat: 17.3858, lng: 78.4700, order: 6 },
      { id: 'T7', name: 'Imlibun',        lat: 17.4008, lng: 78.4772, order: 7 },
      { id: 'T8', name: 'Begumpet',       lat: 17.4417, lng: 78.4689, order: 8 },
      { id: 'T9', name: 'Secunderabad',   lat: 17.4395, lng: 78.4992, order: 9 },
    ],
  },
  {
    id: 'R8',
    name: 'Route 8',
    description: 'ECIL → Secunderabad → Mehdipatnam',
    color: '#F59E0B',
    stops: [
      { id: 'E1', name: 'ECIL X Roads',   lat: 17.4726, lng: 78.5560, order: 1 },
      { id: 'E2', name: 'Nacharam',       lat: 17.4272, lng: 78.5361, order: 2 },
      { id: 'E3', name: 'Habsiguda',      lat: 17.4186, lng: 78.5444, order: 3 },
      { id: 'E4', name: 'Tarnaka',        lat: 17.4286, lng: 78.5306, order: 4 },
      { id: 'E5', name: 'Secunderabad',   lat: 17.4395, lng: 78.4992, order: 5 },
      { id: 'E6', name: 'Nampally',       lat: 17.3955, lng: 78.4686, order: 6 },
      { id: 'E7', name: 'Lakdikapul',     lat: 17.3858, lng: 78.4700, order: 7 },
      { id: 'E8', name: 'Mehdipatnam',    lat: 17.3922, lng: 78.4306, order: 8 },
    ],
  },
];

// ─── In-Memory State ─────────────────────────────────────────────────────────
const crowdCounts = {};
const stopQueues = {};

// Pre-populate some crowd data
function initCrowd() {
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      crowdCounts[stop.id] = Math.floor(Math.random() * 25);
      stopQueues[stop.id] = [];
    });
  });
}
initCrowd();

// Active buses (simulated positions that update slightly over time)
const buses = [
  { id: 'BUS001', number: '#42', routeId: 'R219D', currentStopIdx: 2, speed: 40, driver: 'A. Kumar', capacity: 60 },
  { id: 'BUS002', number: '#17', routeId: 'R10C',  currentStopIdx: 1, speed: 35, driver: 'S. Patel', capacity: 60 },
  { id: 'BUS003', number: '#08', routeId: 'R8',    currentStopIdx: 0, speed: 38, driver: 'R. Singh', capacity: 60 },
];

// Simulate bus movement every 30s
setInterval(() => {
  buses.forEach(bus => {
    const route = ROUTES.find(r => r.id === bus.routeId);
    if (route && bus.currentStopIdx < route.stops.length - 1) {
      if (Math.random() < 0.3) bus.currentStopIdx++;
    } else if (route) {
      bus.currentStopIdx = 0;
    }
  });
}, 30000);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestStop(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      const d = haversineKm(lat, lng, stop.lat, stop.lng);
      if (d < bestDist) {
        bestDist = d;
        best = { stop, route, distKm: d };
      }
    });
  });
  return best;
}

function co2Comparison(distanceKm, passengerCount = 30) {
  const busCO2PerKm = 0.089; // kg per passenger-km (avg occupancy)
  const carCO2PerKm = 0.21;
  const autoCO2PerKm = 0.12;
  const walkCO2PerKm = 0;
  return {
    bus: +(distanceKm * busCO2PerKm).toFixed(3),
    car: +(distanceKm * carCO2PerKm).toFixed(3),
    auto: +(distanceKm * autoCO2PerKm).toFixed(3),
    walk: walkCO2PerKm,
    savedVsCar: +((carCO2PerKm - busCO2PerKm) * distanceKm).toFixed(3),
    savedVsAuto: +((autoCO2PerKm - busCO2PerKm) * distanceKm).toFixed(3),
    distanceKm: +distanceKm.toFixed(2),
  };
}

function routeDistanceKm(stops) {
  let total = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    total += haversineKm(stops[i].lat, stops[i].lng, stops[i + 1].lat, stops[i + 1].lng);
  }
  return +total.toFixed(2);
}

function stopCrowdLevel(count) {
  if (count <= 5) return 'low';
  if (count <= 15) return 'medium';
  return 'high';
}

function etaMinutes(stopsAway, avgSpeedKmh = 35, avgDistKm = 1.5) {
  return Math.round((stopsAway * avgDistKm / avgSpeedKmh) * 60);
}

// ─── API Routes ───────────────────────────────────────────────────────────────

// GET /api/routes – all routes with crowd data
app.get('/api/routes', (req, res) => {
  const result = ROUTES.map(route => ({
    ...route,
    stops: route.stops.map(stop => ({
      ...stop,
      passengerCount: crowdCounts[stop.id] || 0,
      crowdLevel: stopCrowdLevel(crowdCounts[stop.id] || 0),
    })),
    totalDistanceKm: routeDistanceKm(route.stops),
  }));
  res.json(result);
});

// GET /api/routes/:id – single route
app.get('/api/routes/:id', (req, res) => {
  const route = ROUTES.find(r => r.id === req.params.id);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  const enriched = {
    ...route,
    stops: route.stops.map(stop => ({
      ...stop,
      passengerCount: crowdCounts[stop.id] || 0,
      crowdLevel: stopCrowdLevel(crowdCounts[stop.id] || 0),
    })),
    totalDistanceKm: routeDistanceKm(route.stops),
  };
  res.json(enriched);
});

// GET /api/buses – active buses with current position
app.get('/api/buses', (req, res) => {
  const result = buses.map(bus => {
    const route = ROUTES.find(r => r.id === bus.routeId);
    const currentStop = route?.stops[bus.currentStopIdx];
    const nextStop = route?.stops[bus.currentStopIdx + 1];
    const passengerCount = crowdCounts[currentStop?.id] || 0;
    return {
      ...bus,
      currentStop,
      nextStop,
      lat: currentStop?.lat,
      lng: currentStop?.lng,
      passengerCount,
      occupancyPct: Math.round((passengerCount / bus.capacity) * 100),
      status: Math.random() > 0.2 ? 'on-time' : 'delayed',
      route: route ? { id: route.id, name: route.name, color: route.color } : null,
    };
  });
  res.json(result);
});

// GET /api/stops/:stopId/crowd
app.get('/api/stops/:stopId/crowd', (req, res) => {
  const { stopId } = req.params;
  const count = crowdCounts[stopId] ?? 0;
  res.json({
    stopId,
    passengerCount: count,
    crowdLevel: stopCrowdLevel(count),
    queue: stopQueues[stopId] || [],
  });
});

// POST /api/stops/:stopId/queue – passenger joins queue
app.post('/api/stops/:stopId/queue', (req, res) => {
  const { stopId } = req.params;
  const { passengerId = `P${Date.now()}`, name = 'Passenger' } = req.body;
  if (!stopQueues[stopId]) stopQueues[stopId] = [];
  if (!crowdCounts[stopId]) crowdCounts[stopId] = 0;

  // Avoid duplicate joins
  const already = stopQueues[stopId].find(p => p.id === passengerId);
  if (!already) {
    stopQueues[stopId].push({ id: passengerId, name, joinedAt: new Date().toISOString() });
    crowdCounts[stopId]++;
  }

  // Find which bus serves this stop and its ETA
  let eta = null;
  ROUTES.forEach(route => {
    const stopIdx = route.stops.findIndex(s => s.id === stopId);
    if (stopIdx !== -1) {
      const bus = buses.find(b => b.routeId === route.id);
      if (bus) {
        const stopsAway = Math.max(0, stopIdx - bus.currentStopIdx);
        eta = etaMinutes(stopsAway);
      }
    }
  });

  res.json({
    success: true,
    passengerId,
    passengerCount: crowdCounts[stopId],
    crowdLevel: stopCrowdLevel(crowdCounts[stopId]),
    etaMinutes: eta,
  });
});

// DELETE /api/stops/:stopId/queue/:passengerId – leave queue
app.delete('/api/stops/:stopId/queue/:passengerId', (req, res) => {
  const { stopId, passengerId } = req.params;
  if (stopQueues[stopId]) {
    const before = stopQueues[stopId].length;
    stopQueues[stopId] = stopQueues[stopId].filter(p => p.id !== passengerId);
    if (stopQueues[stopId].length < before && crowdCounts[stopId] > 0) {
      crowdCounts[stopId]--;
    }
  }
  res.json({ success: true, passengerCount: crowdCounts[stopId] || 0 });
});

// POST /api/route/nearest – find nearest stop from lat/lng
app.post('/api/route/nearest', (req, res) => {
  const { lat, lng } = req.body;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });

  const nearest = findNearestStop(parseFloat(lat), parseFloat(lng));
  if (!nearest) return res.status(404).json({ error: 'No stops found' });

  const { stop, route, distKm } = nearest;
  const stopIdx = route.stops.findIndex(s => s.id === stop.id);
  const remainingStops = route.stops.slice(stopIdx);
  const totalDist = routeDistanceKm(remainingStops);

  res.json({
    nearestStop: { ...stop, passengerCount: crowdCounts[stop.id] || 0 },
    route: { id: route.id, name: route.name, color: route.color },
    distanceToStopKm: +distKm.toFixed(3),
    remainingStops: remainingStops.map((s, i) => ({
      ...s,
      passengerCount: crowdCounts[s.id] || 0,
      crowdLevel: stopCrowdLevel(crowdCounts[s.id] || 0),
      etaMinutes: etaMinutes(i),
    })),
    co2: co2Comparison(totalDist),
  });
});

// GET /api/co2?routeId=R219D&fromStopIdx=0
app.get('/api/co2', (req, res) => {
  const { routeId, fromStopIdx = 0 } = req.query;
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return res.status(404).json({ error: 'Route not found' });
  const stops = route.stops.slice(parseInt(fromStopIdx));
  const dist = routeDistanceKm(stops);
  res.json(co2Comparison(dist));
});

// GET /api/stops – all stops across all routes with crowd
app.get('/api/stops', (req, res) => {
  const all = [];
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      const existing = all.find(s => s.id === stop.id);
      if (!existing) {
        all.push({
          ...stop,
          routeId: route.id,
          routeName: route.name,
          passengerCount: crowdCounts[stop.id] || 0,
          crowdLevel: stopCrowdLevel(crowdCounts[stop.id] || 0),
        });
      }
    });
  });
  res.json(all);
});

// Simulate crowd fluctuation every 20s
setInterval(() => {
  ROUTES.forEach(route => {
    route.stops.forEach(stop => {
      const delta = Math.floor(Math.random() * 5) - 2;
      crowdCounts[stop.id] = Math.max(0, (crowdCounts[stop.id] || 0) + delta);
    });
  });
}, 20000);

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`RTC API running on port ${PORT}`));
