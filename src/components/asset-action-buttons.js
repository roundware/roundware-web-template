import React, {useState} from 'react';
import {useRoundware} from "../hooks";
import Button from "@material-ui/core/Button";

import LinkIcon from "@material-ui/icons/Link";
import GetAppIcon from "@material-ui/icons/GetApp";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import FlagIcon from '@material-ui/icons/Flag';

export const VoteButton = ({asset, votedClass, title, children}) => {
  const [voted, mark_voted] = useState(false);
  const {roundware} = useRoundware();
  return <Button
    title={title}
    disabled={voted}
    onClick={() => {
      mark_voted(true);
      roundware.vote(asset.id, 'like');
    }}
  >
    {children}
  </Button>
}

const downloadAsset = async asset => {
  const response = await fetch(`${asset.file}.mp3`, {
    headers: new Headers({
      'Origin': location.origin
    }),
    mode: 'cors'
  })
  const blob = await response.blob();

  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = `${asset.projectName}_${asset.id}`;
  a.href = blobUrl;
  // For Firefox https://stackoverflow.com/a/32226068
  document.body.appendChild(a);
  a.click();
  a.remove();
}
export const AssetActionButtons = ({asset}) => {
  return <div id="infoVoteBlock">

    <VoteButton
      title="tell us you like this one!"
      asset={asset}
      voteType='like'
      votedClass='liked'
    >
      <ThumbUpIcon />
    </VoteButton>

    <VoteButton
      title="tell us you like this one!"
      asset={asset}
      voteType='flag'
      votedClass='flagged'
    >
      <FlagIcon />
    </VoteButton>
    <Button
      onClick={() => {
        window.open(`https://coronadiaries.io/s.html?eid=${asset.envelope_ids[0]}`, '_blank');
      }}
      title="go to contribution page"
    ><LinkIcon />
    </Button>
    <Button
      onClick={() => downloadAsset(asset)}
      title="download this audio file"
    >
      <GetAppIcon />
    </Button>
  </div>
}
