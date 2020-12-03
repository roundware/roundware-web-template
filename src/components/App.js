import React, { useState } from "react";
import { defaultTheme } from "../styles";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { LandingPage } from "./LandingPage";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import Grid from "@material-ui/core/Grid";
import { ListenPage } from "./ListenPage";
import SpeakPage from "./SpeakPage";
import Container from "@material-ui/core/Container";
import PlayCircleOutlineIcon from "@material-ui/icons/PlayCircleOutline";
import Button from "@material-ui/core/Button";
import PauseCircleOutlineIcon from "@material-ui/icons/PauseCircleOutline";
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
    root: {
      margin: theme.spacing(2),
    },
    container: {
      flexGrow: true,
    },
  };
});

export const App = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const classes = useStyles();
  const { roundware } = useRoundware();
  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{roundware._project ? roundware._project.projectName : "Roundware"}</title>
      </Helmet>
      <BrowserRouter>
        <CssBaseline />
        <AppBar className={classes.topBar} position="fixed">
          <Toolbar className={classes.topBar}>
            <ErrorOutline />
          </Toolbar>
        </AppBar>
        <Toolbar style={{ marginBottom: "2rem" }} />
        <div className={classes.container}>
          <Switch>
            <Route exact path="/">
              <LandingPage />
            </Route>
            <Route path="/listen">
              <ListenPage />
            </Route>
            <Route path="/speak">
              <SpeakPage />
            </Route>
            <Route path="/debug">
              <DebugPage />
            </Route>
          </Switch>
        </div>
        <Toolbar className={classes.bottomBar} style={{marginTop: "2rem"}}/>
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
