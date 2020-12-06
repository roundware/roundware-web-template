import React, { useEffect } from "react";
import {
  Marker,
  useGoogleMap,
} from "@react-google-maps/api";
import { useRoundware } from "../hooks";

const LocationSelectMarker = () => {
  const { draftRecording, setDraftLocation } = useRoundware();

  const map = useGoogleMap();
  useEffect(() => {
    map.panTo({
      lat: draftRecording.location.latitude,
      lng: draftRecording.location.longitude,
    });
  }, [draftRecording.location]);
  return (
    <Marker
      draggable={true}
      position={{
        lat: draftRecording.location.latitude,
        lng: draftRecording.location.longitude,
      }}
      onDragEnd={(evt) => {
        setDraftLocation({
          latitude: evt.latLng.lat(),
          longitude: evt.latLng.lng(),
        });
      }}
    />
  );
};
export default LocationSelectMarker;
