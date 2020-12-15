import { useRoundware } from "../hooks";
import React from "react";

export const TagDisplay = ({ tagId }) => {
  const { roundware }= useRoundware();
  const description = roundware.findTagDescription(tagId);
  return <span className="rw-tag">{description}</span>;
};

export const TagsDisplay = ({ tagIds }) => {
  return (
    <div className="rw-tags">
      {tagIds.map((tagId) => (
        <React.Fragment key={tagId}>
          <TagDisplay tagId={tagId} /><br/>
        </React.Fragment>
      ))}
    </div>
  );
};
