import { ControlPanel } from "../components/ControlPanel";
import { MapView } from "../components/MapView";
import { MetricsPanel } from "../components/MetricsPanel";
import { PointList } from "../components/PointList";
import { StatusBanner } from "../components/StatusBanner";
import { useNetworkOptimizer } from "../hooks/useNetworkOptimizer";
import "../styles/app.css";

export function NetworkOptimizerPage() {
  const optimizer = useNetworkOptimizer();

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <header className="app-header">
          <p className="eyebrow">Cadex</p>
          <h1>Network Optimizer</h1>
        </header>

        <ControlPanel
          selectedType={optimizer.selectedType}
          pendingPoint={optimizer.pendingPoint}
          isSavingPoint={optimizer.isSavingPoint}
          isGeneratingNetwork={optimizer.isGeneratingNetwork}
          isLoadingPoints={optimizer.isLoadingPoints}
          onTypeChange={optimizer.setSelectedType}
          onSavePoint={optimizer.savePendingPoint}
          onCancelPoint={optimizer.cancelPendingPoint}
          onGenerateNetwork={optimizer.runNetworkGeneration}
          onRefreshPoints={optimizer.refreshPoints}
        />

        <MetricsPanel
          totalPoints={optimizer.points.length}
          clients={optimizer.pointTotals.clients}
          poles={optimizer.pointTotals.poles}
          network={optimizer.network}
        />

        <PointList points={optimizer.points} />
      </aside>

      <section className="workspace">
        <StatusBanner
          errorMessage={optimizer.errorMessage}
          isLoading={
            optimizer.isLoadingPoints ||
            optimizer.isSavingPoint ||
            optimizer.isGeneratingNetwork
          }
          hasNetwork={optimizer.network.connections.length > 0}
        />
        <MapView
          points={optimizer.points}
          pendingPoint={optimizer.pendingPoint}
          connections={optimizer.connectionSegments}
          onMapClick={optimizer.selectPendingPoint}
        />
      </section>
    </main>
  );
}
