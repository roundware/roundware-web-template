import { Backdrop, Card, CircularProgress, Typography } from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useRoundware } from "../hooks";
const useStyles = makeStyles((theme) => {
  return {
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: '#fff',
    },
    loadingCard: {
      display: "flex",
      flexDirection: "column"
    },
    loadingMessage: {
      padding: theme.spacing(2)
    },
    loadingSpinner: {
      alignSelf: "center",
      margin: theme.spacing(3),
      color: "inherit"
    }
  };
});
const AssetLoadingOverlay = () => {
  const { roundware } = useRoundware();

  const classes = useStyles();
  return (
    <Backdrop className={classes.backdrop} open={!roundware._assetData} >
      <Card className={classes.loadingCard} >
        <CircularProgress className={classes.loadingSpinner} />
        <Typography className={classes.loadingMessage} >
          Loading audio...
        </Typography>
      </Card>
    </Backdrop>
  )
}

export default AssetLoadingOverlay;
