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
          isGeneratingRoutePreview={optimizer.isGeneratingRoutePreview}
          isLoadingPoints={optimizer.isLoadingPoints}
          isRoutePlanningMode={optimizer.isRoutePlanningMode}
          routeOriginPoint={optimizer.routeOriginPoint}
          routeDestinationPoint={optimizer.routeDestinationPoint}
          routePreview={optimizer.routePreview}
          onTypeChange={optimizer.setSelectedType}
          onSavePoint={optimizer.savePendingPoint}
          onCancelPoint={optimizer.cancelPendingPoint}
          onGenerateNetwork={optimizer.runNetworkGeneration}
          onStartRoutePlanning={optimizer.startRoutePlanning}
          onCancelRoutePlanning={optimizer.cancelRoutePlanning}
          onGenerateRoutePreview={optimizer.generateRoutePreview}
          onRefreshPoints={optimizer.refreshPoints}
        />

        <MetricsPanel
          totalPoints={optimizer.points.length}
          clients={optimizer.pointTotals.clients}
          poles={optimizer.pointTotals.poles}
          network={optimizer.network}
          routePreview={optimizer.routePreview}
        />

        <PointList points={optimizer.points} />
      </aside>

      <section className="workspace">
        <StatusBanner
          errorMessage={optimizer.errorMessage}
          isLoading={
            optimizer.isLoadingPoints ||
            optimizer.isSavingPoint ||
            optimizer.isGeneratingNetwork ||
            optimizer.isGeneratingRoutePreview
          }
          hasNetwork={
            optimizer.network.connections.length > 0 || Boolean(optimizer.routePreview)
          }
        />
        <MapView
          points={optimizer.points}
          pendingPoint={optimizer.pendingPoint}
          connections={optimizer.connectionSegments}
          routePreview={optimizer.routePreview}
          selectedRoutePointIds={{
            originPointId: optimizer.routeOriginPointId,
            destinationPointId: optimizer.routeDestinationPointId,
          }}
          onMapClick={optimizer.selectPendingPoint}
          onPointClick={optimizer.selectRoutePoint}
        />
      </section>
    </main>
  );
}
