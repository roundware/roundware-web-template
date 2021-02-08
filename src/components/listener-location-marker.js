import { Circle, InfoWindow, Marker, useGoogleMap } from "@react-google-maps/api";
import { useRoundware } from "../hooks";
import React, { useEffect, useState } from 'react';
import { useDefaultStyles } from "../styles";
import { useTheme } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

const ListenerLocationMarker = () => {
  const { roundware } = useRoundware();
  const map = useGoogleMap();
  const theme = useTheme();
  const loc = roundware._listenerLocation
  const lat = loc && loc.latitude
  const lng = loc && loc.longitude
  const center = { lat, lng }

  // if (!ready) {
  //   return null;
  // }

  const iconPin = {
    url: 'https://fonts.gstatic.com/s/i/materialicons/person_pin/v10/24px.svg',
    scaledSize: new google.maps.Size(30, 30)
  };

  return (
    <>
      <Circle
        radius={roundware._project.recordingRadius}
        center={center}
        onLoad={ circle => {
          const newBounds = circle.getBounds()
          map.panToBounds(newBounds)
        }}
        options={{
          strokeColor: theme.palette.secondary.light,
          strokeOpacity: 0.5,
          strokeWeight: 0,
          fillColor: theme.palette.primary.light,
          fillOpacity: 0.3,
          clickable: false,
          draggable: false,
          editable: false,
          visible: true,
          zIndex: 1
        }}
      />
      <Marker
        position={{ lat: center.lat, lng: center.lng }}
        icon={iconPin}
      >
        <InfoWindow
          options={{
            disableAutoPan: false,
            pixelOffset: new google.maps.Size(0, -30),
          }}
        >
          <Typography
            variant="body2"
            style={{"color": "black"}}
          >
            You Are Here
          </Typography>
        </InfoWindow>
      </Marker>
    </>
  )
}

export default ListenerLocationMarker;
