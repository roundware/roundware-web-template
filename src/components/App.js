import React, {useState} from "react";
import {defaultTheme, useDefaultStyles} from "../styles";
import {makeStyles, ThemeProvider} from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import {RoundwareProvider} from "../providers";
import Button from "@material-ui/core/Button";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {useRoundware} from "../hooks";
import {ErrorOutline} from "@material-ui/icons";

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
  const roundware = useRoundware();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.root}>
        <Grid spacing={8} container direction={"column"}>
          <AppBar className={classes.topBar} position="fixed">
            <Toolbar className={classes.topBar} >
              <ErrorOutline />
            </Toolbar>
          </AppBar>
          <Toolbar />
          <Grid item>
            <Typography variant={'h1'}>{roundware.roundware && roundware.roundware._project.projectName}</Typography>
            <Typography paragraph>Some text about the project should go here</Typography>
          </Grid>
          <Grid item container direction={"column"}>
            <Grid item sm={9}>
              <Button className={classes.actionButton} variant="contained" elevation={0} color="primary">
                <Typography>Listen</Typography>
              </Button>
            </Grid>
          </Grid >
          <Grid item container>
            <Grid item sm={9}>
              <Button className={classes.actionButton} variant="contained" elevation={0} color="primary">Speak</Button>
            </Grid>
          </Grid>
          <AppBar position="fixed" className={classes.bottomBar} >
            <Toolbar />
          </AppBar>
        </Grid>
      </div>
    </ThemeProvider>
  )
}
