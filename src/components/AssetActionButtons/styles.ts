import { makeStyles } from '@material-ui/core';

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
