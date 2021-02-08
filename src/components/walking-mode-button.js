import React, { useState, useEffect } from "react";
import { useRoundware } from "../hooks";
import { GeoListenMode } from "roundware-web-framework";
import { useGoogleMap } from "@react-google-maps/api";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import MapIcon from '@material-ui/icons/Map';
import ListenerLocationMarker from './listener-location-marker';

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
  const loc = roundware._listenerLocation
  const lat = loc && loc.latitude
  const lng = loc && loc.longitude
  const center = { lat, lng }
  const ready = typeof(lat) === "number" && typeof(lng) === "number"

  // when the listenerLocation is updated, center the map
  useEffect(() => {
    if (ready) {
      const c = map.getCenter();
      console.log("new location provided by framework");
      if (center.lat !== c.lat() || center.lng !== c.lng()) {
        map.panTo(center)
      }
    }
  }, [lat, lng])

  const toggleWalkingMode = () => {
    if (walkingMode) {
      console.log("switching to map mode");
      // zoom out
      map.setZoom(5);
      // enable map panning
      map.setOptions({gestureHandling: "cooperative"});
      // stop listening for location updates
      roundware.enableGeolocation(GeoListenMode.MANUAL)
      // update text instructions?
    } else if (!walkingMode) {
      console.log("switching to walking mode");
      // disable map panning
      map.setOptions({gestureHandling: "none"});
      // zoom in
      map.setZoom(16);
      // change to geoListenMode.AUTOMATIC
      roundware.enableGeolocation(GeoListenMode.AUTOMATIC)
      // make project.recordingRadius circle invisible
      const isGeoLocationEnabled = roundware._geoPosition && roundware._geoPosition.isEnabled;
      console.log(`isGeoLocationEnabled: ${isGeoLocationEnabled}`);
      if (roundware._mixer) {
        roundware._mixer.updateParams({maxDist: roundware._project.recordingRadius,
                                       recordingRadius: roundware._project.recordingRadius});
      }
      // update text instructions?
      // use spinner to indicate location is being determined initially
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
          <MapIcon fontSize="large" />
        ) : (
          <DirectionsWalkIcon fontSize="large" />
        )}
      </Button>
      {walkingMode ? <ListenerLocationMarker /> : null}
    </div>
  );
}

export default walkingModeButton;
