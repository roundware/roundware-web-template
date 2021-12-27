import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Circle, InfoWindow, Marker, useGoogleMap } from '@react-google-maps/api';
import React from 'react';
import { useRoundware } from '../../../../hooks';
import WalkingModePin from 'url:../../../../assets/walkingModePin.svg';
const ListenerLocationMarker = () => {
	const { roundware } = useRoundware();
	const map = useGoogleMap();
	const theme = useTheme();
	const loc = roundware.listenerLocation;
	const lat = loc && loc.latitude;
	const lng = loc && loc.longitude;
	const center = { lat: lat!, lng: lng! };

	// if (!ready) {
	//   return null;
	// }

	const iconPin = {
		url: WalkingModePin,
		scaledSize: new google.maps.Size(30, 30),
	};

	return (
		<>
			<Circle
				radius={roundware.project.recordingRadius}
				center={center}
				onLoad={(circle) => {
					const newBounds = circle.getBounds();
					if (map !== null && newBounds) map.panToBounds(newBounds);
				}}
				options={{
					strokeColor: theme.palette.secondary.light,
					strokeOpacity: 0.5,
					strokeWeight: 0,
					fillColor: theme.palette.primary.light,
					fillOpacity: 0.3,
					clickable: false,
					draggable: false,
					editable: false,
					visible: true,
					zIndex: 1,
				}}
			/>

			<Marker position={{ lat: center.lat, lng: center.lng }} icon={iconPin}>
				<InfoWindow
					options={{
						disableAutoPan: false,
						pixelOffset: new google.maps.Size(0, -30),
					}}
					position={{ lat: center.lat, lng: center.lng }}
				>
					<Typography variant='body2' style={{ color: 'black' }}>
						You Are Here
					</Typography>
				</InfoWindow>
			</Marker>
		</>
	);
};

export default ListenerLocationMarker;
