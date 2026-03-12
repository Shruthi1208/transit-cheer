import { Bus, Users, MapPin, Shield, Globe, Map, Activity, ArrowRight, IndianRupee, Navigation, BarChart2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type SystemStats, type City } from '@/lib/api';
import { useCity } from '@/context/CityContext';

const ROLES = [
  { title: 'Driver', description: 'Live route, STOP/SKIP engine, optimised routing from any coordinates', icon: Bus, path: '/driver', gradient: 'from-blue-500 to-blue-700' },
  { title: 'Passenger', description: 'Scan QR at any stop, join queue, track ETA & CO₂ saved vs car', icon: Users, path: '/passenger', gradient: 'from-green-500 to-green-700' },
  { title: 'Bus Stop', description: 'Live display — crowd level, next bus ETA, real passenger queue', icon: MapPin, path: '/bus-stop', gradient: 'from-amber-500 to-amber-700' },
  { title: 'RTC Admin', description: 'All buses & routes across all cities, crowd analytics, CO₂ charts', icon: Shield, path: '/admin', gradient: 'from-red-500 to-red-700' },
];

const FEATURES = [
  { title: 'Trip Planner', description: 'Enter origin & destination coordinates. Find the best bus route with walk times, ETA & CO₂ comparison.', icon: Map, path: '/trip-planner', gradient: 'from-violet-500 to-purple-700', badge: 'New' },
  { title: 'Demand Heatmap', description: 'Live crowd intensity map + time-of-day demand forecasting for all stops across all cities.', icon: Activity, path: '/heatmap', gradient: 'from-pink-500 to-rose-700', badge: 'New' },
  { title: 'Fare Calculator', description: 'Compare bus fare vs auto, cab & e-rickshaw for any two stops. See yearly savings and CO₂ difference.', icon: IndianRupee, path: '/fare-calculator', gradient: 'from-emerald-500 to-teal-700', badge: 'New' },
  { title: 'Live Bus Tracker', description: 'Real-time map of all active buses — see positions, occupancy, on-time status updated every 6 seconds.', icon: Navigation, path: '/tracker', gradient: 'from-sky-500 to-blue-700', badge: 'New' },
  { title: 'OTP & Analytics', description: 'On-time performance scorecards, driver rankings, weekly ridership trends and CO₂ saved system-wide.', icon: BarChart2, path: '/analytics', gradient: 'from-orange-500 to-amber-700', badge: 'New' },
];

export default function Index() {
  const navigate = useNavigate();
  const { setSelectedCity } = useCity();

  const { data: stats } = useQuery<SystemStats>({
    queryKey: ['/api/stats'],
    queryFn: api.getStats,
    refetchInterval: 30000,
  });

  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/cities'],
    queryFn: api.getCities,
    staleTime: Infinity,
  });

  function selectCityAndGo(city: City, path: string) {
    setSelectedCity(city);
    navigate(path);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center p-6 pt-12 pb-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl transit-gradient flex items-center justify-center mb-5">
          <Bus className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-2">Smart RTC Bus</h1>
        <p className="text-muted-foreground text-base max-w-lg mx-auto">
          Real-time transit management across India — {stats?.totalCities ?? '…'} cities · {stats?.totalRoutes ?? '…'} routes · {stats?.totalBuses ?? '…'} buses
        </p>
      </div>

      {/* System Stats */}
      {stats && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Globe, label: 'Cities', value: stats.totalCities },
              { icon: Bus, label: 'Active Buses', value: stats.totalBuses },
              { icon: MapPin, label: 'Total Stops', value: stats.totalStops },
              { icon: Users, label: 'Waiting Now', value: stats.totalWaiting },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center">
                <s.icon className="w-5 h-5 mx-auto text-primary mb-1.5" />
                <p className="font-display font-bold text-2xl">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role cards */}
      <div className="max-w-4xl mx-auto px-4 mb-5">
        <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Choose Your Role</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ROLES.map(role => (
            <Link key={role.path} to={role.path}
              className="glass-card rounded-xl p-4 hover:shadow-md hover:border-primary/20 transition-all group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                <role.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-bold text-sm mb-1">{role.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Smart Features */}
      <div className="max-w-4xl mx-auto px-4 mb-7">
        <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Smart Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <Link key={f.path} to={f.path}
              className="glass-card rounded-xl p-5 hover:shadow-md hover:border-primary/20 transition-all group flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-bold text-base">{f.title}</h3>
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-primary/10 text-primary">{f.badge}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      </div>

      {/* City quick-select */}
      {stats?.cityStats && (
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Jump to a City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.cityStats.map(city => (
              <button key={city.id} data-testid={`city-card-${city.id}`}
                onClick={() => selectCityAndGo(city, '/admin')}
                className="glass-card rounded-xl p-3 text-left hover:border-primary/30 hover:shadow-sm transition-all group">
                <p className="font-display font-bold text-sm group-hover:text-primary transition-colors">{city.name}</p>
                <p className="text-xs text-muted-foreground mb-1.5">{city.system}</p>
                <div className="space-y-0.5">
                  <p className="text-xs"><span className="font-medium">{city.activeBuses}</span> <span className="text-muted-foreground">buses</span></p>
                  <p className="text-xs"><span className="font-medium">{city.routes}</span> <span className="text-muted-foreground">routes · {city.stops} stops</span></p>
                  <p className="text-xs text-transit-crowded font-medium">{city.totalWaiting} waiting</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
