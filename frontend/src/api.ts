import axios from "axios";
import useSWR from "swr";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export async function fetcher<T>(url: string): Promise<T> {
  return axios.get(`${API_URL}${url}`).then((res) => res.data);
}

export default useSWR;
