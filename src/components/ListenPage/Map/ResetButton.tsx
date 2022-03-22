import React from 'react';
import Button from '@mui/material/Button';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import { useGoogleMap } from '@react-google-maps/api';
import config from 'config.json';
import { Coordinates } from 'roundware-web-framework/dist/types';
import { useRoundware } from 'hooks';
type Props = {
	updateLocation: (coords: Coordinates) => void;
};

const ResetButton = ({ updateLocation }: Props) => {
	const map = useGoogleMap();
	const { roundware } = useRoundware();
	return (
		<Button
			onClick={() => {
				if (!map) return;
				map.setZoom(config.zoom.low);
				updateLocation(roundware.project.location);
			}}
			sx={{
				position: 'fixed',
				zIndex: 100,
				right: 20,
				bottom: 68,
				backgroundColor: '#cccccc',
				'&:hover': {
					backgroundColor: '#aaaaaa',
				},
			}}
		>
			<ZoomOutMapIcon fontSize='large' />
		</Button>
	);
};

export default ResetButton;
