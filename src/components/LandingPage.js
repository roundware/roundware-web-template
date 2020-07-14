import Grid from "@material-ui/core/Grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import {ErrorOutline} from "@material-ui/icons";
import Typography from "@material-ui/core/Typography";
import {ActionButton} from "./actionButton";
import React, {Fragment} from "react";
import {makeStyles} from "@material-ui/core/styles";
import {useRoundware} from "../hooks";

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

export const LandingPage = (props) => {
  const roundware = useRoundware();
  const classes = useStyles();

  return  <Fragment>
      <Grid item>
        <Typography variant={'h1'}>{roundware.roundware && roundware.roundware._project.projectName}</Typography>
        <Typography paragraph>Some text about the project should go here</Typography>
      </Grid>
      <ActionButton label={"Listen"} linkTo={"/listen"} />
      <ActionButton label={"Speak"} linkTo={"/speak"} />
  </Fragment>
}
