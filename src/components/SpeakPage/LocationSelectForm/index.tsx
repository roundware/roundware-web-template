import { Button, Card, CardActions, CardContent, Typography, useTheme, Theme } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { makeStyles } from '@mui/styles';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { GoogleMap, LoadScript, LoadScriptProps } from '@react-google-maps/api';

import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useRoundware, useRoundwareDraft } from '../../../hooks';
import { RoundwareMapStyle } from '../../../styles/map-style';
import ErrorDialog from '../../ErrorDialog';
import LocationSelectMarker from './LocationSelectMarker';
import PlacesAutocomplete from './PlacesAutocomplete';
import config from 'config';
const getPosition = function (options?: PositionOptions): Promise<GeolocationPosition> {
	return new Promise(function (resolve, reject) {
		return navigator.geolocation.getCurrentPosition(resolve, reject, options);
	});
};

const useStyles = makeStyles((theme: Theme) => {
	return {
		container: {
			flexGrow: 1,
			margin: 'auto',
			marginBottom: 70,
		},
		button: {
			margin: 'auto',
		},
		cardActionButton: {
			marginRight: theme.spacing(2),

			[theme.breakpoints.down('sm')]: {
				paddingRight: theme.spacing(1),
				paddingLeft: theme.spacing(1),
			},
		},
		locationHeaderLabel: {
			fontSize: '2rem',
			padding: theme.spacing(2, 1, 1, 1),
			[theme.breakpoints.down('md')]: {
				fontSize: '1.2rem',
			},
			[theme.breakpoints.down('sm')]: {
				fontSize: '1.2rem',
			},
		},
		mapContainerDiv: {
			height: '60vh',
			margin: theme.spacing(2, 0),
			[theme.breakpoints.down('sm')]: {
				height: '50vh',
			},
			[theme.breakpoints.down('xs')]: {
				height: '45vh',
			},
		},
	};
});

const LocationSelectForm = () => {
	const draftRecording = useRoundwareDraft();
	const { roundware } = useRoundware();
	const theme = useTheme();
	const mapContainerStyle = {
		height: '100%',
		margin: theme.spacing(2, 0),
	};
	const classes = useStyles();
	const history = useHistory();
	const [error, set_error] = useState<Error | null>(null);
	const [geolocating, set_geolocating] = useState<boolean>(false);
	const gmapsLibraries = ['places'];

	useEffect(() => {
		if (draftRecording.tags.length === 0 && config.speak.allowSpeakTags === true) {
			history.replace('/speak/tags/0');
		}
	}, [draftRecording.tags]);

	if (!draftRecording.location.latitude || !draftRecording.location.longitude) {
		return null;
	}

	const getGeolocation = () => {
		if (!navigator.geolocation) {
			console.error('Geolocation is not supported by your browser');
		} else {
			set_geolocating(true);
			getPosition()
				.then((position) => {
					draftRecording.setLocation({
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					});
				})
				.catch((err) => {
					set_error(err);
				})
				.finally(() => {
					set_geolocating(false);
				});
		}
	};

	if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
		console.warn(`GOOGLE_MAPS_API_KEY was not provided! Script loading will fail.`);
	}
	return (
		<Card className={classes.container}>
			<ErrorDialog error={error} set_error={set_error} />
			<CardContent style={{ padding: 0 }}>
				<Typography variant={'h4'} className={classes.locationHeaderLabel}>
					Where are you recording today?
				</Typography>
				<LoadScript id='script-loader' googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''} libraries={gmapsLibraries as LoadScriptProps[`libraries`]}>
					<PlacesAutocomplete />
					<div className={classes.mapContainerDiv}>
						<GoogleMap
							mapContainerStyle={mapContainerStyle}
							onLoad={(map) => {
								const styledMapType = new google.maps.StyledMapType(RoundwareMapStyle, { name: 'Street Map' });
								map.mapTypes.set('styled_map', styledMapType);
								map.setOptions({
									center: {
										lat: draftRecording.location.latitude || 0,
										lng: draftRecording.location.longitude || 0,
									},
									zoom: 9,
									zoomControl: true,
									draggable: true,
									mapTypeControl: false,
									streetViewControl: false,
									draggableCursor: 'cursor',
									fullscreenControl: false,
									zoomControlOptions: {
										style: google.maps.ZoomControlStyle.SMALL,
									},
									rotateControl: false,
									mapTypeId: 'styled_map',
									mapTypeControlOptions: {
										mapTypeIds: [google.maps.MapTypeId.SATELLITE, 'styled_map'],
										style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
										position: google.maps.ControlPosition.BOTTOM_LEFT,
									},
								});
							}}
						>
							<LocationSelectMarker />
						</GoogleMap>
					</div>
				</LoadScript>
			</CardContent>
			{/* variant property does'nt exist here (removed) - Shreyas */}
			<CardActions>
				<Button className={classes.cardActionButton} startIcon={<ArrowBackIosIcon />} aria-label='back' onClick={history.goBack} variant={'contained'}>
					Back
				</Button>
				<Button className={classes.cardActionButton} variant={'contained'} aria-label='use my location' onClick={getGeolocation}>
					{geolocating ? <CircularProgress /> : 'Use My Location'}
				</Button>
				<Button
					className={classes.cardActionButton}
					color='primary'
					variant={'contained'}
					onClick={() => {
						history.push('/speak/recording');
						if (roundware.mixer && roundware.mixer.playing) {
							roundware.mixer.toggle();
						}
					}}
				>
					Next
				</Button>
			</CardActions>
		</Card>
	);
};

export default LocationSelectForm;
