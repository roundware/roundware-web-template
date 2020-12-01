import React, { Fragment, useEffect, useState } from "react";
import { useRoundware } from "../hooks";
import TagSelectForm from "./tag-select-form";
import LocationSelectForm from "./location-select-form";
import CreateRecordingForm from "./create-recording-form";
import Grid from "@material-ui/core/Grid";

const formComponents = {
  tags: TagSelectForm,
  location: LocationSelectForm,
  recording: CreateRecordingForm,
};
const CurrentForm = () => {
  const [CurrentFormComponent, set_current_form_component] = useState("tags");

  const { roundware, draftRecording } = useRoundware();

  useEffect(() => {
    let nextForm = "tags";
    if (draftRecording.doneTagging) {
      nextForm = "location";
    }
    if (draftRecording.doneSelectingLocation) {
      nextForm = "recording";
    }
    if (CurrentFormComponent !== nextForm) {
      window.scrollTo(0, 0);
    }
    set_current_form_component(nextForm);
  }, [draftRecording.doneTagging, draftRecording.doneSelectingLocation]);
  if (roundware === null || !roundware.uiConfig) {
    return null;
  }
  return React.createElement(formComponents[CurrentFormComponent], {});
};

const SpeakPage = () => {
  return (
    <Grid container style={{ paddingBottom: "5rem" }}>
      <Grid item xs={11} sm={10} md={8}>
        <CurrentForm />
      </Grid>
    </Grid>
  );
};

export default SpeakPage;
