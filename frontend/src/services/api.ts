import axios, { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/domain";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const response = error.response?.data as ApiErrorResponse | undefined;
    return response?.error?.message ?? "Unable to complete the request.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected application error.";
}
