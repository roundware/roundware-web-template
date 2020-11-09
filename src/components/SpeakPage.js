import React, { Fragment } from "react";
import { useRoundware } from "../hooks";
import TagSelectForm from "./tag-select-form";

export const SpeakPage = () => {
  const { roundware, draftRecording } = useRoundware();
  if (roundware === null || !roundware.uiConfig) {
    return null;
  }
  // todo this doesn't really capture the way nested tag groups work in RW
  // const remainingForms = tagGroups.any(
  //     group => group.some(item => draftRecording.tags.includes(item))
  // )
  return (
    <Fragment>
      <div>
        {JSON.stringify(draftRecording)}
      </div>
      <TagSelectForm tagGroups={roundware.uiConfig.speak} />
    </Fragment>
  );
};
