import { MapPin, Users, Clock, Bus } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";

const BusStopScreen = () => {
  const stopData = {
    name: "University",
    passengerCount: 28,
    nextBusArrival: "4 min",
    busNumber: "#42",
    route: "Route 5",
  };

  const crowdLevel: "low" | "medium" | "high" = stopData.passengerCount <= 5 ? "low" : stopData.passengerCount <= 15 ? "medium" : "high";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
          <div className="w-px h-5 bg-border" />
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-lg">Bus Stop Display</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-lg flex flex-col items-center justify-center gap-6">
        {/* Stop Name */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full transit-gradient flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display font-bold text-3xl">{stopData.name}</h2>
          <p className="text-muted-foreground text-sm">Bus Stop</p>
        </div>

        {/* Main Stats */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-6 text-center space-y-2">
            <Users className="w-6 h-6 mx-auto text-transit-crowded" />
            <p className="text-4xl font-display font-bold">{stopData.passengerCount}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Passengers Waiting</p>
          </div>
          <div className="glass-card rounded-xl p-6 text-center space-y-2">
            <Clock className="w-6 h-6 mx-auto text-primary" />
            <p className="text-4xl font-display font-bold">{stopData.nextBusArrival}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Next Bus</p>
          </div>
        </div>

        {/* Bus Info */}
        <div className="w-full glass-card rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Bus {stopData.busNumber}</p>
              <p className="text-xs text-muted-foreground">{stopData.route}</p>
            </div>
          </div>
          <StatusBadge status={crowdLevel} />
        </div>

        {/* Crowd Bar */}
        <div className="w-full glass-card rounded-xl p-5 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Crowd Level</p>
          <div className="flex gap-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 rounded-full transition-colors ${
                  i < Math.min(Math.ceil(stopData.passengerCount / 3), 10)
                    ? stopData.passengerCount > 20 ? "bg-transit-high" : stopData.passengerCount > 10 ? "bg-transit-medium" : "bg-transit-low"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>Medium</span>
            <span>High</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusStopScreen;
