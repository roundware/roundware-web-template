import React, { useState } from 'react';

import Button from '@mui/material/Button';
import LinkIcon from '@mui/icons-material/Link';
import GetAppIcon from '@mui/icons-material/GetApp';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagIcon from '@mui/icons-material/Flag';

import { VoteButton } from './VoteButton';
import { useRoundware } from '../../../../../hooks';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';

const downloadAsset = async (asset: IAssetData, projectName: string) => {
	if (!asset.file) return;
	const exts = /(?:\.([^.]+))?$/.exec(asset.file);
	// no extension found
	if (!Array.isArray(exts)) return;
	let ext = exts[1];
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

export const AssetActionButtons = ({ asset }: { asset: IAssetData }) => {
	const { roundware } = useRoundware();
	const projectName = roundware.project.projectName;

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
					if (Array.isArray(asset.envelope_ids) && asset.envelope_ids.length > 0) window.open(`/listen?eid=${asset.envelope_ids[0]}`, '_blank');
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
