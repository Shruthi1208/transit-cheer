import { useEffect, useRef } from 'react';
import type { Route, Bus, StopWithCrowd } from '@/lib/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  destPin?: { lat: number; lng: number; label?: string } | null;
  highlightStopIds?: string[];
}

function crowdColor(level: string) {
  if (level === 'high') return '#EF4444';
  if (level === 'medium') return '#F59E0B';
  return '#10B981';
}

function makeCircleIcon(color: string, size: number, ring = false, star = false) {
  const inner = star
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:${size * 0.6}px;line-height:1">★</div>`
    : '';
  return L.divIcon({
    html: `<div style="
      position:relative;
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 2px 6px rgba(0,0,0,.4);
      ${ring ? `outline:3px solid ${color};outline-offset:2px;` : ''}
      color:white;
    ">${inner}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makePinIcon(color: string, label?: string) {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="background:${color};color:white;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.4)">${label ?? '📍'}</div>
      <div style="width:2px;height:10px;background:${color}"></div>
      <div style="width:8px;height:8px;border-radius:50%;background:${color}"></div>
    </div>`,
    className: '',
    iconSize: [70, 42],
    iconAnchor: [35, 42],
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
  destPin,
  highlightStopIds = [],
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }

    const map = L.map(mapRef.current, { center, zoom, zoomControl: true });
    instanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => onMapClick(e.latlng.lat, e.latlng.lng));
    }

    routes.forEach(route => {
      const coords: [number, number][] = route.stops.map(s => [s.lat, s.lng]);
      L.polyline(coords, { color: route.color, weight: 5, opacity: 0.8 }).addTo(map)
        .bindPopup(`<b>${route.name}</b><br>${route.description}<br>Distance: ${route.totalDistanceKm?.toFixed(1)} km`);
    });

    const seenIds = new Set<string>();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        if (seenIds.has(stop.id)) return;
        seenIds.add(stop.id);
        const isCurrent = stop.id === currentStopId;
        const isHighlighted = highlightStopIds.includes(stop.id);
        const color = isCurrent ? '#3B82F6' : isHighlighted ? '#8B5CF6' : crowdColor(stop.crowdLevel || 'low');
        const size = isCurrent ? 16 : isHighlighted ? 15 : 11;
        L.marker([stop.lat, stop.lng], { icon: makeCircleIcon(color, size, isCurrent || isHighlighted, isHighlighted) })
          .addTo(map)
          .bindPopup(`
            <b>${stop.name}</b><br>
            Waiting: <b>${stop.passengerCount ?? 0}</b> passengers<br>
            Crowd: <b style="color:${color}">${(stop.crowdLevel || 'low').toUpperCase()}</b>
            ${isCurrent ? '<br><b style="color:#3B82F6">◀ Current Stop</b>' : ''}
            ${isHighlighted ? '<br><b style="color:#8B5CF6">★ Trip Stop</b>' : ''}
          `);
      });
    });

    highlights.forEach(stop => {
      if (seenIds.has(stop.id)) return;
      const color = crowdColor(stop.crowdLevel || 'low');
      L.marker([stop.lat, stop.lng], { icon: makeCircleIcon(color, 11) })
        .addTo(map)
        .bindPopup(`<b>${stop.name}</b><br>${stop.passengerCount} waiting`);
    });

    buses.forEach(bus => {
      if (!bus.lat || !bus.lng) return;
      const busIcon = L.divIcon({
        html: `<div style="
          background:${bus.route?.color || '#3B82F6'};
          color:white;border-radius:8px;
          padding:3px 8px;font-size:11px;font-weight:700;
          white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.45);
          border:2px solid white;letter-spacing:.5px;
        ">${bus.number}</div>`,
        className: '',
        iconSize: [52, 26],
        iconAnchor: [26, 13],
      });
      L.marker([bus.lat, bus.lng], { icon: busIcon }).addTo(map)
        .bindPopup(`<b>Bus ${bus.number}</b><br>Driver: ${bus.driver}<br>Route: ${bus.route?.name || bus.routeId}<br>Next: <b>${bus.nextStop?.name || 'End'}</b><br>Passengers: ${bus.passengerCount}<br>Status: <b>${bus.status}</b>`);
    });

    if (selectedPin) {
      L.marker([selectedPin.lat, selectedPin.lng], { icon: makePinIcon('#8B5CF6', selectedPin.label ?? 'Origin') })
        .addTo(map)
        .bindPopup(`<b>${selectedPin.label ?? 'Origin'}</b><br>📍 ${selectedPin.lat.toFixed(5)}, ${selectedPin.lng.toFixed(5)}`)
        .openPopup();
      if (!destPin) map.setView([selectedPin.lat, selectedPin.lng], 14);
    }

    if (destPin) {
      L.marker([destPin.lat, destPin.lng], { icon: makePinIcon('#F97316', destPin.label ?? 'Destination') })
        .addTo(map)
        .bindPopup(`<b>${destPin.label ?? 'Destination'}</b><br>🏁 ${destPin.lat.toFixed(5)}, ${destPin.lng.toFixed(5)}`);
      if (selectedPin) {
        const bounds = L.latLngBounds([[selectedPin.lat, selectedPin.lng], [destPin.lat, destPin.lng]]);
        map.fitBounds(bounds, { padding: [60, 60] });
      } else {
        map.setView([destPin.lat, destPin.lng], 14);
      }
    }

    return () => {
      if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
    };
  }, [routes, buses, highlights, center, zoom, currentStopId, selectedPin, destPin, highlightStopIds, onMapClick]);

  return (
    <div ref={mapRef} className={`w-full rounded-xl overflow-hidden border border-border/50 ${className}`} style={{ minHeight: 300 }} />
  );
}
