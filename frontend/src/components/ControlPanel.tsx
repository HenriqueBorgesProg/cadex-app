import {
  CheckCircle2,
  Loader2,
  Network,
  Radio,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { POINT_TYPES } from "../types/domain";
import type { PendingPoint, PointType } from "../types/domain";

interface ControlPanelProps {
  selectedType: PointType;
  pendingPoint: PendingPoint | null;
  isSavingPoint: boolean;
  isGeneratingNetwork: boolean;
  isLoadingPoints: boolean;
  onTypeChange: (type: PointType) => void;
  onSavePoint: () => void;
  onCancelPoint: () => void;
  onGenerateNetwork: () => void;
  onRefreshPoints: () => void;
}

export function ControlPanel({
  selectedType,
  pendingPoint,
  isSavingPoint,
  isGeneratingNetwork,
  isLoadingPoints,
  onTypeChange,
  onSavePoint,
  onCancelPoint,
  onGenerateNetwork,
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
        disabled={isGeneratingNetwork}
      >
        {isGeneratingNetwork ? (
          <Loader2 size={18} className="spin" />
        ) : (
          <Network size={18} />
        )}
        Generate network
      </button>
    </section>
  );
}
