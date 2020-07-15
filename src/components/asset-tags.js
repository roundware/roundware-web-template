import {useRoundware} from "../hooks";
import React from "react";

export const TagDisplay = ({tagId}) => {
  const {roundware} = useRoundware();
  // todo clicking tags could do something
  return <span className="rw-tag">{roundware.findTagDescription(tagId)}</span>
}

export const TagsDisplay = ({tagIds}) => {
  return <div className="rw-tags" >
    { tagIds.map(tagId => <TagDisplay key={tagId} tagId={tagId} />) }
  </div>
}

