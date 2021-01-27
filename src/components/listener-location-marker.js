import {Circle, useGoogleMap} from "@react-google-maps/api";
import {useRoundware} from "../hooks";
import React, {useEffect, useState} from 'react';
import {useDefaultStyles} from "../styles";
import {useTheme} from "@material-ui/core";

const ListenerLocationMarker = () => {
  const {roundware} = useRoundware();
  const theme = useTheme();

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
