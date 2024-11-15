import React from "react";
import * as Icon from "@heroicons/react/24/outline";
//import { useAppDispatch } from "@/index";
import { PageHead } from "@/components";
//import { actions } from "@/features/compchartSlice";

//
// メインコンポーネント
//
const CompChartListPage: React.FC = () => {
  //const compCharts = useAppSelector((state) => state.compCharts);
  //const dispatch = useAppDispatch();

  // const handleCompChart = React.useCallback(async () => {
  //   const charts = await executeCompChart(
  //     recipeSels,
  //     productAmounts,
  //     ingredients
  //   );
  //   const chartData = createCompChartData(charts, ingredients, items ?? []);
  //   console.log(chartData);
  //   setChartData(chartData);
  // }, [recipeSels, productAmounts, ingredients, items]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PageHead title="比較表一覧" />

      <div className="col-span-full mb-2">
        <h1 className="text-4xl font-bold text-gray-800">比較表一覧</h1>
      </div>

      <div className="p-4 bg-white rounded-lg shadow-md">
        <h2 className="flex-none text-2xl font-bold mt-4 mb-1">
          <span className="float-right font-normal">
            <button className="size-6 text-blue-400 align-bottom">
              <Icon.ArrowDownOnSquareIcon />
            </button>
          </span>
        </h2>
      </div>
    </div>
  );
};

export default CompChartListPage;
