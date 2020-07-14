import React, {useState} from "react";
import {defaultTheme} from "../styles";
import {makeStyles, ThemeProvider} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { LandingPage } from "./LandingPage";
import {BrowserRouter, Switch, Route} from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {ErrorOutline} from "@material-ui/icons";
import Grid from "@material-ui/core/Grid";
import {ListenPage} from "./ListenPage";
import {SpeakPage} from "./SpeakPage";


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
      <Toolbar />
        <BrowserRouter >
          <Grid spacing={8} className={classes.root} container direction={"column"}>
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
          </Grid>
        </BrowserRouter>
      <AppBar position="fixed" className={classes.bottomBar} >
        <Toolbar />
      </AppBar>
    </ThemeProvider>
  )
}
