import React, {useState} from "react";
import {defaultTheme} from "../styles";
import {makeStyles, ThemeProvider} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import { LandingPage } from "./LandingPage";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import Grid from "@material-ui/core/Grid";
import {ListenPage} from "./ListenPage";
import {SpeakPage} from "./SpeakPage";
import Container from "@material-ui/core/Container";


const useStyles = makeStyles((theme) => {
  return {
    topBar: {
      backgroundColor: theme.palette.grey[900]
    },
    bottomBar: {
      top: 'auto',
      bottom: 0,
    },
    actionButton: {
      margin: "auto",
      width: "100%",
      height: "3em"
    },
    root: {
      height: "100vh",
      display: "flex",
      margin: theme.spacing(2)
    },
    container: {
      margin: 0,
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    }
  }
})


export const App = () => {
  const [theme, setTheme] = useState(defaultTheme);
  const classes = useStyles();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar className={classes.topBar} position="fixed">
        <Toolbar className={classes.topBar} >
          <ErrorOutline />
        </Toolbar>
      </AppBar>
      <div className={classes.container}>
        <Toolbar />
        <BrowserRouter >
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
          </Switch>
        </BrowserRouter>
        <Toolbar />
      </div>
      <AppBar position="fixed" className={classes.bottomBar} >
        <Toolbar />
      </AppBar>
    </ThemeProvider>
  )
}
