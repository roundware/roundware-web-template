import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { ActionButton } from "./actionButton";
import React, { Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useRoundware } from "../hooks";
import Container from "@material-ui/core/Container";

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
  };
});

export const LandingPage = (props) => {
  const { roundware } = useRoundware();
  if (!roundware._project || roundware._project.projectName === '(unknown)') {
    return null;
  }
  return (
    <Grid container>
      <Grid item>
        <Container>
        <Typography variant={"h1"}>
          {roundware._project && roundware._project.projectName}
        </Typography>
        </Container>
      </Grid>
      <ActionButton label={"Listen"} linkTo={"/listen"} />
      <ActionButton label={"Speak"} linkTo={"/speak"} />
    </Grid>
  );
};
