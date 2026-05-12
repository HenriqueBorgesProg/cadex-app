import { Radio, User } from "lucide-react";
import { POINT_TYPES } from "../types/domain";
import type { Point } from "../types/domain";

interface PointListProps {
  points: Point[];
}

export function PointList({ points }: PointListProps) {
  const visiblePoints = [...points].reverse().slice(0, 8);

  return (
    <section className="panel point-list" aria-label="Recent points">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Database</p>
          <h2>Recent points</h2>
        </div>
        <strong>{points.length}</strong>
      </div>

      {visiblePoints.length > 0 ? (
        <ul>
          {visiblePoints.map((point) => (
            <li key={point.id}>
              <span
                className={
                  point.type === POINT_TYPES.Client
                    ? "point-kind client"
                    : "point-kind pole"
                }
              >
                {point.type === POINT_TYPES.Client ? (
                  <User size={15} />
                ) : (
                  <Radio size={15} />
                )}
              </span>
              <div>
                <strong>{point.type === POINT_TYPES.Client ? "Client" : "Pole"}</strong>
                <p>
                  {point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-state">No points registered yet.</p>
      )}
    </section>
  );
}
