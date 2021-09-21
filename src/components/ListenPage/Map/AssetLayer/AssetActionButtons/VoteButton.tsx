import { useStyles, VoteButtonStyles } from './styles';
import { useRoundware } from '../../../../../hooks';
import React, { useState } from 'react';
import Button from '@mui/material/Button';
interface VoteButtonProps {
	children: React.ReactNode;
	title: string;
	votedClass: 'liked' | 'flagged';
	voteType: 'like' | 'flag';
	asset: any;
}
export const VoteButton = ({ asset, voteType, votedClass, title, children }: VoteButtonProps) => {
	const [voted, mark_voted] = useState(false);
	const { roundware } = useRoundware();
	const classes = useStyles();

	return (
		<Button
			title={title}
			className={voted ? classes[votedClass] : undefined}
			style={{ minWidth: 30 }}
			onClick={() => {
				if (!voted) {
					mark_voted(true);
					roundware.vote(asset.id, 'like');
				}
			}}
		>
			{children}
		</Button>
	);
};
