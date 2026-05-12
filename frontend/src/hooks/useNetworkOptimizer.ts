import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiErrorMessage } from "../services/api";
import { generateNetwork } from "../services/network-service";
import { createPoint, getPoints } from "../services/points-service";
import { POINT_TYPES } from "../types/domain";
import type {
  ConnectionSegment,
  NetworkResult,
  PendingPoint,
  Point,
  PointType,
} from "../types/domain";

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
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isSavingPoint, setIsSavingPoint] = useState(false);
  const [isGeneratingNetwork, setIsGeneratingNetwork] = useState(false);
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

  const selectPendingPoint = useCallback((point: PendingPoint) => {
    setPendingPoint(point);
    setErrorMessage(null);
  }, []);

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
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingPoint(false);
    }
  }, [pendingPoint, selectedType]);

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
    errorMessage,
    isLoadingPoints,
    isSavingPoint,
    isGeneratingNetwork,
    setSelectedType,
    selectPendingPoint,
    cancelPendingPoint,
    savePendingPoint,
    runNetworkGeneration,
    clearNetwork,
    refreshPoints: loadPoints,
  };
}
