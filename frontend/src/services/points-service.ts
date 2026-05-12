import { api } from "./api";
import type { CreatePointInput, Point } from "../types/domain";

export async function getPoints(): Promise<Point[]> {
  const response = await api.get<Point[]>("/points");
  return response.data;
}

export async function createPoint(data: CreatePointInput): Promise<Point> {
  const response = await api.post<Point>("/points", data);
  return response.data;
}
