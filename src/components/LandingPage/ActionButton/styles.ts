import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme) => {
	return {
		actionButton: {
			margin: theme.spacing(2),
			width: 300,
			// padding: 50
			height: 100,
			[theme.breakpoints.down('sm')]: {
				width: 250,
				height: 75,
			},
		},
		buttonLabel: {
			margin: theme.spacing(2),
			[theme.breakpoints.down('sm')]: {
				fontSize: '2rem',
			},
		},
	};
});
