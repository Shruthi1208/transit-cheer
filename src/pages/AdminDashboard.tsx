import { Shield, Bus, MapPin, AlertTriangle, Users, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import MapPlaceholder from "@/components/MapPlaceholder";

const activeBuses = [
  { id: "#42", route: "Route 5", driver: "A. Kumar", passengers: 34, status: "on-time" },
  { id: "#17", route: "Route 3", driver: "S. Patel", passengers: 22, status: "delayed" },
  { id: "#08", route: "Route 1", driver: "R. Singh", passengers: 45, status: "on-time" },
];

const crowdedStops = [
  { name: "University", passengers: 28, level: "high" as const },
  { name: "Central Station", passengers: 18, level: "medium" as const },
  { name: "Mall Junction", passengers: 22, level: "high" as const },
  { name: "Hospital", passengers: 8, level: "low" as const },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
            <div className="w-px h-5 bg-border" />
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">RTC Admin</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>Live System</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Bus} title="Active Buses" value={3} subtitle="All operational" variant="stop" />
          <StatCard icon={MapPin} title="Total Stops" value={24} subtitle="12 routes" />
          <StatCard icon={AlertTriangle} title="Crowded Stops" value={2} subtitle="Needs attention" variant="crowded" />
          <StatCard icon={Users} title="Total Passengers" value={76} subtitle="Currently waiting" />
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Map */}
          <div className="lg:col-span-3">
            <MapPlaceholder
              title="Route Optimization"
              className="h-[420px]"
              stops={crowdedStops.map(s => ({ name: s.name, status: s.level === "high" ? "crowded" : s.level === "medium" ? "crowded" : "stop" }))}
            />
          </div>

          {/* Crowded Stops */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Crowded Stops</h2>
            <div className="space-y-2">
              {crowdedStops.map((stop, i) => (
                <div key={i} className={`glass-card rounded-lg px-4 py-3 flex items-center justify-between ${
                  stop.level === "high" ? "border-transit-crowded/30" : ""
                }`}>
                  <div className="flex items-center gap-3">
                    <MapPin className={`w-4 h-4 ${
                      stop.level === "high" ? "text-transit-high" : stop.level === "medium" ? "text-transit-medium" : "text-transit-low"
                    }`} />
                    <div>
                      <p className="text-sm font-medium">{stop.name}</p>
                      <p className="text-xs text-muted-foreground">{stop.passengers} waiting</p>
                    </div>
                  </div>
                  <StatusBadge status={stop.level} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Buses Table */}
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Active Buses</h2>
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Bus</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Route</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Driver</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Passengers</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeBuses.map((bus, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-3 text-sm font-display font-semibold">{bus.id}</td>
                      <td className="px-4 py-3 text-sm">{bus.route}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{bus.driver}</td>
                      <td className="px-4 py-3 text-sm">{bus.passengers}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          bus.status === "on-time" ? "text-transit-stop" : "text-transit-crowded"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            bus.status === "on-time" ? "bg-transit-stop" : "bg-transit-crowded"
                          }`} />
                          {bus.status === "on-time" ? "On Time" : "Delayed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
