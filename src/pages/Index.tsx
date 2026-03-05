import { Bus, Users, MapPin, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const roles = [
  {
    title: "Driver",
    description: "View route, stops, passenger counts, and STOP/SKIP decisions",
    icon: Bus,
    path: "/driver",
    gradient: "from-primary to-primary/70",
  },
  {
    title: "Passenger",
    description: "Scan QR, join the queue, and track your bus arrival",
    icon: Users,
    path: "/passenger",
    gradient: "from-transit-stop to-transit-stop/70",
  },
  {
    title: "Bus Stop",
    description: "Live display showing stop info, crowd level, and next bus",
    icon: MapPin,
    path: "/bus-stop",
    gradient: "from-transit-crowded to-transit-crowded/70",
  },
  {
    title: "RTC Admin",
    description: "Monitor all buses, crowded stops, and optimize routes",
    icon: Shield,
    path: "/admin",
    gradient: "from-transit-skip to-transit-skip/70",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 space-y-3">
        <div className="w-16 h-16 mx-auto rounded-2xl transit-gradient flex items-center justify-center mb-6">
          <Bus className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">
          Smart RTC Bus
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Intelligent transit management with real-time tracking and route optimization
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {roles.map((role) => (
          <Link
            key={role.path}
            to={role.path}
            className="glass-card rounded-xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
              <role.icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="font-display font-bold text-lg mb-1">{role.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Index;
