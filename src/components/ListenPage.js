import React, {useEffect} from "react";
import RoundwareMap from "./map";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useRoundware} from "../hooks";
import {useLocation, useRouteMatch} from "react-router";

const useStyles = makeStyles(theme => {
  return {
    root: {
      flexGrow: 1,
      display: "flex",
    },
    map: {
      flexGrow: 1,
    }
  }
})
// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const ListenPage = () => {
  const classes = useStyles();
  const { setEidFilter } = useRoundware();
  const query = useQuery();

  useEffect( () => {
    const eidFilter = query.get("eid");
    if (eidFilter) {
      setEidFilter([parseInt(eidFilter)]);
    } else {
      setEidFilter([]);
    }
  },  [query.get("eid")])

  return <RoundwareMap
        className={classes.map}
        googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} />
}
