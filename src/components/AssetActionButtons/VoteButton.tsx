import { useStyles } from './styles';
import { useRoundware } from 'hooks';
import { useState } from 'react';

interface VoteButtonProps {
	children: React.ReactNode;
	title: string;
	votedClass: string;
	asset: any;
}
export const VoteButton = ({ asset, votedClass, title, children }: VoteButtonProps) => {
	const [voted, mark_voted] = useState(false);
	const { roundware } = useRoundware();
	const classes = useStyles();

	return (
		<Button
			title={title}
			className={voted ? classes[votedClass] : null}
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
