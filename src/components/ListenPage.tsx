import React, { useEffect } from 'react';
import RoundwareMap from './Map';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useQuery, useRoundware } from '../hooks';

const useStyles = makeStyles((theme) => {
	return {
		map: {
			display: 'flex',
		},
	};
});

const ListenPage = () => {
	const classes = useStyles();

	return <RoundwareMap className={classes.map} googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} />;
};

// export default for supporting react lazy loading
export default ListenPage;
