import React, {useState} from 'react';
import {useRoundware} from "../hooks";
export const VoteButton = ({asset, votedClass, title, icon}) => {
  const [voted, mark_voted] = useState(false);
  const {roundware} = useRoundware();
  return <button
    className={`markerAction ${voted ? votedClass : ''} fa fa-${icon}`}
    title={title}
    disabled={voted}
    onClick={() => {
      mark_voted(true);
      roundware.vote(asset.id, 'like');
    }}
  >
  </button>
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
      icon='thumbs-up'
    />

    <VoteButton
      title="tell us you like this one!"
      asset={asset}
      voteType='flag'
      votedClass='flagged'
      icon='flag'
    />

    <button
      onClick={() => {
        window.open(`https://coronadiaries.io/s.html?eid=${asset.envelope_ids[0]}`, '_blank');
      }}
      className="markerAction fa fa-link"
      title="go to contribution page"
    >
    </button>
    <button
      onClick={() => downloadAsset(asset)}
      className="markerAction fa fa-download"
      title="download this audio file"
    >
    </button>
  </div>
}
