import React, { Fragment, useEffect, useState } from "react";
import { useRoundware } from "../hooks";
import TagSelectForm from "./tag-select-form";
import LocationSelectForm from "./location-select-form";
import CreateRecordingForm from "./create-recording-form";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Route, Switch, useHistory, useLocation} from "react-router-dom";

const useStyles = () => makeStyles(theme => ({
  root: {
    paddingTop: "5rem",
    paddingBottom: "5rem"
  },
  responsiveFormContainer: {
    margin: "auto"
  }
}))


const SpeakPage = (props) => {
  const { roundware, uiConfig } = useRoundware();
  const classes = useStyles();
  const history = useHistory();

  if (roundware === null || !uiConfig) {
    return null;
  }
  // if we are directed to the 'speak' page directly,
  // redirect to the first tag selection page
  if (props.match.isExact === true) {
    history.replace('/speak/tags/0');
    return null;
  }
  return (
    <Grid container className={classes.root}>
      <Grid item
            className={classes.responsiveFormContainer}
            style={{'margin': "auto"}}
            xs={12} sm={10} md={6} lg={4} >
        <Switch>
          <Route path={`${props.match.path}/tags/:tagGroupIndex`} component={TagSelectForm } />
          <Route path={`${props.match.path}/location`} component={LocationSelectForm} />
          <Route path={`${props.match.path}/recording`} component={CreateRecordingForm} />
        </Switch>
      </Grid>
    </Grid>
  );
};

export default SpeakPage;
