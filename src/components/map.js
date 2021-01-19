import React, { useState } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { RoundwareMapStyle } from "../map-style";
import AssetLayer from "./asset-layer";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ListenerLocationMarker from "./listener-location-marker";
import {useRoundware} from "../hooks";
import distance from "@turf/distance"

const useStyles = makeStyles((theme) => {
  return {
    roundwareMap: {
      height: "100%",
    },
  };
});
const RoundwareMap = (props) => {
  const classes = useStyles();
  const {roundware, forceUpdate} = useRoundware();
  const [map, setMap] = useState(null);

  if (!roundware._project) {
    return null;
  }

  const updateListenerLocation = () => {
    if (!map) {return}
    const center = map.getCenter();
    roundware.updateLocation({latitude: center.lat(), longitude: center.lng()})

  }

  const updateRecordingRadius = () => {
    if (!map) {return}
    const bounds = map.getBounds();
    const northeast = bounds.getNorthEast()
    const southwest = bounds.getSouthWest()
    const xDist = distance(
      [ southwest.lng(), southwest.lat()],
      [northeast.lng(), southwest.lat()],
      {units: "meters"}
    )
    const yDist = distance(
      [ southwest.lng(), southwest.lat()],
      [southwest.lng(), northeast.lat()],
      {units: "meters"}
    )
    const shortSide = Math.min(xDist, yDist)
    // TODO implement setting recording radius in RW framework
    roundware._project.recordingRadius = shortSide * 0.9 / 2;
    forceUpdate()
  }

  // when the listener location changes, center the map
  return (
    <LoadScript id="script-loader" googleMapsApiKey={props.googleMapsApiKey}>
      <GoogleMap
        mapContainerClassName={classes.roundwareMap}
        onZoomChanged={ () => {
          updateListenerLocation();
          updateRecordingRadius();
        }}
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
        onUnmount={(map) => {
          // do your stuff before map is unmounted
        }}
      >
        <AssetLayer />
        <ListenerLocationMarker />
      </GoogleMap>
    </LoadScript>
  );
};

export default RoundwareMap;
