import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../services/api";
import { generateNetwork } from "../services/network-service";
import { createPoint, getPoints } from "../services/points-service";
import { previewRoute } from "../services/routes-service";
import { POINT_TYPES } from "../types/domain";
import type {
  ConnectionSegment,
  NetworkResult,
  PendingPoint,
  Point,
  PointType,
  RoutePreviewResult,
} from "../types/domain";

const routePreviewDefaults = {
  poleSpacingMeters: "100",
  cableCostPerMeter: "5",
  poleUnitCost: "250",
};

export type RoutePreviewParameters = typeof routePreviewDefaults;

export function useNetworkOptimizer() {
  const [points, setPoints] = useState<Point[]>([]);
  const [network, setNetwork] = useState<NetworkResult>({
    connections: [],
    totalDistance: 0,
  });
  const [selectedType, setSelectedType] = useState<PointType>(
    POINT_TYPES.Client
  );
  const [pendingPoint, setPendingPoint] = useState<PendingPoint | null>(null);
  const [isRoutePlanningMode, setIsRoutePlanningMode] = useState(false);
  const [routeOriginPointId, setRouteOriginPointId] = useState<string | null>(
    null
  );
  const [routeDestinationPointId, setRouteDestinationPointId] = useState<
    string | null
  >(null);
  const [routePreview, setRoutePreview] = useState<RoutePreviewResult | null>(
    null
  );
  const [routePreviewParameters, setRoutePreviewParameters] =
    useState<RoutePreviewParameters>(routePreviewDefaults);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [isGeneratingNetwork, setIsGeneratingNetwork] = useState(false);
  const [isGeneratingRoutePreview, setIsGeneratingRoutePreview] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasLoadedInitialPoints = useRef(false);

  const loadPoints = useCallback(async () => {
    setIsLoadingPoints(true);
    setErrorMessage(null);

    try {
      const loadedPoints = await getPoints();
      setPoints(loadedPoints);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingPoints(false);
    }
  }, []);

  useEffect(() => {
    if (hasLoadedInitialPoints.current) {
      return;
    }

    hasLoadedInitialPoints.current = true;

    const timeoutId = window.setTimeout(() => {
      void loadPoints();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadPoints]);

  const pointTotals = useMemo(() => {
    return points.reduce(
      (totals, point) => {
        if (point.type === POINT_TYPES.Client) {
          return { ...totals, clients: totals.clients + 1 };
        }

        return { ...totals, poles: totals.poles + 1 };
      },
      { clients: 0, poles: 0 }
    );
  }, [points]);

  const connectionSegments = useMemo<ConnectionSegment[]>(() => {
    return network.connections.flatMap((connection) => {
      const client = points.find((point) => point.id === connection.clientId);
      const pole = points.find((point) => point.id === connection.poleId);

      if (!client || !pole) {
        return [];
      }

      return [{ ...connection, client, pole }];
    });
  }, [network.connections, points]);

  const routeOriginPoint = useMemo(() => {
    return points.find((point) => point.id === routeOriginPointId) ?? null;
  }, [points, routeOriginPointId]);

  const routeDestinationPoint = useMemo(() => {
    return points.find((point) => point.id === routeDestinationPointId) ?? null;
  }, [points, routeDestinationPointId]);

  const selectPendingPoint = useCallback((point: PendingPoint) => {
    if (isRoutePlanningMode) {
      setErrorMessage("Click an existing point to plan a route.");
      return;
    }

    setPendingPoint(point);
    setErrorMessage(null);
  }, [isRoutePlanningMode]);

  const cancelPendingPoint = useCallback(() => {
    setPendingPoint(null);
  }, []);

  const savePendingPoint = useCallback(async () => {
    if (!pendingPoint) {
      return;
    }

    setIsSavingPoint(true);
    setErrorMessage(null);

    try {
      const savedPoint = await createPoint({
        type: selectedType,
        latitude: pendingPoint.latitude,
        longitude: pendingPoint.longitude,
      });

      setPoints((currentPoints) => [...currentPoints, savedPoint]);
      setPendingPoint(null);
      setNetwork({ connections: [], totalDistance: 0 });
      setRoutePreview(null);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingPoint(false);
    }
  }, [pendingPoint, selectedType]);

  const startRoutePlanning = useCallback(() => {
    setIsRoutePlanningMode(true);
    setPendingPoint(null);
    setRouteOriginPointId(null);
    setRouteDestinationPointId(null);
    setRoutePreview(null);
    setErrorMessage(null);
  }, []);

  const cancelRoutePlanning = useCallback(() => {
    setIsRoutePlanningMode(false);
    setRouteOriginPointId(null);
    setRouteDestinationPointId(null);
    setRoutePreview(null);
    setErrorMessage(null);
  }, []);

  const selectRoutePoint = useCallback(
    (point: Point) => {
      if (!isRoutePlanningMode) {
        return;
      }

      setRoutePreview(null);
      setErrorMessage(null);

      if (!routeOriginPointId) {
        setRouteOriginPointId(point.id);
        return;
      }

      if (point.id === routeOriginPointId) {
        setErrorMessage("Destination must be different from origin.");
        return;
      }

      setRouteDestinationPointId(point.id);
    },
    [isRoutePlanningMode, routeOriginPointId]
  );

  const generateRoutePreview = useCallback(async () => {
    if (!routeOriginPointId || !routeDestinationPointId) {
      setErrorMessage("Select origin and destination points first.");
      return;
    }

    setIsGeneratingRoutePreview(true);
    setErrorMessage(null);

    try {
      const parsedParameters = parseRoutePreviewParameters(
        routePreviewParameters
      );

      if (!parsedParameters) {
        setErrorMessage("Route simulation parameters must be greater than zero.");
        return;
      }

      const preview = await previewRoute({
        originPointId: routeOriginPointId,
        destinationPointId: routeDestinationPointId,
        ...parsedParameters,
      });

      setRoutePreview(preview);
    } catch (error) {
      setRoutePreview(null);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsGeneratingRoutePreview(false);
    }
  }, [routeDestinationPointId, routeOriginPointId, routePreviewParameters]);

  const updateRoutePreviewParameter = useCallback(
    (parameter: keyof RoutePreviewParameters, value: string) => {
      setRoutePreviewParameters((currentParameters) => ({
        ...currentParameters,
        [parameter]: value,
      }));
      setRoutePreview(null);
    },
    []
  );

  const runNetworkGeneration = useCallback(async () => {
    setIsGeneratingNetwork(true);
    setErrorMessage(null);

    try {
      const generatedNetwork = await generateNetwork();
      setNetwork(generatedNetwork);
      await loadPoints();
    } catch (error) {
      setNetwork({ connections: [], totalDistance: 0 });
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsGeneratingNetwork(false);
    }
  }, [loadPoints]);

  const clearNetwork = useCallback(() => {
    setNetwork({ connections: [], totalDistance: 0 });
  }, []);

  return {
    points,
    pointTotals,
    selectedType,
    pendingPoint,
    network,
    connectionSegments,
    isRoutePlanningMode,
    routeOriginPoint,
    routeDestinationPoint,
    routeOriginPointId,
    routeDestinationPointId,
    routePreview,
    routePreviewParameters,
    errorMessage,
    isLoadingPoints,
    isSavingPoint,
    isGeneratingNetwork,
    isGeneratingRoutePreview,
    setSelectedType,
    selectPendingPoint,
    selectRoutePoint,
    cancelPendingPoint,
    savePendingPoint,
    startRoutePlanning,
    cancelRoutePlanning,
    generateRoutePreview,
    updateRoutePreviewParameter,
    runNetworkGeneration,
    clearNetwork,
    refreshPoints: loadPoints,
  };
}

function parseRoutePreviewParameters(
  parameters: RoutePreviewParameters
): {
  poleSpacingMeters: number;
  cableCostPerMeter: number;
  poleUnitCost: number;
} | null {
  const poleSpacingMeters = Number(parameters.poleSpacingMeters);
  const cableCostPerMeter = Number(parameters.cableCostPerMeter);
  const poleUnitCost = Number(parameters.poleUnitCost);

  if (
    !Number.isFinite(poleSpacingMeters) ||
    !Number.isFinite(cableCostPerMeter) ||
    !Number.isFinite(poleUnitCost) ||
    poleSpacingMeters <= 0 ||
    cableCostPerMeter <= 0 ||
    poleUnitCost <= 0
  ) {
    return null;
  }

  return {
    poleSpacingMeters,
    cableCostPerMeter,
    poleUnitCost,
  };
}
