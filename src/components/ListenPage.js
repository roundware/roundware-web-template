import React, {useEffect} from "react";
import RoundwareMap from "./map";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useQuery, useRoundware} from "../hooks";

const useStyles = makeStyles(theme => {
  return {
    map: {
      display: "flex"
    }
  }
})

export const ListenPage = () => {
  const classes = useStyles();

  return <RoundwareMap
        className={classes.map}
        googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} />
}
