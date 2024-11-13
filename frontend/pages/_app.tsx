import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import type { AppProps } from "next/app";
import Head from "next/head";
import store from "@/store";

import "@/styles/style.scss";

const Header: React.FC = () => {
  const [mobileHidden, setMobileHidden] = React.useState(true);
  const toggleMenu = React.useCallback(
    () => setMobileHidden((prev) => !prev),
    []
  );

  return (
    <header className="bg-gray-600 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <a href="#">
            <img
              src="./favicon.png"
              title="logo"
              className="logo-image inline mr-2"
            />
            SATISFACTORY 日本語Wikiツール
          </a>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6" style={{ marginTop: "4px" }}>
          <a href="#" className="text-xl hover:text-gray-300">
            素材詳細
          </a>
          {/* <a href="#" className="hover:text-gray-300">About</a>
        <a href="#" className="hover:text-gray-300">Services</a>
        <a href="#" className="hover:text-gray-300">Contact</a> */}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl focus:outline-none"
          type="button"
          onClick={toggleMenu}
        >
          &#9776;
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        id="mobile-menu"
        className={`${mobileHidden ? "hidden" : ""} bg-gray-700 md:hidden`}
      >
        <a href="#" className="block px-4 py-2 text-white hover:bg-gray-500">
          素材詳細
        </a>
        {/* <a href="#" className="block px-4 py-2 text-white hover:bg-gray-500"
        >About</a
      >
      <a href="#" className="block px-4 py-2 text-white hover:bg-gray-500"
        >Services</a
      > */}
      </nav>
    </header>
  );
};

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <Provider store={store}>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Header />
      <Component {...pageProps} />;
    </Provider>
  );
}
