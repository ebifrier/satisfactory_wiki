import React from "react";
import Link from "next/link";
import * as Icon from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/index";
import { PageHead } from "@/components";
import { actions } from "@/features/compchartSlice";

//
// メインコンポーネント
//
const CompChartListPage: React.FC = () => {
  const charts = useAppSelector((state) => state.compCharts.charts);
  const dispatch = useAppDispatch();

  return (
    <div
      id="main"
      className="grid grid-cols-1 md:grid-cols-2 gap-2 2xl:max-w-8xl"
    >
      <PageHead title="レシピ比較表一覧" />

      <div className="col-span-full flex mb-6">
        <h1 className="flex-none inline-block text-4xl font-bold text-gray-800">
          レシピ比較表一覧
        </h1>
        <span className="flex-1 inline-block my-auto text-right">
          <button
            className="text-blue-600 px-3 py-2 rounded-lg border border-blue-600"
            onClick={() => dispatch(actions.addChart({}))}
          >
            <Icon.FolderPlusIcon className="size-6 inline" />
            <span className="align-middle ms-1">レシピ比較表を追加</span>
          </button>
        </span>
      </div>

      {charts.map((chart) => (
        <div
          key={chart.id}
          className="p-4 bg-white border rounded-lg shadow-md"
        >
          <Icon.DocumentIcon className="size-6 inline-block" />
          <Link href={`/compchart/${chart.id}`}>
            <span className="font-semibold ml-1 align-bottom">
              {chart.name}
            </span>
          </Link>
          <button
            type="button"
            className="float-right"
            onClick={() => {
              if (
                confirm(`"${chart.name}"レシピを削除してもよろしいですか？`)
              ) {
                dispatch(actions.deleteChart({ chartId: chart.id }));
              }
            }}
          >
            <Icon.TrashIcon className="size-6 text-red-400" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default CompChartListPage;
