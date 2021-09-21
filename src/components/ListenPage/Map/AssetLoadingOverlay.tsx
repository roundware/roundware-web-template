import { Backdrop, Card, CircularProgress, Typography } from '@mui/material';
import React from 'react';
import makeStyles from '@mui/material/styles/makeStyles';
import { useRoundware } from '../../../hooks';
export const useLoadingStyles = makeStyles((theme) => {
	return {
		backdrop: {
			zIndex: theme.zIndex.drawer + 1,
			color: '#fff',
		},
		loadingCard: {
			display: 'flex',
			flexDirection: 'column',
		},
		loadingMessage: {
			padding: theme.spacing(2),
		},
		loadingSpinner: {
			alignSelf: 'center',
			margin: theme.spacing(3),
			color: 'inherit',
		},
	};
});
const AssetLoadingOverlay = () => {
	const { roundware } = useRoundware();

	const classes = useLoadingStyles();
	return (
		<Backdrop className={classes.backdrop} open={!Array.isArray(roundware.assetData)}>
			<Card className={classes.loadingCard}>
				<CircularProgress className={classes.loadingSpinner} />
				<Typography className={classes.loadingMessage}>Loading audio...</Typography>
			</Card>
		</Backdrop>
	);
};

export default AssetLoadingOverlay;
