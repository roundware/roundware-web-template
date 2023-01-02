import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import IconButton from '@mui/material/IconButton';
import LinkIcon from '@mui/icons-material/Link';
import GetAppIcon from '@mui/icons-material/GetApp';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import FlagIcon from '@mui/icons-material/Flag';

import { useRoundware } from '../../../../hooks';
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

export const AssetActionButtons = ({ asset, additionalActions }: { asset: IAssetData; additionalActions?: React.ReactNode }) => {
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
			<IconButton
				onClick={() => {
					if (Array.isArray(asset.envelope_ids) && asset.envelope_ids.length > 0) window.open(`/listen?eid=${asset.envelope_ids[0]}`, '_blank');
				}}
				style={{ minWidth: 30 }}
				title='go to contribution page'
			>
				<LinkIcon />
			</IconButton>
			<IconButton onClick={() => downloadAsset(asset, projectName)} style={{ minWidth: 30 }} title='download this audio file'>
				<GetAppIcon />
			</IconButton>
			{additionalActions}
		</div>
	);
};
export type VoteButtonStyles = {
	[index in 'liked' | 'flagged']: string;
} & {
	liked: {
		color: string;
	};
	flagged: {
		color: string;
	};
};
export const VoteButton = ({ asset, voteType, votedClass, title, children }: { asset: IAssetData; voteType: 'like' | 'flag'; votedClass: `flagged` | `liked`; title: string; children?: React.ReactNode }) => {
	const [voted, mark_voted] = useState(false);
	const { roundware } = useRoundware();

	return (
		<IconButton
			title={title}
			color={voted ? (votedClass == 'flagged' ? `error` : `info`) : undefined}
			style={{ minWidth: 30 }}
			onClick={() => {
				if (!voted) {
					mark_voted(true);
					roundware.vote(asset.id, voteType);
				}
			}}
		>
			{children}
		</IconButton>
	);
};

export const useStyles = makeStyles((theme) => {
	return {
		liked: {
			color: theme.palette.info.main,
		},
		flagged: {
			color: theme.palette.error.main,
		},
		vote: {
			color: theme.palette.grey[600],
		},
	};
});
