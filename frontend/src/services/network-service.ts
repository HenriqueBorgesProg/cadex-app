import { api } from "./api";
import type { NetworkResult } from "../types/domain";

export async function generateNetwork(): Promise<NetworkResult> {
  const response = await api.post<NetworkResult>("/network/generate");
  return response.data;
}
