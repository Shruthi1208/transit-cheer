import { useState } from "react";
import { QrCode, Clock, Users, Bus, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";

const PassengerInterface = () => {
  const [waiting, setWaiting] = useState(false);
  const [passengerCount, setPassengerCount] = useState(7);

  const handleWaiting = () => {
    setWaiting(true);
    setPassengerCount(prev => prev + 1);
  };

  const crowdLevel: "low" | "medium" | "high" = passengerCount <= 5 ? "low" : passengerCount <= 15 ? "medium" : "high";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</Link>
          <div className="w-px h-5 bg-border" />
          <QrCode className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-lg">Passenger</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-md flex flex-col items-center justify-center gap-8">
        {/* QR Scan Area */}
        <div className="glass-card rounded-2xl p-8 w-full text-center space-y-4">
          <div className="w-20 h-20 mx-auto rounded-xl transit-gradient flex items-center justify-center">
            <QrCode className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">University Stop</h2>
            <p className="text-sm text-muted-foreground">QR Code Scanned Successfully</p>
          </div>
        </div>

        {/* Waiting Button */}
        {!waiting ? (
          <Button
            onClick={handleWaiting}
            size="lg"
            className="w-full h-14 text-lg font-display font-bold transit-gradient hover:opacity-90 transition-opacity text-primary-foreground rounded-xl"
          >
            <Users className="w-5 h-5 mr-2" />
            I am Waiting
          </Button>
        ) : (
          <div className="w-full glass-card rounded-xl p-5 flex items-center gap-4 border-transit-stop/30 bg-transit-stop/5">
            <CheckCircle className="w-8 h-8 text-transit-stop shrink-0" />
            <div>
              <p className="font-display font-bold text-transit-stop">You're in the queue!</p>
              <p className="text-sm text-muted-foreground">The driver knows you're waiting</p>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4 text-center space-y-1">
            <Clock className="w-5 h-5 mx-auto text-primary" />
            <p className="text-2xl font-display font-bold">4 min</p>
            <p className="text-xs text-muted-foreground">Next Bus Arrival</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center space-y-1">
            <Users className="w-5 h-5 mx-auto text-transit-crowded" />
            <p className="text-2xl font-display font-bold">{passengerCount}</p>
            <p className="text-xs text-muted-foreground">People Waiting</p>
          </div>
        </div>

        {/* Crowd Level */}
        <div className="w-full glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium">Crowd Level</span>
          </div>
          <StatusBadge status={crowdLevel} />
        </div>
      </main>
    </div>
  );
};

export default PassengerInterface;
