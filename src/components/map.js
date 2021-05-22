import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { RoundwareMapStyle } from "../map-style";
import AssetLayer from "./asset-layer";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ListenerLocationMarker from "./listener-location-marker";
import { useRoundware } from "../hooks";
import distance from "@turf/distance";
import AssetLoadingOverlay from "./asset-loading-overlay";
import RangeCircleOverlay from "./range-circle-overlay";
import WalkingModeButton from "./walking-mode-button";

const useStyles = makeStyles((theme) => {
  return {
    roundwareMap: {
      flexGrow: 1,
    },
  };
});

const RoundwareMap = (props) => {
  const classes = useStyles();
  const { roundware } = useRoundware();
  const [map, setMap] = useState(null);

  if (!roundware._project) {
    return null;
  }

  const updateListenerLocation = () => {
    if (!map) {
      return;
    }
    const center = map.getCenter();
    roundware.updateLocation({
      latitude: center.lat(),
      longitude: center.lng(),
    });
  };

  // when the listener location changes, center the map
  return (
    <LoadScript id="script-loader" googleMapsApiKey={props.googleMapsApiKey}>
      <AssetLoadingOverlay />
      <GoogleMap
        mapContainerClassName={classes.roundwareMap}
        onZoomChanged={updateListenerLocation}
        onDragEnd={updateListenerLocation}
        onLoad={(map) => {
          setMap(map);
          const styledMapType = new google.maps.StyledMapType(
            RoundwareMapStyle,
            { name: "Street Map" }
          );
          map.mapTypes.set("styled_map", styledMapType);
          map.setOptions({
            center: { lat: 0, lng: 0 },
            zoom: 5,
            zoomControl: true,
            draggable: true,
            mapTypeControl: false,
            streetViewControl: false,
            draggableCursor: "cursor",
            fullscreenControl: false,
            zoomControlOptions: {
              style: google.maps.ZoomControlStyle.SMALL,
              position: google.maps.ControlPosition.TOP_RIGHT,
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
        onUnmount={(map) => {
          // do your stuff before map is unmounted
        }}
      >
        <AssetLayer />
        <RangeCircleOverlay />
        <WalkingModeButton />
      </GoogleMap>
    </LoadScript>
  );
};

export default RoundwareMap;
