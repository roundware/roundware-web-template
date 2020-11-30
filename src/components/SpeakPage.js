import React, {Fragment, useEffect, useState} from "react";
import { useRoundware } from "../hooks";
import TagSelectForm from "./tag-select-form";
import LocationSelectForm from "./location-select-form";
import CreateRecordingForm from "./create-recording-form";

const formComponents = {
  tags: TagSelectForm,
  location: LocationSelectForm,
  recording: CreateRecordingForm
}
export const SpeakPage = () => {

  const [CurrentFormComponent, set_current_form_component] = useState('tags')

  const { roundware, draftRecording } = useRoundware();

  useEffect(() => {
    let nextForm = 'tags'
    if (draftRecording.doneTagging) {
      nextForm = 'location'
    }
    if (draftRecording.doneSelectingLocation) {
      nextForm = 'recording'
    }
    set_current_form_component(nextForm);

  }, [draftRecording.doneTagging, draftRecording.doneSelectingLocation])
  if (roundware === null || !roundware.uiConfig) {
    return null;
  }
  return React.createElement(formComponents[CurrentFormComponent], {});
};
