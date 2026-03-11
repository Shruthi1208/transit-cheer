import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe } from 'lucide-react';
import { api, type City } from '@/lib/api';
import { useCity } from '@/context/CityContext';

export default function CitySelector({ compact = false }: { compact?: boolean }) {
  const { selectedCity, setSelectedCity } = useCity();
  const { data: cities = [] } = useQuery<City[]>({
    queryKey: ['/api/cities'],
    queryFn: api.getCities,
    staleTime: Infinity,
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <select
          value={selectedCity?.id ?? ''}
          onChange={e => {
            const city = cities.find(c => c.id === e.target.value) ?? null;
            setSelectedCity(city);
          }}
          className="text-xs bg-transparent border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          data-testid="city-select-compact"
        >
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name} ({c.system})</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5" /> Select City
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          data-testid="city-all"
          onClick={() => setSelectedCity(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
            !selectedCity ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-card hover:border-primary/40'
          }`}
        >
          <Globe className="w-3 h-3" /> All Cities
        </button>
        {cities.map(city => (
          <button
            key={city.id}
            data-testid={`city-btn-${city.id}`}
            onClick={() => setSelectedCity(city)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
              selectedCity?.id === city.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border bg-card hover:border-primary/40'
            }`}
          >
            <MapPin className="w-3 h-3" />
            {city.name}
            <span className="opacity-60">{city.system}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
