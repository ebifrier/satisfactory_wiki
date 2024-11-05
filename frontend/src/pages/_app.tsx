import { ReactNode } from "react";
import type { AppProps } from "next/app";
import Head from "next/head";

import "@/styles/style.scss";

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      </Head>
      <Component {...pageProps} />;
    </>
  );
}
