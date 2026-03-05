import { Bus, MapPin, Users, AlertTriangle, Navigation, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import MapPlaceholder from "@/components/MapPlaceholder";

const stops = [
  { name: "Central Station", passengers: 12, status: "stop" as const, decision: "stop" as const },
  { name: "Market Square", passengers: 3, status: "stop" as const, decision: "skip" as const },
  { name: "University", passengers: 28, status: "crowded" as const, decision: "stop" as const },
  { name: "Hospital", passengers: 8, status: "stop" as const, decision: "stop" as const },
  { name: "Airport Terminal", passengers: 0, status: "stop" as const, decision: "skip" as const },
];

const alerts = [
  { text: "University stop overcrowded — 28 passengers waiting", type: "crowded" as const },
  { text: "Traffic congestion on Route 5 near Market Square", type: "skip" as const },
];

const DriverDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
            <div className="w-px h-5 bg-border" />
            <Bus className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">Driver Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-transit-stop animate-pulse-dot" />
            <span>Bus #42 — Route 5</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MapPin} title="Current Location" value="Market Sq." subtitle="Stop 3 of 12" />
          <StatCard icon={Navigation} title="Next Stop" value="University" subtitle="2.3 km — 4 min" />
          <StatCard icon={Users} title="Total Waiting" value={51} subtitle="Across all stops" variant="crowded" />
          <StatCard icon={Clock} title="ETA Finish" value="45 min" subtitle="On schedule" variant="stop" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <MapPlaceholder
              title="Optimized Route"
              className="h-[400px]"
              stops={stops.map(s => ({ name: s.name, status: s.decision === "skip" ? "skip" : s.status === "crowded" ? "crowded" : "stop" }))}
            />
          </div>

          {/* Alerts */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className={`glass-card rounded-lg p-4 flex items-start gap-3 ${
                  alert.type === "crowded" ? "border-transit-crowded/30" : "border-transit-skip/30"
                }`}>
                  <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${
                    alert.type === "crowded" ? "text-transit-crowded" : "text-transit-skip"
                  }`} />
                  <p className="text-sm">{alert.text}</p>
                </div>
              ))}
            </div>

            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground pt-2">Stop Decisions</h2>
            <div className="space-y-2">
              {stops.map((stop, i) => (
                <div key={i} className="glass-card rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono w-4">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{stop.name}</p>
                      <p className="text-xs text-muted-foreground">{stop.passengers} passengers</p>
                    </div>
                  </div>
                  <StatusBadge status={stop.decision} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
