import React, {useEffect, useState} from "react";
import { useRoundware } from "../hooks";
import LocationSelectMarker from "./location-select-marker";
import { RoundwareMapStyle } from "../map-style";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import {
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
} from "@material-ui/core";
import {makeStyles} from "@material-ui/styles";
import ErrorDialog from "./error-dialog";

const getPosition = function (options) {
  return new Promise(function (resolve, reject) {
    return navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
};

const useStyles = () => makeStyles(theme => {
  return {
    container: {
      flexGrow: 1,
      margin: "auto"
    },
    button: {
      margin: "auto"
    }
  }
})
const mapContainerStyle = {
    width: "400px",
    height: "400px",
    margin: "auto",
}

const LocationSelectForm = () => {
  const {
    roundware,
    draftRecording,
    setDraftLocation,
    saveDraftLocation,
  } = useRoundware();
  const [error, set_error] = useState( null );
  useEffect(() => {
    if (roundware._project) {
      setDraftLocation(roundware._project.location);
    }
  }, [roundware._project]);
  const classes = useStyles();

  const getGeolocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
    } else {
      getPosition()
        .then((position) => {
          setDraftLocation(position.coords);
        })
        .catch(err => {
          set_error(err);
        });
    }
  };
  if (!roundware) {
    return null;
  }

  return (
    <Card style={{margin: "auto"}} className={classes.container}>
      <ErrorDialog error={error} set_error={set_error} />
      <CardContent>
        <Typography variant={"h5"}>Where are you recording today?</Typography>
        <LoadScript
          id="script-loader"
          googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            onLoad={(map) => {
              const styledMapType = new google.maps.StyledMapType(
                RoundwareMapStyle,
                { name: "Street Map" }
              );
              map.mapTypes.set("styled_map", styledMapType);
              map.setOptions({
                center: {
                  lat: draftRecording.location.latitude,
                  lng: draftRecording.location.longitude,
                },
                zoom: 5,
                zoomControl: true,
                draggable: true,
                mapTypeControl: true,
                streetViewControl: false,
                draggableCursor: "cursor",
                fullscreenControl: false,
                zoomControlOptions: {
                  style: google.maps.ZoomControlStyle.SMALL,
                },
                rotateControl: false,
                mapTypeId: "styled_map",
                mapTypeControlOptions: {
                  mapTypeIds: [google.maps.MapTypeId.SATELLITE, "styled_map"],
                  style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                  position: google.maps.ControlPosition.BOTTOM_LEFT,
                },
              });
            }}
          >
            <LocationSelectMarker />
          </GoogleMap>
        </LoadScript>
      </CardContent>
      <CardActions>
        <Button
          style={{
            marginLeft: "auto",
            marginRight: "2rem"
          }}
          size="medium"
          variant={"contained"}
          aria-label="use my location"
          onClick={getGeolocation}
        >
          Use My Location
        </Button>
        <Button
          style={{
            marginRight: "auto",
            marginLeft: "2rem"
          }}
          size="medium"
          color="primary"
          variant={"contained"}
          onClick={saveDraftLocation}
        >
          Next
        </Button>
      </CardActions>
    </Card>
  );
};

export default LocationSelectForm;
