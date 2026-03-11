# Smart RTC Bus

A React + TypeScript frontend application for intelligent transit management with real-time tracking and route optimization.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Routing**: React Router DOM v6
- **State/Data**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts

## Project Structure

```
src/
  pages/          # Route pages (Index, DriverDashboard, PassengerInterface, BusStopScreen, AdminDashboard)
  components/     # Shared UI components
    ui/           # shadcn/ui component library
  hooks/          # Custom React hooks
  lib/            # Utilities
```

## Routes

- `/` - Home / Role selector
- `/driver` - Driver Dashboard
- `/passenger` - Passenger Interface
- `/bus-stop` - Bus Stop Screen
- `/admin` - Admin Dashboard

## Running the App

```bash
npm run dev
```

Runs on port 5000 (configured for Replit's webview).

## Key Configuration

- `vite.config.ts` - Vite dev server on `0.0.0.0:5000` with `allowedHosts: true` for Replit proxy compatibility
- `tailwind.config.ts` - Custom theme with shadcn/ui integration
- `components.json` - shadcn/ui component configuration
