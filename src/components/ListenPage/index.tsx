import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';
import RoundwareMap from './Map';

const useStyles = makeStyles((theme) => {
	return {
		map: {
			display: 'flex',
		},
	};
});

const ListenPage = () => {
	const classes = useStyles();

	if (!process.env.GOOGLE_MAPS_API_KEY) {
		console.warn(`GOOGLE_MAPS_API_KEY was not found in env variable. Please pass it to enable Google Maps component.`);
		return null;
	}
	return (
		<>
			<RoundwareMap className={classes.map} googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} />
		</>
	);
};

export default ListenPage;
