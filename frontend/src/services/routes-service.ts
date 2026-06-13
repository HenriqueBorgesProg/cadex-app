import { api } from "./api";
import type { RoutePreviewInput, RoutePreviewResult } from "../types/domain";

export async function previewRoute(
  data: RoutePreviewInput
): Promise<RoutePreviewResult> {
  const response = await api.post<RoutePreviewResult>("/routes/preview", data);
  return response.data;
}
