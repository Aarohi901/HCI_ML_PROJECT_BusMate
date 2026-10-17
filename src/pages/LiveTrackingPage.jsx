import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import { getAllBuses } from '../services/busSearchService.js';
import SimulatedBadge from '../components/ui/SimulatedBadge.jsx';

export default function LiveTrackingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const busId = params.get('bus');
  const buses = getAllBuses();
  const bus = buses.find((b) => b.id === busId) || buses[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-3xl font-bold text-main">Live Tracking</h1>
      <SimulatedBadge className="mb-6">Simulated vehicle position for prototype demonstration.</SimulatedBadge>
      <Card title={`Tracking ${bus.id}`} icon={Navigation}>
        <p className="text-lg">
          {bus.routeName} · {bus.from} → {bus.to}
        </p>
        <p className="mt-2 flex items-center gap-2 text-muted">
          <MapPin className="h-5 w-5" aria-hidden="true" />
          Current status: En route — approximately 12 minutes from next stop
        </p>
        <div className="mt-6 h-48 rounded-xl border border-border bg-gradient-to-r from-slate-100 to-slate-50 p-6" role="img" aria-label="Map placeholder showing bus progressing along route">
          <div className="flex h-full items-center justify-center text-muted">Route map placeholder — {bus.id}</div>
        </div>
        <label className="mt-6 block">
          Select bus
          <select
            className="mt-1 w-full max-w-xs rounded-lg border border-border px-3 py-2"
            defaultValue={bus.id}
            onChange={(e) => navigate(`/live-tracking?bus=${e.target.value}`)}
          >
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.departureTime}
              </option>
            ))}
          </select>
        </label>
      </Card>
    </div>
  );
}
