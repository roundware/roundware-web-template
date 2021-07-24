import { useRoundware } from "../hooks";
import React from "react";

export const TagDisplay = ({ tagId }) => {
  const { roundware } = useRoundware();
  const description = roundware.findTagDescription(tagId, "speak");
  if (description) {
    return (
      <>
        <span className="rw-tag">{description}</span>
        <br />
      </>
    )
  } else {
    return null;
  }
};

export const TagsDisplay = ({ tagIds }) => {
  return (
    <div className="rw-tags">
      {tagIds.map((tagId) => (
        <React.Fragment key={tagId}>
          <TagDisplay tagId={tagId} />
        </React.Fragment>
      ))}
    </div>
  );
};
