import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const paramToStr = (param?: string | string[]): string | undefined =>
  param ? `${param}` : undefined;

export async function fetcher<T>(url: string): Promise<T> {
  return axios.get(`${API_URL}${url}`).then((res) => res.data);
}
