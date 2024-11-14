import React from "react";
import Select from "react-select";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, Option, GroupOption, findSelectedItem } from "@/index";
import { TProductAmount, actions } from "@/slices/compchartSlice";

const ProductAmountTable: React.FC<{
  productAmounts?: TProductAmount[];
  itemOptions?: GroupOption[];
}> = ({ productAmounts, itemOptions }) => {
  const dispatch = useAppDispatch();

  const productOptions = React.useMemo(
    () =>
      productAmounts?.map((product) =>
        findSelectedItem(product.itemId, itemOptions)
      ),
    [productAmounts, itemOptions]
  );

  return (
    <table>
      <thead>
        <tr>
          <td className="text-center">生産物</td>
          <td className="text-center">生産個数</td>
          <td className="text-center">削除</td>
        </tr>
      </thead>
      <tbody>
        {productAmounts?.map((product, index) => (
          <tr key={index}>
            <td>
              <Select<Option, false>
                options={itemOptions}
                value={productOptions?.[index]}
                onChange={(option) =>
                  dispatch(
                    actions.setProductAmount({
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
                className="w-full text-right"
                min={0}
                value={product.amount}
                onChange={(ev) =>
                  dispatch(
                    actions.setProductAmount({
                      index,
                      value: { ...product, amount: parseInt(ev.target.value) },
                    })
                  )
                }
              />
            </td>
            <td className="text-center">
              <button
                disabled={productAmounts.length <= 1}
                className="size-6 text-red-500 disabled:text-gray-200"
                onClick={() => dispatch(actions.deleteProductAmount({ index }))}
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

export default ProductAmountTable;
