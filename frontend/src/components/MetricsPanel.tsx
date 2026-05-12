import { Activity, MapPin, Radio, Route, User } from "lucide-react";
import type { NetworkResult } from "../types/domain";

interface MetricsPanelProps {
  totalPoints: number;
  clients: number;
  poles: number;
  network: NetworkResult;
}

export function MetricsPanel({
  totalPoints,
  clients,
  poles,
  network,
}: MetricsPanelProps) {
  const averageDistance =
    network.connections.length > 0
      ? network.totalDistance / network.connections.length
      : 0;

  return (
    <section className="metrics-grid" aria-label="Network metrics">
      <MetricItem
        icon={<MapPin size={18} />}
        label="Points"
        value={String(totalPoints)}
      />
      <MetricItem icon={<User size={18} />} label="Clients" value={String(clients)} />
      <MetricItem icon={<Radio size={18} />} label="Poles" value={String(poles)} />
      <MetricItem
        icon={<Route size={18} />}
        label="Connections"
        value={String(network.connections.length)}
      />
      <MetricItem
        icon={<Activity size={18} />}
        label="Total distance"
        value={formatDistance(network.totalDistance)}
      />
      <MetricItem
        icon={<Route size={18} />}
        label="Avg distance"
        value={formatDistance(averageDistance)}
      />
    </section>
  );
}

function MetricItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="metric-item">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function formatDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }

  return `${distance.toFixed(0)} m`;
}
