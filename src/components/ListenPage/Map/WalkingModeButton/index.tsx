import React, { useState, useEffect } from 'react';
import { useRoundware } from '../../../../hooks';
import { GeoListenMode } from 'roundware-web-framework';
import { useGoogleMap } from '@react-google-maps/api';
import { makeStyles, useTheme } from '@mui/styles';
import Button from '@mui/material/Button';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import MapIcon from '@mui/icons-material/Map';
import ListenerLocationMarker from './ListenerLocationMarker';
import clsx from 'clsx';
import LoadingOverlay from './LoadingOverlay';
import * as messages from '../../../../locales/en_US.json';
const useStyles = makeStyles((theme) => {
	return {
		walkingModeButton: {
			position: 'fixed',
			zIndex: 100,
			left: 20,
			bottom: 68,
			backgroundColor: '#cccccc',
			'&:hover': {
				backgroundColor: '#aaaaaa',
			},
		},
		hidden: {
			display: 'none',
		},
	};
});

const walkingModeButton = () => {
	const { roundware, forceUpdate, geoListenMode, setGeoListenMode } = useRoundware();

	if (!roundware?.project) return null;
	const [busy, setBusy] = useState(false);
	const map = useGoogleMap();
	const classes = useStyles();

	const loc = roundware.listenerLocation;
	const lat = loc && loc.latitude;
	const lng = loc && loc.longitude;
	const center = { lat: lat!, lng: lng! };
	const ready = typeof lat === 'number' && typeof lng === 'number';

	// when the listenerLocation is updated, center the map
	useEffect(() => {
		if (ready) {
			const c = map?.getCenter();
			if (!c) return;
			if (!center) return;
			if (center.lat !== c?.lat() || center.lng !== c?.lng()) {
				map?.panTo(center);
				console.log('new location provided by framework');
			}
		}
	}, [lat, lng]);

	const availableListenModes = process.env.AVAILABLE_LISTEN_MODES || 'map,walking';
	const availableListenModesArray = availableListenModes.split(',').map(String);

	const displayListenModeButton = availableListenModesArray.length == 2 ? true : false;

	// set default GeoListenMode
	useEffect(() => {
		if (availableListenModesArray[0] == 'map') {
			console.log('default to map mode');
			setGeoListenMode(GeoListenMode.MANUAL);
		} else {
			console.log('default to walking mode');
			setGeoListenMode(GeoListenMode.AUTOMATIC);
		}
	}, []);

	const enterMapMode = () => {
		if (!map) return;
		console.log('switching to map mode');
		// zoom out
		map.setZoom(5);
		// enable map panning
		map.setOptions({ gestureHandling: 'cooperative' });
		// stop listening for location updates
		setGeoListenMode(GeoListenMode.MANUAL);
		// update text instructions?
	};

	const [walkingModeStatus, setWalkingModeStatus] = useState('');
	const [walkingModeErrorMessage, setWalkingModeErrorMessage] = useState<null | { title: string; message: string }>(null);

	const enableWalkingMode = () => {
		if (!map) return console.log('map not available yet!');
		console.log('switching to walking mode');
		// disable map panning
		map.setOptions({ gestureHandling: 'none' });
		// zoom in
		map.setZoom(22);
		// determine user location and listen for updates
		setGeoListenMode(GeoListenMode.AUTOMATIC);
	};

	// will check if eligible to enter walking mode
	const enterWalkingMode = async () => {
		if (!map) return;

		if (!navigator.geolocation) {
			setWalkingModeStatus('error');
			setWalkingModeErrorMessage(messages.errors.walkingModeNotSupported);
			enterMapMode();
		} else {
			setWalkingModeStatus('locating');
			try {
				roundware.geoPosition.enable();
				const location = await roundware.geoPosition.waitForInitialGeolocation();

				if (process.env.USE_LISTEN_MAP_BOUNDS !== 'true') {
					setWalkingModeStatus('eligible');
					enableWalkingMode();
					return;
				}
				const userlatlng = new google.maps.LatLng(location.latitude!, location.longitude!);

				const {
					southwest: { latitude: swLat, longitude: swLng },
					northeast: { latitude: neLat, longitude: neLng },
				} = roundware.getMapBounds();
				const bounds = new google.maps.LatLngBounds({ lat: swLat!, lng: swLng! }, { lat: neLat!, lng: neLng! });

				if (!bounds || bounds.contains(userlatlng)) {
					setWalkingModeStatus('eligible');
					enableWalkingMode();
				} else {
					setWalkingModeStatus('error');
					setWalkingModeErrorMessage(messages.errors.outOfRange);
				}
			} catch (e: any) {
				setWalkingModeStatus('error');
				// @see https://developer.mozilla.org/en-US/docs/Web/API/GeolocationPositionError
				switch (e?.code) {
					case 1:
						// permission denied
						setWalkingModeErrorMessage(messages.errors.permissionDenied);
						break;

					case 3:
						setWalkingModeErrorMessage(messages.errors.timeOut);
						break;
					case 2:
					// position unavailable
					default:
						setWalkingModeErrorMessage(messages.errors.failedToDetermineLocation);
						break;
				}
				enterMapMode();
			}
		}
	};

	const toggleWalkingMode = async () => {
		setBusy(true);
		if (geoListenMode === GeoListenMode.AUTOMATIC && map !== null) {
			enterMapMode();
		} else if ([GeoListenMode.MANUAL, GeoListenMode.DISABLED].includes(geoListenMode) && map !== null) {
			await enterWalkingMode();
		}
		if (roundware.mixer) {
			const trackIds = Object.keys(roundware.mixer?.playlist?.trackIdMap || {}).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
		}
		setBusy(false);
	};

	return (
		<div>
			<LoadingOverlay open={walkingModeStatus === 'locating'} message='Locating...' />
			<Dialog open={walkingModeStatus === ('error' || 'out-of-range')}>
				<DialogTitle>{walkingModeErrorMessage?.title}</DialogTitle>
				<DialogContent>
					<DialogContentText>{walkingModeErrorMessage?.message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setWalkingModeStatus('')}>OK</Button>
				</DialogActions>
			</Dialog>
			<Button className={clsx(classes.walkingModeButton, displayListenModeButton ? null : classes.hidden)} color='primary' disabled={busy} onClick={toggleWalkingMode}>
				{geoListenMode === GeoListenMode.AUTOMATIC ? <MapIcon fontSize='large' /> : <DirectionsWalkIcon fontSize='large' />}
			</Button>
			{geoListenMode === GeoListenMode.AUTOMATIC ? <ListenerLocationMarker /> : null}
		</div>
	);
};

export default walkingModeButton;
