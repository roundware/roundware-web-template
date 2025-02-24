import config from '@/config';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import Button from '@mui/material/Button';
import { useGoogleMap } from '@react-google-maps/api';

import { useRoundware } from '@/hooks';
import { Coordinates, GeoListenMode } from 'roundware-web-framework/dist/index';

type Props = {
	updateLocation: (coords: Coordinates) => void;
};

const ResetButton = ({ updateLocation }: Props) => {
	const map = useGoogleMap();
	const { roundware, geoListenMode } = useRoundware();
	if (geoListenMode != GeoListenMode.MANUAL) return null;
	return (
		<Button
			onClick={() => {
				if (!map) return;
				map.setZoom(config.map.zoom.low);
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
