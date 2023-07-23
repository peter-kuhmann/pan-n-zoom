import React from "react";
import ReactDOM from "react-dom/client";
import "./main.scss";
import Router from "./Router.tsx";
import "@fontsource-variable/shantell-sans";
import { reloadAppIfStandaloneModeChanges } from "@/utils/standalone.ts";

reloadAppIfStandaloneModeChanges();

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
