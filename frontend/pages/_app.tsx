import { ReactNode } from "react";
import { Provider } from "react-redux";
import type { AppProps } from "next/app";
import Head from "next/head";
import store from "@/store";

import "@/styles/style.scss";

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <Provider store={store}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="X-UA-Compatible" content="ie=edge" />
      </Head>
      <Component {...pageProps} />;
    </Provider>
  );
}
