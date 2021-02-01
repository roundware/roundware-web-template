import React, { useState } from "react";
import { useRoundware } from "../hooks";
import { useGoogleMap } from "@react-google-maps/api";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import MapIcon from '@material-ui/icons/Map';

const useStyles = makeStyles((theme) => {
  return {
    walkingModeButton: {
      position: "absolute",
      zIndex: 100,
      left: 20,
      bottom: 10,
      backgroundColor: "#cccccc",
    },
  };
});

const walkingModeButton = () => {
  const { roundware, forceUpdate } = useRoundware();
  const map = useGoogleMap();
  const classes = useStyles();
  const [walkingMode, setwalkingMode] = useState(false);

  const toggleWalkingMode = () => {
    if (walkingMode) {
      console.log("switching to map mode");
      // re-center map on user location
      // zoom out
      map.setZoom(5);
      // change to geoListenMode.MANUAL
      // make project.recordingRadius circle invisible
      // update text instructions?
    } else if (!walkingMode) {
      console.log("switching to walking mode");
      // re-center map on user location
      // zoom in
      map.setZoom(16);
      // change to geoListenMode.AUTOMATIC
      // make project.recordingRadius circle invisible
      // update text instructions?
    }
    setwalkingMode(!walkingMode);
  };

  return (
    <div>
      <Button
        className={classes.walkingModeButton}
        color="primary"
        onClick={toggleWalkingMode}
      >
        {walkingMode ? (
          <DirectionsWalkIcon fontSize="large" />
        ) : (
          <MapIcon fontSize="large" />
        )}
      </Button>
    </div>
  );
}

export default walkingModeButton;
