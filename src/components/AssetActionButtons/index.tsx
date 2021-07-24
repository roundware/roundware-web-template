import React, { useState } from 'react';

import Button from '@material-ui/core/Button';
import LinkIcon from '@material-ui/icons/Link';
import GetAppIcon from '@material-ui/icons/GetApp';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import FlagIcon from '@material-ui/icons/Flag';

import { VoteButton } from './VoteButton';
import { useRoundware } from 'hooks';

const downloadAsset = async (asset, projectName) => {
	let ext = /(?:\.([^.]+))?$/.exec(asset.file)[1];
	let filename = asset.file;
	const supported = ['mp3', 'wav', 'mp4', 'm4a'];
	if (supported.indexOf(ext) === -1) {
		ext = 'mp3';
		filename = `${filename}.${ext}`;
	}
	const response = await fetch(filename, {
		headers: new Headers({
			Origin: location.origin,
		}),
		mode: 'cors',
	});
	const blob = await response.blob();

	const blobUrl = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.download = `${projectName}_${asset.id}`;
	a.href = blobUrl;
	// For Firefox https://stackoverflow.com/a/32226068
	document.body.appendChild(a);
	a.click();
	a.remove();
};

export const AssetActionButtons = ({ asset }) => {
	const { roundware } = useRoundware();
	const projectName = roundware._project.projectName;

	return (
		<div id='infoVoteBlock'>
			<VoteButton title='tell us you like this one!' asset={asset} voteType='like' votedClass='liked'>
				<ThumbUpIcon />
			</VoteButton>
			<VoteButton title='tell us you are concerned about this one!' asset={asset} voteType='flag' votedClass='flagged'>
				<FlagIcon />
			</VoteButton>
			<Button
				onClick={() => {
					window.open(`/listen?eid=${asset.envelope_ids[0]}`, '_blank');
				}}
				style={{ minWidth: 30 }}
				title='go to contribution page'
			>
				<LinkIcon />
			</Button>
			<Button onClick={() => downloadAsset(asset, projectName)} style={{ minWidth: 30 }} title='download this audio file'>
				<GetAppIcon />
			</Button>
		</div>
	);
};
