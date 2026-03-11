# Smart RTC Bus System — Hyderabad

A full-stack real-time transit management system for Hyderabad RTC buses, featuring interactive maps, live crowd tracking, optimised routing, and CO₂ emissions comparison.

## Tech Stack

**Frontend**
- React 18 + TypeScript + Vite (port 5000)
- Tailwind CSS + shadcn/ui components
- React Router DOM v6
- TanStack Query v5 (data fetching + cache)
- React Leaflet v4 + Leaflet (interactive OpenStreetMap maps)
- Recharts (bar/pie charts for CO₂ data)

**Backend**
- Express.js server (port 3001)
- In-memory state (crowd counts, passenger queues)
- Vite dev proxy: `/api` → `http://localhost:3001`

## Architecture

```
browser → Vite (5000) → /api proxy → Express (3001)
```

Both servers start with: `node server/index.js & npm run dev`

## Real Hyderabad Bus Routes

- **Route 219D**: Kukatpally → KPHB Colony → JNTU → Balanagar X Roads → Moosapet → SR Nagar → Erragadda → Ameerpet → Punjagutta → Begumpet → Paradise → Secunderabad
- **Route 10C**: LB Nagar → Dilsukhnagar → Koti → Abids → Nampally → Lakdikapul → Imlibun → Begumpet → Secunderabad
- **Route 8**: ECIL X Roads → Nacharam → Habsiguda → Tarnaka → Secunderabad → Nampally → Lakdikapul → Mehdipatnam

## Features

### Driver Dashboard (`/driver`)
- Route selector (219D / 10C / 8)
- Lat/Lng input → "Find Route" button → nearest stop detection + optimised route displayed on map
- Click-on-map to set location pin
- Live Leaflet map showing bus position, coloured route polylines, crowd-coloured stop markers
- Upcoming stops list with ETA in minutes
- CO₂ emissions bar chart: Bus vs Auto vs Car vs Walk
- High crowd alerts panel

### Passenger Interface (`/passenger`)
- Route selection
- Stop grid (simulates QR code scan at each stop)
- "I am Waiting" button → POST to backend to join crowd queue
- Live ETA from backend, real-time crowd count, crowd level bar
- CO₂ savings displayed (bus vs car)

### Bus Stop Screen (`/bus-stop`)
- Route + stop picker (models a real stop display screen)
- QR code display for passenger scanning
- Live passenger count from backend (refreshes every 5s)
- Next bus ETA calculation based on active bus position
- Crowd level visual bar
- Live queue display

### Admin Dashboard (`/admin`)
- Full Hyderabad map with all 3 routes + 3 active buses
- Route filter buttons to isolate a single route on map
- High-crowd stops list
- Crowd distribution pie chart
- CO₂ Bus vs Car comparison bar chart per route
- Active fleet table: bus number, route, driver, current/next stop, passengers, status

## API Endpoints (port 3001)

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/routes | All routes with stops + crowd data |
| GET | /api/routes/:id | Single route |
| GET | /api/buses | All active buses with position |
| GET | /api/stops | All stops across all routes |
| GET | /api/stops/:id/crowd | Crowd count + queue for a stop |
| POST | /api/stops/:id/queue | Passenger joins queue |
| DELETE | /api/stops/:id/queue/:pid | Passenger leaves queue |
| POST | /api/route/nearest | Find nearest stop from lat/lng |
| GET | /api/co2 | CO₂ comparison for a route |

## Key Files

```
server/index.js          — Express API + Hyderabad route data
src/lib/api.ts           — Typed API client
src/components/InteractiveMap.tsx — React Leaflet map component
src/pages/DriverDashboard.tsx
src/pages/PassengerInterface.tsx
src/pages/BusStopScreen.tsx
src/pages/AdminDashboard.tsx
vite.config.ts           — Proxy /api → port 3001
```
