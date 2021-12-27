import Box from '@mui/material/Box';
import { makeStyles, useTheme } from '@mui/styles';
import { useGoogleMap } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import useDimensions from 'react-cool-dimensions';
import { GeoListenMode } from 'roundware-web-framework';
import { Coordinates } from 'roundware-web-framework/dist/types';
import { useRoundware } from '../../../hooks';

const useStyles = makeStyles((theme) => {
	return {
		circleOverlay: {
			width: '100%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0,
			zIndex: 10,
			pointerEvents: 'none',
		},
		circle: {
			borderRadius: '50%',
			width: 500,
			height: 500,
			margin: 'auto',
			borderWidth: 2,
			borderColor: '#159095',
			borderStyle: 'solid',
			position: 'relative',
			top: '50%',
			transform: 'translateY(-50%)',
			boxShadow: '0 0 0 99999px rgba(0, 0, 0, .1)',
			[theme.breakpoints.only('xs')]: {
				width: 300,
				height: 300,
			},
			[theme.breakpoints.only('sm')]: {
				width: 500,
				height: 500,
			},
			[theme.breakpoints.only('md')]: {
				width: 550,
				height: 550,
			},
			[theme.breakpoints.up('lg')]: {
				width: 600,
				height: 600,
			},
		},
	};
});

const RangeCircleOverlay = ({ updateLocation }: { updateLocation: (newLocation: Coordinates) => void }) => {
	const classes = useStyles();
	const theme = useTheme();
	const map = useGoogleMap();
	const { roundware, forceUpdate, geoListenMode } = useRoundware();

	// Shreyas - use observe instead of ref
	const { observe, width, height } = useDimensions<HTMLDivElement>({
		onResize: ({ observe, unobserve, width, height, entry }) => {
			// Triggered whenever the size of the target is changed...

			unobserve(); // To stop observing the current target element
			observe(); // To re-start observing the current target element
		},
	});
	const [resizeListener, set_resize_listener] = useState<google.maps.MapsEventListener | undefined>(undefined);
	const isPlaying = roundware.mixer && roundware.mixer.playing;

	useEffect(() => {
		if (!map) {
			return;
		}
		if (resizeListener) {
			resizeListener.remove();
		}
		if (!isPlaying) {
			set_resize_listener(undefined);
			return;
		}
		const set_radius_with_circle_geom = () => {
			if (!map) return;
			const mapCenter = map.getCenter();

			if (!mapCenter) return;
			const lat = mapCenter?.lat();
			const lng = mapCenter?.lng();

			updateLocation({ latitude: lat, longitude: lng });
			// from https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to
			const metersPerPixel = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, map.getZoom()!);
			// todo: use the actual height / width of the circle element to get this value
			const newRadius = (width / 2) * metersPerPixel;
			// roundware.project.recordingRadius = newRadius;
			// set listening range to project recordingRadius when in walking mode
			// set listening range to overlay circle when in map mode
			if (roundware.mixer) {
				if (geoListenMode === GeoListenMode.AUTOMATIC) {
					roundware.mixer.updateParams({
						maxDist: roundware.project.recordingRadius,
						recordingRadius: roundware.project.recordingRadius,
					});
				} else if (geoListenMode === GeoListenMode.MANUAL) {
					roundware.mixer.updateParams({
						maxDist: newRadius,
						recordingRadius: newRadius,
					});
				}
			}
			forceUpdate();
		};

		const circleSizeListener = map.addListener('zoom_changed', () => set_radius_with_circle_geom());
		set_resize_listener(circleSizeListener);
		set_radius_with_circle_geom();
	}, [map, width, isPlaying]);

	return (
		<Box className={classes.circleOverlay} style={{ visibility: geoListenMode === GeoListenMode.MANUAL && isPlaying ? 'inherit' : 'hidden' }}>
			<div ref={observe} className={classes.circle} />
		</Box>
	);
};

export default RangeCircleOverlay;
