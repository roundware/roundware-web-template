import React, {useEffect} from 'react';
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { defaultTheme } from "../styles";
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import {useGoogleMap} from "@react-google-maps/api";
import {useRoundware} from "../hooks";

const useStyles = makeStyles((theme) => {
  return {
    circleOverlay: {
      width: "100%",
      height: "100%",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10,
      pointerEvents: "none",
      [theme.breakpoints.down('sm')]: {
        width: "100%",
        height: "100%",
      },
    },
    circle: {
      borderRadius: "50%",
      width: 500,
      height: 500,
      margin: "auto",
      borderWidth: 2,
      borderColor: "#159095",
      borderStyle: "solid",
      position: "relative",
      top: "50%",
      transform: "translateY(-50%)",
      [theme.breakpoints.only('xs')]: {
        width: 300,
        height: 300,
      },
      [theme.breakpoints.only('sm')]: {
        width: 500,
        height: 500,
      },
      [theme.breakpoints.only('md')]: {
        width: 550,
        height: 550,
      },
      [theme.breakpoints.up('lg')]: {
        width: 600,
        height: 600,
      },
    },
  }
})

const RangeCircleOverlay = () => {
  const classes = useStyles();
  const theme = useTheme();
  const map = useGoogleMap();
  const { roundware, forceUpdate } = useRoundware();
  const loc = roundware._listenerLocation
  const lat = loc && loc.latitude
  const lng = loc && loc.longitude
  const center = { lat, lng }
  const ready = typeof(lat) === "number" && typeof(lng) === "number"

  // when the listenerLocation is updated, center the map
  useEffect(() => {
    if (ready) {
      const c = map.getCenter();
      if (center.lat !== c.lat() || center.lng !== c.lng()) {
        map.panTo(center)
      }
    }
  }, [lat, lng])

  useEffect(() => {
    if (!map) {
      return
    }
    map.addListener('zoom_changed', () => {
      // from https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to
      const metersPerPixel = 156543.03392 * Math.cos(map.getCenter().lat() * Math.PI / 180) / Math.pow(2, map.getZoom())
      // todo: use the actual height / width of the circle element to get this value
      const newRadius = (300 / 2) * metersPerPixel;
      roundware._project.recordingRadius = newRadius;
      if (roundware._mixer) {
        roundware._mixer.updateParams({maxDist: newRadius})
      }
      forceUpdate()
    });
  }, [map])

  return (
    <Box className={classes.circleOverlay}>
        <div
          className={classes.circle}
        ></div>
    </Box>
  )
}

export default RangeCircleOverlay;
