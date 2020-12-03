import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { ActionButton } from "./actionButton";
import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useRoundware } from "../hooks";

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
  };
});

export const LandingPage = (props) => {
  const { roundware } = useRoundware();
  if (!roundware._project) {
    return null;
  }
  return (
    <div>
      <Grid item>
        <Typography variant={"h1"}>
          {roundware._project && roundware._project.projectName}
        </Typography>
      </Grid>
      <ActionButton label={"Listen"} linkTo={"/listen"} />
      <ActionButton label={"Speak"} linkTo={"/speak"} />
    </div>
  );
};
