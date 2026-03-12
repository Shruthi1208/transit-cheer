import { Award, TrendingUp, Bus, Leaf, Users, BarChart2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend, AreaChart, Area,
} from 'recharts';
import CitySelector from '@/components/CitySelector';
import StatusBadge from '@/components/StatusBadge';
import { api, type AnalyticsData } from '@/lib/api';
import { useCity } from '@/context/CityContext';
import { Button } from '@/components/ui/button';

function OTPBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? '#10B981' : pct >= 80 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold w-9 text-right" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function Analytics() {
  const queryClient = useQueryClient();
  const { selectedCity } = useCity();

  const { data, isFetching } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics', selectedCity?.id ?? 'all'],
    queryFn: () => api.getAnalytics(selectedCity?.id),
    refetchInterval: 30000,
  });

  const s = data?.summary;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm shrink-0">← Back</Link>
            <div className="w-px h-5 bg-border shrink-0" />
            <BarChart2 className="w-5 h-5 text-primary shrink-0" />
            <h1 className="font-display font-bold text-lg truncate">OTP & Analytics</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <CitySelector compact />
            <Button variant="ghost" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/analytics'] })} disabled={isFetching} className="h-8 px-2">
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Summary KPIs */}
        {s && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { icon: Users, label: 'Weekly Passengers', value: s.totalPassengers.toLocaleString(), color: 'text-primary' },
              { icon: Bus, label: 'Total Trips', value: s.totalTrips.toLocaleString(), color: 'text-blue-600' },
              { icon: Award, label: 'Avg OTP', value: `${s.avgOTP}%`, color: s.avgOTP >= 90 ? 'text-green-600' : s.avgOTP >= 80 ? 'text-amber-600' : 'text-red-600' },
              { icon: Leaf, label: 'CO₂ Saved (kg)', value: s.totalCO2Saved.toLocaleString(), color: 'text-green-600' },
              { icon: TrendingUp, label: 'Active Routes', value: s.activeRoutes, color: 'text-purple-600' },
              { icon: Bus, label: 'Active Buses', value: s.activeBuses, color: 'text-transit-stop' },
            ].map(k => (
              <div key={k.label} className="glass-card rounded-xl p-4 text-center">
                <k.icon className={`w-5 h-5 mx-auto mb-1.5 ${k.color}`} />
                <p className={`font-display font-bold text-xl ${k.color}`}>{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly ridership */}
          {data?.weeklyRidership && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" /> Weekly Ridership
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data.weeklyRidership} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="riderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Passengers']} />
                  <Area type="monotone" dataKey="passengers" stroke="#3B82F6" strokeWidth={2} fill="url(#riderGrad)" name="Passengers" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hourly distribution */}
          {data?.hourlyDist && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Hourly Demand Pattern
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.hourlyDist.filter((_, i) => i % 2 === 0)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Passengers']} />
                  <Bar dataKey="passengers" radius={[3, 3, 0, 0]}>
                    {data.hourlyDist.filter((_, i) => i % 2 === 0).map((e) => (
                      <Cell key={e.hour} fill={e.passengers > 600 ? '#EF4444' : e.passengers > 300 ? '#F59E0B' : '#10B981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Route OTP */}
          {data?.routeOTP && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" /> On-Time Performance by Route
              </h2>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {[...data.routeOTP].sort((a, b) => b.otpPct - a.otpPct).map(r => (
                  <div key={r.routeId} data-testid={`otp-route-${r.routeId}`} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                        <span className="text-xs font-medium truncate">{r.routeName}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{r.cityName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground">{r.passengersToday} pax</span>
                        <span className="text-xs text-muted-foreground">{r.tripsToday} trips</span>
                        {r.avgDelayMin > 0 && <span className="text-xs text-amber-600">+{r.avgDelayMin}min</span>}
                      </div>
                    </div>
                    <OTPBar pct={r.otpPct} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Driver Scorecard */}
          {data?.driverPerf && (
            <div className="glass-card rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" /> Driver Scorecard
              </h2>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {[...data.driverPerf].sort((a, b) => b.score - a.score).map((d, i) => (
                  <div key={d.busId} data-testid={`driver-score-${d.busId}`}
                    className={`glass-card rounded-lg px-3 py-2 flex items-center gap-3 ${i === 0 ? 'border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/20' : ''}`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-xs"
                      style={{ background: d.score >= 90 ? '#10B981' : d.score >= 80 ? '#F59E0B' : '#EF4444', color: 'white' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium leading-tight">{d.driver}</p>
                        <span className="text-xs text-muted-foreground">{d.busNumber}</span>
                        {d.incidentsToday > 0 && <span className="text-xs text-red-500 font-bold">⚠ incident</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{d.routeName} · {d.cityName} · {d.tripsCompleted} trips · {d.passengersServed} pax</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-base"
                        style={{ color: d.score >= 90 ? '#10B981' : d.score >= 80 ? '#F59E0B' : '#EF4444' }}>
                        {d.score}
                      </p>
                      <p className="text-xs text-muted-foreground">{d.otpPct}% OTP</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* City breakdown */}
        {data?.cityBreakdown && data.cityBreakdown.length > 1 && (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground">City-wise Performance</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30">
                    {['City', 'System', 'Routes', 'Buses', 'Stops', 'Weekly Riders', 'CO₂ Saved', 'Avg OTP', 'Now Waiting'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...data.cityBreakdown].sort((a, b) => b.ridership - a.ridership).map((c, i) => (
                    <tr key={c.id} className={`border-t border-border/50 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                      <td className="px-4 py-2.5 font-bold">{c.name}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{c.system}</td>
                      <td className="px-4 py-2.5">{c.routes}</td>
                      <td className="px-4 py-2.5">{c.buses}</td>
                      <td className="px-4 py-2.5">{c.stops}</td>
                      <td className="px-4 py-2.5 font-medium">{c.ridership.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-green-600 font-medium">{c.co2Saved.toLocaleString()} kg</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${c.avgOTP}%`, background: c.avgOTP >= 90 ? '#10B981' : '#F59E0B' }} />
                          </div>
                          <span className="text-xs font-bold" style={{ color: c.avgOTP >= 90 ? '#10B981' : '#F59E0B' }}>{c.avgOTP}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-transit-crowded font-medium">{c.currentWaiting}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Weekly CO₂ */}
        {data?.weeklyRidership && (
          <div className="glass-card rounded-xl p-5 space-y-3">
            <h2 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-500" /> Weekly CO₂ Saved vs Cars (kg)
            </h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data.weeklyRidership} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'CO₂ Saved']} />
                <Bar dataKey="co2Saved" fill="#10B981" radius={[4, 4, 0, 0]} name="CO₂ Saved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </main>
    </div>
  );
}
