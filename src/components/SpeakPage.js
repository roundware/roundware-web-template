import React, { useEffect } from "react";
import { useRoundware } from "../hooks";
import TagSelectForm from "./tag-select-form";
import LocationSelectForm from "./location-select-form";
import CreateRecordingForm from "./create-recording-form";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Route, Switch, useHistory } from "react-router-dom";
import { DraftRecordingProvider } from "../providers/DraftRecordingProvider"

const useStyles = () => makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
  rootFormContainer: {
    paddingTop: '3rem',
    paddingBottom: '3rem',
    [theme.breakpoints.down('sm')]: {
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  responsiveFormContainer: {
    margin: "auto"
  },
}))


const SpeakPage = (props) => {
  const { roundware } = useRoundware();
  const classes = useStyles();
  const history = useHistory();
  useEffect(() => {
    // if we are directed to the 'speak' page directly,
    // redirect to the first tag selection page
    if (props.match.isExact === true) {
      history.replace('/speak/tags/0');
    }
  }, []
  )

  if (roundware === null || !roundware.uiConfig) {
    return null;
  }

  return (
    <DraftRecordingProvider roundware={roundware}>
      <Grid container
        className={classes.rootFormContainer}>
        <Grid item
          className={classes.responsiveFormContainer}
          style={{ 'margin': "auto" }}
          xs={12} sm={10} md={8} lg={6} >
          <Switch>
            <Route path={`${props.match.path}/tags/:tagGroupIndex`} component={TagSelectForm} />
            <Route path={`${props.match.path}/location`} component={LocationSelectForm} />
            <Route path={`${props.match.path}/recording`} component={CreateRecordingForm} />
          </Switch>
        </Grid>
      </Grid>
    </DraftRecordingProvider>
  );
};

export default SpeakPage;
