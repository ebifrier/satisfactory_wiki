import React from "react";
import Head from "next/head";

//
// ページタイトルを設定します。
//
export const PageHead: React.FC<{ title: string }> = ({ title }) => (
  <Head>
    <title>{title} | SATISFACTORY Wikiツール</title>
  </Head>
);

export * from "./ingredientTable";
export * from "./productAmountTable";
export * from "./recipeSelection";
export * from "./table";
export * from "./tinyComponents";
