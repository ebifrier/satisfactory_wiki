import React, { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import store, { persistor } from "@/store";

import "@/styles/style.scss";

const HeaderLinks = [
  ["素材詳細", "/item"],
  ["必要量比較", "/compchart"],
];

const Header: React.FC<{ className?: string }> = ({ className }) => {
  const [mobileHidden, setMobileHidden] = React.useState(true);
  const toggleMenu = React.useCallback(
    () => setMobileHidden((prev) => !prev),
    []
  );

  return (
    <header className={`bg-gray-600 text-white ${className}`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <Link href="/">
            <img
              src="./favicon.png"
              title="logo"
              alt="logo"
              className="logo-image inline mr-2"
            />
            SATISFACTORY 日本語Wikiツール
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6" style={{ marginTop: "4px" }}>
          {HeaderLinks.map(([title, link]) => (
            <Link
              key={link}
              href={link}
              className="text-xl hover:text-gray-300"
            >
              {title}
            </Link>
          ))}
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
      <nav className={`${mobileHidden ? "hidden" : ""} bg-gray-700 md:hidden`}>
        {HeaderLinks.map(([title, link]) => (
          <Link
            key={link}
            href={link}
            className="block px-4 py-2 text-white hover:bg-gray-500"
          >
            {title}
          </Link>
        ))}
      </nav>
    </header>
  );
};

export default function App({ Component, pageProps }: AppProps): ReactNode {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>

        <div className="flex flex-col">
          <Header className="flex-none" />
          <DndProvider backend={HTML5Backend}>
            <div
              id="main"
              className="container flex-1 bg-white 2xl:max-w-8xl rounded-lg shadow-md p-6 mx-auto my-4"
            >
              <Component {...pageProps} />
            </div>
          </DndProvider>
        </div>
      </PersistGate>
    </Provider>
  );
}
