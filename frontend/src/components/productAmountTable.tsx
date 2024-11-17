import React from "react";
import Select from "react-select";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, Option, GroupOption, findSelectedItem } from "@/index";
import { TProductAmount, actions } from "@/features/compchartSlice";

export const ProductAmountTable: React.FC<{
  chartId: string;
  productAmounts?: TProductAmount[];
  itemOptions?: GroupOption[];
}> = ({ chartId, productAmounts, itemOptions }) => {
  const dispatch = useAppDispatch();

  const productOptions = React.useMemo(
    () =>
      productAmounts?.map((product) =>
        findSelectedItem(product.itemId, itemOptions)
      ),
    [productAmounts, itemOptions]
  );

  return (
    <table className="table-fixed w-full">
      <thead>
        <tr>
          <td className="text-center">生産物</td>
          <td className="text-center w-[6rem]">生産個数</td>
          <td className="text-center w-[6rem]">操作</td>
        </tr>
      </thead>
      <tbody>
        {productAmounts?.map((product, index) => (
          <tr key={`${index}-${product?.itemId}`}>
            <td>
              <Select<Option, false>
                options={itemOptions}
                value={productOptions?.[index]}
                onChange={(option) =>
                  dispatch(
                    actions.setProductAmount({
                      chartId,
                      index,
                      value: { ...product, itemId: option?.value },
                    })
                  )
                }
                isSearchable={true}
                className="sm:text-sm"
              />
            </td>
            <td>
              <input
                type="number"
                className="text-right text-sm p-2 rounded-lg max-w-[5rem]"
                min={0}
                value={product.amount}
                onChange={(ev) =>
                  dispatch(
                    actions.setProductAmount({
                      chartId,
                      index,
                      value: { ...product, amount: parseInt(ev.target.value) },
                    })
                  )
                }
              />
            </td>
            <td className="text-center">
              <button
                type="button"
                className="size-6 text-blue-400"
                title="上に新しい項目を追加"
                onClick={() =>
                  dispatch(actions.addProductAmount({ chartId, index }))
                }
              >
                <Icon.ArrowUpOnSquareIcon />
              </button>
              <button
                type="button"
                className="size-6 text-blue-400"
                title="下に新しい項目を追加"
                onClick={() =>
                  dispatch(
                    actions.addProductAmount({ chartId, index: index + 1 })
                  )
                }
              >
                <Icon.ArrowDownOnSquareIcon />
              </button>
              <button
                type="button"
                disabled={productAmounts.length <= 1}
                className="size-6 text-red-500 disabled:text-gray-200"
                title="項目を削除"
                onClick={() =>
                  dispatch(actions.deleteProductAmount({ chartId, index }))
                }
              >
                <Icon.TrashIcon />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
