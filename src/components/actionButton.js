import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => {
  return {
    actionButton: {
      margin: theme.spacing(2),
      width: 300,
      // padding: 50
      height: 100,
    },
    buttonLabel: {
      margin: theme.spacing(2),
    },
  };
});

export const ActionButton = ({ label, linkTo }) => {
  const classes = useStyles();
  const history = useHistory();

  return (
    <Grid container direction={"column"}>
      <Grid item sm={9} md={6}>
        <Button
          aria-label={label}
          className={classes.actionButton}
          variant="contained"
          elevation={0}
          color="primary"
          onClick={() => {
            history.push(linkTo);
          }}
        >
          <Typography variant={"h3"} className={classes.buttonLabel}>
            {label}
          </Typography>
        </Button>
      </Grid>
    </Grid>
  );
};
