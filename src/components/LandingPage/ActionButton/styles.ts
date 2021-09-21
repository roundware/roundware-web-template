import { makeStyles } from '@mui/material';

export const useStyles = makeStyles((theme: { spacing: (arg0: number) => any; breakpoints: { down: (arg0: string) => any } }) => {
	return {
		actionButton: {
			margin: theme.spacing(2),
			width: 300,
			// padding: 50
			height: 100,
			[theme.breakpoints.down('md')]: {
				width: 250,
				height: 75,
			},
		},
		buttonLabel: {
			margin: theme.spacing(2),
			[theme.breakpoints.down('md')]: {
				fontSize: '2rem',
			},
		},
	};
});
