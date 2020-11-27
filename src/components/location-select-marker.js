import React, {useEffect, useState} from "react";
import {RoundwareMapStyle} from "../map-style";
import {GoogleMap, LoadScript, Marker, LatLng, useGoogleMap} from "@react-google-maps/api";
import {useRoundware} from "../hooks";
import Button from "@material-ui/core/Button";

const LocationSelectMarker = () => {
    const {draftRecording, setDraftLocation} = useRoundware();

    const map = useGoogleMap();
    return <Marker
        draggable={true}
        position={{
            lat: draftRecording.location.latitude,
            lng: draftRecording.location.longitude
        }}
        onDragEnd={(evt) => {
            setDraftLocation({latitude: evt.latLng.lat(), longitude: evt.latLng.lng()})
            map.panTo(evt.latLng);
        }}/>
}
export default LocationSelectMarker;