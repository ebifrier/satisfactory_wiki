import React from "react";
import useSWR from "swr";
import * as OutlineIcon from "@heroicons/react/24/outline";
import { Option, GroupOption, TItem, ItemUtil, fetcher } from "@/index";

//
// 項目の追加ボタン
//
export const AddButton: React.FC<React.ComponentProps<"button">> = ({
  className,
  content,
  title,
  ...args
}) => (
  <button
    type="button"
    className={`text-blue-600 py-0.5 px-1 rounded-lg border border-blue-600 ${
      className ?? ""
    }`}
    title={title ?? content}
    {...args}
  >
    <OutlineIcon.PlusIcon className="size-6 inline" />
    {content != null ? <span className="align-bottom">{content}</span> : null}
  </button>
);

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
