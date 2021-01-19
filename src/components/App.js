import React, { useState } from "react";
import { defaultTheme } from "../styles";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { LandingPage } from "./LandingPage";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import { ListenPage } from "./ListenPage";
import SpeakPage from "./SpeakPage";
import { useRoundware } from "../hooks";
import DebugPage from "./DebugPage";
import RoundwareMixerControl from "./roundware-mixer-control";
import Helmet from "react-helmet";

const useStyles = makeStyles((theme) => {
  return {
    topBar: {
      backgroundColor: theme.palette.grey[900],
    },
    bottomBar: {
      top: "auto",
      bottom: 0,
    },
    actionButton: {
      margin: "auto",
    },
    appContainer: {
      display: "flex",
      flexGrow: 1,
    },
  };
});

export const App = () => {
  const [theme] = useState(defaultTheme);
  const classes = useStyles();
  const { roundware } = useRoundware();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <meta charSet="utf-8" />
        <title>{roundware._project ? roundware._project.projectName : "Roundware"}</title>
      </Helmet>
      <BrowserRouter>
        <AppBar className={classes.topBar} position="fixed">
          <Toolbar className={classes.topBar}>
            <ErrorOutline />
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <div className={classes.appContainer}>
          <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route path="/listen" component={ListenPage} />
            <Route path="/speak" component={SpeakPage} />
            <Route path="/debug" component={DebugPage} />
          </Switch>
        </div>
        <Toolbar className={classes.bottomBar} />
        <AppBar position="fixed" className={classes.bottomBar}>
          <Toolbar>
            <Route path="/listen">
              <RoundwareMixerControl />
            </Route>
          </Toolbar>
        </AppBar>
      </BrowserRouter>
    </ThemeProvider>
  );
};
