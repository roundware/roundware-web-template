import "core-js/stable";
import "regenerator-runtime/runtime";

import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import React from "react";
import { App } from "./components/App";

import dotenv from "dotenv";
dotenv.config();

import { RoundwareProvider } from "./providers";

const mountNode = document.getElementById("app");
ReactDOM.render(
  <RoundwareProvider>
    <BrowserRouter>
      <App style={{ display: "flex" }} />
    </BrowserRouter>
  </RoundwareProvider>,
  mountNode
);
