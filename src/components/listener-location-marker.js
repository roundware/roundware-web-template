import {Circle, useGoogleMap} from "@react-google-maps/api";
import {useRoundware} from "../hooks";
import React, {useEffect, useState} from 'react';
import {useDefaultStyles} from "../styles";
import {useTheme} from "@material-ui/core";

const ListenerLocationMarker = () => {
  const {roundware} = useRoundware();
  const theme = useTheme();
  const loc = roundware._listenerLocation
  const lat = loc && loc.latitude
  const lng = loc && loc.longitude
  const center = { lat, lng }
  const ready = typeof(lat) === "number" && typeof(lng) === "number"
  const map = useGoogleMap();

  // when the listenerLocation is updated, center the map
  useEffect(() => {
    if (ready) {
      const c = map.getCenter();
      if (center.lat !== c.lat() || center.lng !== c.lng()) {
        map.panTo(center)
      }
    }
  }, [lat, lng])

  if (!ready) {
    return null;
  }

  return <Circle radius={roundware._project.recordingRadius}  center={center}
                 onLoad={ circle => {
                   const newBounds = circle.getBounds()
                   map.panToBounds(newBounds)
                 }}
                 options={{
      strokeColor: theme.palette.secondary.light,
      strokeOpacity: 0.0,
      strokeWeight: 1,
      fillColor: theme.palette.primary.light,
      fillOpacity: 0.0,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      zIndex: 1
    }}
  />
}
export default ListenerLocationMarker;
