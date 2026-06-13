import {
  CheckCircle2,
  Loader2,
  Network,
  Radio,
  RefreshCw,
  Route,
  User,
  X,
} from "lucide-react";
import { POINT_TYPES } from "../types/domain";
import type {
  PendingPoint,
  Point,
  PointType,
  RoutePreviewResult,
} from "../types/domain";

interface ControlPanelProps {
  selectedType: PointType;
  pendingPoint: PendingPoint | null;
  isSavingPoint: boolean;
  isGeneratingNetwork: boolean;
  isGeneratingRoutePreview: boolean;
  isLoadingPoints: boolean;
  isRoutePlanningMode: boolean;
  routeOriginPoint: Point | null;
  routeDestinationPoint: Point | null;
  routePreview: RoutePreviewResult | null;
  onTypeChange: (type: PointType) => void;
  onSavePoint: () => void;
  onCancelPoint: () => void;
  onGenerateNetwork: () => void;
  onStartRoutePlanning: () => void;
  onCancelRoutePlanning: () => void;
  onGenerateRoutePreview: () => void;
  onRefreshPoints: () => void;
}

export function ControlPanel({
  selectedType,
  pendingPoint,
  isSavingPoint,
  isGeneratingNetwork,
  isGeneratingRoutePreview,
  isLoadingPoints,
  isRoutePlanningMode,
  routeOriginPoint,
  routeDestinationPoint,
  routePreview,
  onTypeChange,
  onSavePoint,
  onCancelPoint,
  onGenerateNetwork,
  onStartRoutePlanning,
  onCancelRoutePlanning,
  onGenerateRoutePreview,
  onRefreshPoints,
}: ControlPanelProps) {
  return (
    <section className="panel control-panel" aria-label="Map controls">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Operations</p>
          <h2>Network setup</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          onClick={onRefreshPoints}
          disabled={isLoadingPoints}
          title="Refresh points"
          aria-label="Refresh points"
        >
          <RefreshCw size={18} className={isLoadingPoints ? "spin" : ""} />
        </button>
      </div>

      <div className="field-group">
        <label>Point type</label>
        <div className="segmented-control">
          <button
            className={selectedType === POINT_TYPES.Client ? "active" : ""}
            type="button"
            onClick={() => onTypeChange(POINT_TYPES.Client)}
          >
            <User size={16} />
            Client
          </button>
          <button
            className={selectedType === POINT_TYPES.Pole ? "active" : ""}
            type="button"
            onClick={() => onTypeChange(POINT_TYPES.Pole)}
          >
            <Radio size={16} />
            Pole
          </button>
        </div>
      </div>

      <div className="pending-box">
        <p className="eyebrow">Selected coordinate</p>
        {pendingPoint ? (
          <>
            <strong>
              {pendingPoint.latitude.toFixed(5)},{" "}
              {pendingPoint.longitude.toFixed(5)}
            </strong>
            <div className="button-row">
              <button
                className="primary-button"
                type="button"
                onClick={onSavePoint}
                disabled={isSavingPoint}
              >
                {isSavingPoint ? (
                  <Loader2 size={17} className="spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                Save point
              </button>
              <button
                className="icon-button"
                type="button"
                onClick={onCancelPoint}
                title="Cancel selected point"
                aria-label="Cancel selected point"
              >
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <span>Click the map to choose a location.</span>
        )}
      </div>

      <button
        className="primary-button full-width"
        type="button"
        onClick={onGenerateNetwork}
        disabled={isGeneratingNetwork || isRoutePlanningMode}
      >
        {isGeneratingNetwork ? (
          <Loader2 size={18} className="spin" />
        ) : (
          <Network size={18} />
        )}
        Generate network
      </button>

      <div className="planning-box">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Planning</p>
            <h2>Route preview</h2>
          </div>
          {isRoutePlanningMode ? (
            <button
              className="icon-button"
              type="button"
              onClick={onCancelRoutePlanning}
              title="Cancel route planning"
              aria-label="Cancel route planning"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>

        {isRoutePlanningMode ? (
          <>
            <div className="route-selection-grid">
              <RoutePointSummary label="Origin" point={routeOriginPoint} />
              <RoutePointSummary
                label="Destination"
                point={routeDestinationPoint}
              />
            </div>
            <span className="helper-text">
              Click two existing points on the map, then generate the simulation.
            </span>
            <button
              className="primary-button full-width"
              type="button"
              onClick={onGenerateRoutePreview}
              disabled={
                isGeneratingRoutePreview ||
                !routeOriginPoint ||
                !routeDestinationPoint
              }
            >
              {isGeneratingRoutePreview ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Route size={18} />
              )}
              Generate simulation
            </button>
            {routePreview ? <RoutePreviewSummary preview={routePreview} /> : null}
          </>
        ) : (
          <button
            className="secondary-button full-width"
            type="button"
            onClick={onStartRoutePlanning}
          >
            <Route size={18} />
            Plan route
          </button>
        )}
      </div>
    </section>
  );
}

function RoutePointSummary({ label, point }: { label: string; point: Point | null }) {
  return (
    <div className="route-point-summary">
      <p>{label}</p>
      <strong>{point ? formatPointLabel(point) : "Not selected"}</strong>
    </div>
  );
}

function RoutePreviewSummary({ preview }: { preview: RoutePreviewResult }) {
  return (
    <div className="route-preview-summary">
      <p>
        Distance: <strong>{formatDistance(preview.distanceMeters)}</strong>
      </p>
      <p>
        Suggested poles: <strong>{preview.poleCount}</strong>
      </p>
      <p>
        Estimated cost: <strong>{formatCurrency(preview.totalEstimatedCost)}</strong>
      </p>
    </div>
  );
}

function formatPointLabel(point: Point): string {
  const prefix = point.type === POINT_TYPES.Client ? "Client" : "Pole";
  return `${prefix} ${point.id.slice(0, 8)}`;
}

function formatDistance(distance: number): string {
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(2)} km`;
  }

  return `${distance.toFixed(0)} m`;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
