import { Bus, Users, MapPin, Shield, Globe, TrendingUp, Leaf } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api, type SystemStats, type City } from '@/lib/api';
import { useCity } from '@/context/CityContext';

const roles = [
  { title: 'Driver', description: 'View route, stops, passenger counts, optimised route on live map', icon: Bus, path: '/driver', gradient: 'from-blue-500 to-blue-700' },
  { title: 'Passenger', description: 'Scan QR at any stop, join queue, track bus arrival & CO₂ saved', icon: Users, path: '/passenger', gradient: 'from-green-500 to-green-700' },
  { title: 'Bus Stop', description: 'Live display — crowd level, next bus ETA, real passenger queue', icon: MapPin, path: '/bus-stop', gradient: 'from-amber-500 to-amber-700' },
  { title: 'RTC Admin', description: 'All buses & routes across all cities, crowd analytics, CO₂ charts', icon: Shield, path: '/admin', gradient: 'from-red-500 to-red-700' },
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
          Real-time transit management across India — {stats?.totalCities ?? '...'} cities, {stats?.totalRoutes ?? '...'} routes, {stats?.totalBuses ?? '...'} buses
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
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {roles.map(role => (
            <Link
              key={role.path}
              to={role.path}
              className="glass-card rounded-xl p-6 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display font-bold text-lg mb-1">{role.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* City quick-select */}
      {stats?.cityStats && (
        <div className="max-w-4xl mx-auto px-4 pb-10">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Jump to a City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.cityStats.map(city => (
              <button
                key={city.id}
                data-testid={`city-card-${city.id}`}
                onClick={() => selectCityAndGo(city, '/admin')}
                className="glass-card rounded-xl p-3 text-left hover:border-primary/30 hover:shadow-sm transition-all group"
              >
                <p className="font-display font-bold text-sm group-hover:text-primary transition-colors">{city.name}</p>
                <p className="text-xs text-muted-foreground">{city.system}</p>
                <div className="mt-2 space-y-0.5">
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
