import { makeStyles } from '@mui/material';

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
export const useStyles = makeStyles((theme) => {
	return {
		liked: {
			color: theme.palette.info.main,
		},
		flagged: {
			color: theme.palette.error.main,
		},
	};
});
