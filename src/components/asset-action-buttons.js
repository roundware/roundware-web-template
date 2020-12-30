import React, { useState } from "react";
import { useRoundware } from "../hooks";
import Button from "@material-ui/core/Button";

import LinkIcon from "@material-ui/icons/Link";
import GetAppIcon from "@material-ui/icons/GetApp";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import FlagIcon from "@material-ui/icons/Flag";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles((theme) => {
  return {
    liked: {
      color: theme.palette.info.main,
    },
    flagged: {
      color: theme.palette.error.main,
    },
  };
});

export const VoteButton = ({ asset, votedClass, title, children }) => {
  const [voted, mark_voted] = useState(false);
  const { roundware } = useRoundware();
  const classes = useStyles();

  return (
    <Button
      title={title}
      className={voted ? classes[votedClass] : null}
      onClick={() => {
        if (!voted) {
          mark_voted(true);
          roundware.vote(asset.id, "like");
        }
      }}
    >
      {children}
    </Button>
  );
};

const downloadAsset = async (asset) => {
  let ext = (/(?:\.([^.]+))?$/).exec(asset.file)[1]
  let filename = asset.file
  const supported = ['mp3', 'wav'];
  if (supported.indexOf(ext) === -1) {
    ext = "mp3"
    filename = `${filename}.${ext}`
  }
  const response = await fetch(filename, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  });
  const blob = await response.blob();

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = `${asset.projectName}_${asset.id}`;
  a.href = blobUrl;
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
};
export const AssetActionButtons = ({ asset }) => {
  return (
    <div id="infoVoteBlock">
      <VoteButton
        title="tell us you like this one!"
        asset={asset}
        voteType="like"
        votedClass="liked"
      >
        <ThumbUpIcon />
      </VoteButton>

      <VoteButton
        title="tell us you like this one!"
        asset={asset}
        voteType="flag"
        votedClass="flagged"
      >
        <FlagIcon />
      </VoteButton>
      <Button
        onClick={() => {
          window.open(
            `/listen?eid=${asset.envelope_ids[0]}`,
            "_blank"
          );
        }}
        title="go to contribution page"
      >
        <LinkIcon />
      </Button>
      <Button
        onClick={() => downloadAsset(asset)}
        title="download this audio file"
      >
        <GetAppIcon />
      </Button>
    </div>
  );
};
