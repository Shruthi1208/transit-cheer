import { useState } from 'react';
import { IndianRupee, Leaf, MapPin, ArrowRight, TrendingDown, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import CitySelector from '@/components/CitySelector';
import { api, type FareResult, type Route } from '@/lib/api';
import { useCity } from '@/context/CityContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FARE_COLORS: Record<string, string> = {
  bus: '#10B981', auto: '#F59E0B', cab: '#EF4444', eRick: '#3B82F6',
};

export default function FareCalculator() {
  const { selectedCity } = useCity();
  const [fromStopId, setFromStopId] = useState('');
  const [toStopId, setToStopId] = useState('');
  const [result, setResult] = useState<FareResult | null>(null);

  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['/api/routes', selectedCity?.id ?? 'all'],
    queryFn: () => api.getRoutes(selectedCity?.id),
    staleTime: 60000,
  });

  const allStops = routes.flatMap(r => r.stops.map(s => ({ ...s, routeName: r.name, cityId: r.cityId, routeId: r.id, color: r.color })));
  const uniqueStops = allStops.filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i);

  const mutation = useMutation({
    mutationFn: () => api.calculateFare(fromStopId, toStopId),
    onSuccess: setResult,
  });

  function swapStops() {
    const tmp = fromStopId;
    setFromStopId(toStopId);
    setToStopId(tmp);
    setResult(null);
  }

  const fareEntries = result ? Object.entries(result.fares) : [];
  const chartData = fareEntries.map(([key, f]) => ({ name: `${f.icon} ${f.label}`, amount: f.amount, key }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <IndianRupee className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">Fare Calculator</h1>
          </div>
          <CitySelector compact />
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5 max-w-3xl">
        {/* Selectors */}
        <div className="glass-card rounded-xl p-5 space-y-4">
          <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Calculate Fare Between Stops</h2>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> From Stop
              </label>
              <select data-testid="from-stop-select" value={fromStopId} onChange={e => { setFromStopId(e.target.value); setResult(null); }}
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select origin stop…</option>
                {uniqueStops.map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.routeName}</option>
                ))}
              </select>
            </div>

            <button onClick={swapStops} className="sm:mb-0.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm self-center">
              ⇄
            </button>

            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> To Stop
              </label>
              <select data-testid="to-stop-select" value={toStopId} onChange={e => { setToStopId(e.target.value); setResult(null); }}
                className="w-full h-9 rounded-lg border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select destination stop…</option>
                {uniqueStops.filter(s => s.id !== fromStopId).map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.routeName}</option>
                ))}
              </select>
            </div>

            <Button data-testid="btn-calc-fare" onClick={() => mutation.mutate()}
              disabled={!fromStopId || !toStopId || mutation.isPending}
              className="transit-gradient text-primary-foreground font-display font-bold sm:mb-0.5 whitespace-nowrap">
              {mutation.isPending ? 'Calculating…' : 'Calculate Fare'}
            </Button>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
              No direct route connects these stops. Try stops on the same route.
            </p>
          )}
        </div>

        {result && (
          <>
            {/* Journey info */}
            <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-3" style={{ borderColor: result.route.color + '40' }}>
              <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium">{result.fromStop.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="text-sm font-medium">{result.toStop.name}</span>
                </div>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground shrink-0">
                <span><b className="text-foreground">{result.distanceKm} km</b></span>
                <span><b className="text-foreground">{result.stops}</b> stops</span>
                <span style={{ color: result.route.color }} className="font-medium">{result.route.name}</span>
                <span>{result.city.name}</span>
              </div>
            </div>

            {/* Fare cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {fareEntries.map(([key, fare]) => (
                <div key={key} data-testid={`fare-card-${key}`}
                  className={`glass-card rounded-xl p-4 text-center space-y-2 ${key === 'bus' ? 'border-green-300/50 bg-green-50/30 dark:bg-green-950/20' : ''}`}>
                  <p className="text-2xl">{fare.icon}</p>
                  <p className="font-display font-bold text-2xl">₹{fare.amount}</p>
                  <p className="text-xs text-muted-foreground">{fare.label}</p>
                  <p className="text-xs" style={{ color: FARE_COLORS[key] ?? '#6B7280' }}>{fare.co2Kg} kg CO₂</p>
                  {key === 'bus' && <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400 rounded-full">Cheapest</span>}
                </div>
              ))}
            </div>

            {/* Savings banner */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="glass-card rounded-xl p-4 text-center border-green-200/50 bg-green-50/30 dark:bg-green-950/20">
                <TrendingDown className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="font-display font-bold text-xl text-green-700 dark:text-green-400">₹{result.savings.vsCab}</p>
                <p className="text-xs text-muted-foreground">Saved vs Cab this trip</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border-green-200/50 bg-green-50/30 dark:bg-green-950/20">
                <Calendar className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="font-display font-bold text-xl text-blue-700 dark:text-blue-400">₹{result.savings.yearlyVsCab.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Yearly savings vs Cab (2 trips/day)</p>
              </div>
              <div className="glass-card rounded-xl p-4 text-center border-green-200/50 bg-green-50/30 dark:bg-green-950/20">
                <Leaf className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="font-display font-bold text-xl text-green-700 dark:text-green-400">{result.savings.co2SavedVsCab} kg</p>
                <p className="text-xs text-muted-foreground">CO₂ saved vs Cab per trip</p>
              </div>
            </div>

            {/* Chart */}
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">Fare Comparison</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                  <Tooltip formatter={(v: number) => [`₹${v}`, 'Fare']} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {chartData.map((e) => <Cell key={e.key} fill={FARE_COLORS[e.key] ?? '#94A3B8'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2">
                {fareEntries.map(([key, fare]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: FARE_COLORS[key] ?? '#94A3B8' }} />
                    <span>{fare.label}: {fare.co2Kg} kg CO₂</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {!result && !mutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl transit-gradient flex items-center justify-center">
              <IndianRupee className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">Select two stops on the same route to compare bus, auto, cab and e-rickshaw fares</p>
          </div>
        )}
      </main>
    </div>
  );
}
