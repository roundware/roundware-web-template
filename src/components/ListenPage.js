import React, {useEffect} from "react";
import RoundwareMap from "./map";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useRoundware} from "../hooks";

const useStyles = makeStyles(theme => {
  return {
    root: {
      flexGrow: 1,
      display: "flex",
    },
    map: {
      flexGrow: 1,
    }
  }
})
export const ListenPage = () => {
  const classes = useStyles();
  const { roundware } = useRoundware();

  return <RoundwareMap
        className={classes.map}
        googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} />
}
