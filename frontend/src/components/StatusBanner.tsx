import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface StatusBannerProps {
  errorMessage: string | null;
  isLoading: boolean;
  hasNetwork: boolean;
}

export function StatusBanner({
  errorMessage,
  isLoading,
  hasNetwork,
}: StatusBannerProps) {
  if (errorMessage) {
    return (
      <div className="status-banner error">
        <AlertCircle size={18} />
        <span>{errorMessage}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="status-banner muted">
        <Loader2 size={18} className="spin" />
        <span>Syncing with backend...</span>
      </div>
    );
  }

  if (hasNetwork) {
    return (
      <div className="status-banner success">
        <CheckCircle2 size={18} />
        <span>Network generated from current backend data.</span>
      </div>
    );
  }

  return (
    <div className="status-banner muted">
      <span>Click on the map to add clients and poles.</span>
    </div>
  );
}
