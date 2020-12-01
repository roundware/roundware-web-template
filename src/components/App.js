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
      width: "100%",
      height: "3em",
    },
    root: {
      height: "100vh",
      display: "flex",
      margin: theme.spacing(2),
    },
    container: {
      margin: 0,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    },
  };
});

export const App = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const classes = useStyles();
  const { roundware } = useRoundware();
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <AppBar className={classes.topBar} position="fixed">
          <Toolbar className={classes.topBar}>
            <ErrorOutline />
          </Toolbar>
        </AppBar>
        <div className={classes.container}>
          <Toolbar style={{ marginBottom: "2rem" }} />
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
          <Toolbar />
        </div>
        <AppBar position="fixed" className={classes.bottomBar}>
          <Toolbar>
            <Route path="/listen">
              <Button
                onClick={() => {
                  if (!roundware._mixer) {
                    roundware.activateMixer().then(() => {
                      roundware._mixer.toggle();
                    });
                  } else {
                    roundware._mixer.toggle();
                  }
                }}
              >
                {roundware && roundware._mixer && roundware._mixer.playing ? (
                  <PauseCircleOutlineIcon />
                ) : (
                  <PlayCircleOutlineIcon />
                )}
              </Button>
            </Route>
          </Toolbar>
        </AppBar>
      </BrowserRouter>
    </ThemeProvider>
  );
};
