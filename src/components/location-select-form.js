import React, {useEffect} from "react";
import {useRoundware} from "../hooks";
import LocationSelectMarker from "./location-select-marker";
import {RoundwareMapStyle} from "../map-style";
import {GoogleMap, LoadScript} from "@react-google-maps/api";
import { Button, Card, CardContent, CardActions, Typography, Container } from "@material-ui/core";
const getPosition = function (options) {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

const LocationSelectForm = () => {
    const {roundware, draftRecording, setDraftLocation, saveDraftLocation } = useRoundware();
    useEffect(() => {
        if (roundware._project) {
            setDraftLocation(roundware._project.location)
        }
    }, [roundware._project]);

    const getGeolocation = () => {
        if(!navigator.geolocation) {
            console.error('Geolocation is not supported by your browser');
        } else {
            getPosition().then(position => {
                setDraftLocation(position.coords);
            }).catch(console.error)
        }
    }
    if (!roundware) {
        return null
    }
    const containerStyle = {
        width: '400px',
        height: '400px',
        margin: "auto",
    }
    return <Card>
        <CardContent>
        <Container style={{
            marginTop: "1rem",
            marginBottom: "2rem"}}>
            <Typography variant={"h5"}>Where are you recording today?</Typography>
        </Container>
        <LoadScript id="script-loader" googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
        <GoogleMap
            mapContainerStyle={containerStyle}
            onLoad={(map) => {
                const styledMapType = new google.maps.StyledMapType(
                    RoundwareMapStyle,
                    { name: "Street Map" }
                );
                map.mapTypes.set("styled_map", styledMapType);
                map.setOptions({
                    center: {
                        lat: draftRecording.location.latitude,
                        lng: draftRecording.location.longitude
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
            <Button size="medium" variant={"contained"} aria-label="use my location" onClick={getGeolocation}>Use My Location</Button>
            <Button size="medium" color="primary" variant={"contained"} onClick={saveDraftLocation}>Next</Button>
        </CardActions>
    </Card>

}

export default LocationSelectForm;