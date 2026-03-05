import { MapPin } from "lucide-react";

interface MapPlaceholderProps {
  title?: string;
  className?: string;
  stops?: Array<{ name: string; status: "stop" | "skip" | "crowded" | "current" }>;
}

const MapPlaceholder = ({ title = "Route Map", className = "", stops }: MapPlaceholderProps) => {
  return (
    <div className={`relative rounded-lg overflow-hidden border border-border bg-muted/30 ${className}`}>
      <div className="absolute top-3 left-3 z-10 bg-card/90 backdrop-blur-sm rounded-md px-3 py-1.5 text-sm font-display font-semibold">
        {title}
      </div>
      
      {/* Simulated map grid */}
      <div className="w-full h-full min-h-[300px] relative">
        <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
          {/* Grid lines */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={i * 15} x2="400" y2={i * 15} stroke="hsl(220 15% 85%)" strokeWidth="0.5" opacity="0.3" />
          ))}
          {Array.from({ length: 27 }).map((_, i) => (
            <line key={`v${i}`} x1={i * 15} y1="0" x2={i * 15} y2="300" stroke="hsl(220 15% 85%)" strokeWidth="0.5" opacity="0.3" />
          ))}
          
          {/* Route path */}
          <path d="M 50 250 Q 100 200 150 180 T 200 130 T 280 100 T 350 60" fill="none" stroke="hsl(220 70% 45%)" strokeWidth="3" strokeDasharray="8 4" />
          
          {/* Bus icon */}
          <circle cx="200" cy="130" r="8" fill="hsl(220 70% 45%)" className="animate-pulse-dot" />
          <circle cx="200" cy="130" r="4" fill="white" />
        </svg>

        {/* Stop markers overlay */}
        {stops && (
          <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded px-2 py-1 text-xs">
                <span className={`w-2 h-2 rounded-full ${
                  stop.status === "stop" ? "bg-transit-stop" :
                  stop.status === "skip" ? "bg-transit-skip" :
                  stop.status === "crowded" ? "bg-transit-crowded" :
                  "bg-primary"
                }`} />
                <span className="font-medium">{stop.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPlaceholder;
