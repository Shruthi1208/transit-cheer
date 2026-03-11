import { useEffect, useRef } from 'react';
import type { Route, Bus, StopWithCrowd } from '@/lib/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon path issue with bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface InteractiveMapProps {
  routes?: Route[];
  buses?: Bus[];
  highlights?: StopWithCrowd[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  currentStopId?: string;
  selectedPin?: { lat: number; lng: number; label?: string } | null;
}

function crowdColor(level: string) {
  if (level === 'high') return '#EF4444';
  if (level === 'medium') return '#F59E0B';
  return '#10B981';
}

function makeCircleIcon(color: string, size: number, ring = false) {
  return L.divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
      ${ring ? `outline:3px solid ${color};outline-offset:2px;` : ''}
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function InteractiveMap({
  routes = [],
  buses = [],
  highlights = [],
  center = [17.4401, 78.4989],
  zoom = 12,
  className = '',
  onMapClick,
  currentStopId,
  selectedPin,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (instanceRef.current) {
      instanceRef.current.remove();
      instanceRef.current = null;
    }

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
    });
    instanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Draw routes as polylines
    routes.forEach(route => {
      const coords: [number, number][] = route.stops.map(s => [s.lat, s.lng]);
      L.polyline(coords, { color: route.color, weight: 5, opacity: 0.8 }).addTo(map)
        .bindPopup(`<b>${route.name}</b><br>${route.description}<br>Distance: ${route.totalDistanceKm?.toFixed(1)} km`);
    });

    // Collect unique stops from routes
    const seenIds = new Set<string>();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        if (seenIds.has(stop.id)) return;
        seenIds.add(stop.id);
        const isCurrent = stop.id === currentStopId;
        const color = isCurrent ? '#3B82F6' : crowdColor(stop.crowdLevel || 'low');
        const size = isCurrent ? 16 : 11;
        L.marker([stop.lat, stop.lng], { icon: makeCircleIcon(color, size, isCurrent) })
          .addTo(map)
          .bindPopup(`
            <b>${stop.name}</b><br>
            Waiting: <b>${stop.passengerCount ?? 0}</b> passengers<br>
            Crowd: <b style="color:${color}">${(stop.crowdLevel || 'low').toUpperCase()}</b>
            ${isCurrent ? '<br><b style="color:#3B82F6">◀ Current Stop</b>' : ''}
          `);
      });
    });

    // Standalone highlights (used when no route context)
    highlights.forEach(stop => {
      if (seenIds.has(stop.id)) return;
      const color = crowdColor(stop.crowdLevel || 'low');
      L.marker([stop.lat, stop.lng], { icon: makeCircleIcon(color, 11) })
        .addTo(map)
        .bindPopup(`<b>${stop.name}</b><br>${stop.passengerCount} waiting`);
    });

    // Draw active buses as labelled tags
    buses.forEach(bus => {
      if (!bus.lat || !bus.lng) return;
      const busIcon = L.divIcon({
        html: `<div style="
          background:${bus.route?.color || '#3B82F6'};
          color:white;
          border-radius:8px;
          padding:3px 8px;
          font-size:11px;
          font-weight:700;
          white-space:nowrap;
          box-shadow:0 2px 8px rgba(0,0,0,.45);
          border:2px solid white;
          letter-spacing:.5px;
        ">${bus.number}</div>`,
        className: '',
        iconSize: [52, 26],
        iconAnchor: [26, 13],
      });
      L.marker([bus.lat, bus.lng], { icon: busIcon })
        .addTo(map)
        .bindPopup(`
          <b>Bus ${bus.number}</b><br>
          Driver: ${bus.driver}<br>
          Route: ${bus.route?.name || bus.routeId}<br>
          Next stop: <b>${bus.nextStop?.name || 'End of route'}</b><br>
          Passengers on board: ${bus.passengerCount}<br>
          Status: <b>${bus.status}</b>
        `);
    });

    // Selected pin from lat/lng input
    if (selectedPin) {
      const pinIcon = L.divIcon({
        html: `<div style="
          width:22px;height:22px;
          background:#8B5CF6;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 2px 10px rgba(0,0,0,.55);
        "></div>`,
        className: '',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([selectedPin.lat, selectedPin.lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(selectedPin.label
          ? `<b>${selectedPin.label}</b><br>📍 ${selectedPin.lat.toFixed(5)}, ${selectedPin.lng.toFixed(5)}`
          : `📍 ${selectedPin.lat.toFixed(5)}, ${selectedPin.lng.toFixed(5)}`)
        .openPopup();
      map.setView([selectedPin.lat, selectedPin.lng], 14);
    }

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [routes, buses, highlights, center, zoom, currentStopId, selectedPin, onMapClick]);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl overflow-hidden border border-border/50 ${className}`}
      style={{ minHeight: 300 }}
    />
  );
}
