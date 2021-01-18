import "core-js/stable";
import "regenerator-runtime/runtime";

import ReactDOM from "react-dom";

import React from "react";
import { App } from "./components/App";

import dotenv from "dotenv";
dotenv.config();

import { RoundwareProvider } from "./providers";

const mountNode = document.getElementById("app");
ReactDOM.render(
  <RoundwareProvider>
    <App style={{ display: "flex" }} />
  </RoundwareProvider>,
  mountNode
);
