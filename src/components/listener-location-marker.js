import {Circle, useGoogleMap} from "@react-google-maps/api";
import {useRoundware} from "../hooks";
import React, {useEffect, useState} from 'react';

const ListenerLocationMarker = () => {
  const {roundware} = useRoundware();
  const loc = roundware._listenerLocation
  const lat = loc && loc.latitude
  const lng = loc && loc.longitude
  const center = { lat, lng }
  const ready = typeof(lat) === "number" && typeof(lng) === "number"
  const map = useGoogleMap();

  // when the listenerLocation is updated, center the map
  useEffect(() => {
    if (ready) {
      map.panTo(center)
    }
  }, [lat, lng])

  if (!ready) {
    return null;
  }


  return <Circle radius={roundware._project.recordingRadius}  center={center} options={{
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      clickable: false,
      draggable: false,
      editable: false,
      visible: true,
      radius: 30000,
      zIndex: 1
    }}
  />
}
export default ListenerLocationMarker;