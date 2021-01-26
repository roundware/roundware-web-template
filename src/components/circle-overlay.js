import React from 'react';
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { defaultTheme } from "../styles";
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';

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

  return (
    <Box className={classes.circleOverlay}>
        <div
          className={classes.circle}
        ></div>
    </Box>
  )
}

export default RangeCircleOverlay;
