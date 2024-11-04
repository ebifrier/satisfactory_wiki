//import 'vite/modulepreload-polyfill';
import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { StrictMode } from "react";

import "../styles/style.scss";

document.addEventListener("DOMContentLoaded", () => {
  createInertiaApp({
    resolve: (name) => {
      const pages = import.meta.glob("./pages/**/*.tsx", { eager: true });
      return pages[`./pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
      createRoot(el).render(
        <StrictMode>
          <App {...props} />
        </StrictMode>
      );
    },
  }).then(() => {});
});
