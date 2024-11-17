import React from "react";
import axios from "axios";
import useSWR from "swr";
import { Option, GroupOption, TItem, ItemUtil } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export const paramToStr = (param?: string | string[]): string | undefined =>
  param ? `${param}` : undefined;

export async function fetcher<T>(url: string): Promise<T> {
  return axios.get(`${API_URL}${url}`).then((res) => res.data);
}

//
// 素材一覧をreact-selectで表示できる形で取得します。
//
export const useItemOptions = () => {
  const result = useSWR<[string, TItem[]][]>(
    "/api/v1/items?grouping=true",
    fetcher
  );

  const itemOptions = React.useMemo<GroupOption[] | undefined>(
    () =>
      result?.data?.map(([cat, items]) => ({
        label: cat,
        options: items.map((item) => ({
          label: ItemUtil.getFullName(item),
          value: item.id,
        })),
      })),
    [result?.data]
  );

  return { itemOptions, ...result };
};

//
// 指定のIDを持つ素材をoptionsから検索します。
//
export const findSelectedItem = (
  itemId?: string,
  itemOptions?: GroupOption[]
): Option | undefined => {
  for (const { options } of itemOptions ?? []) {
    const option = options.find((x) => x.value === itemId);
    if (option != null) {
      return option;
    }
  }
  return undefined;
};
