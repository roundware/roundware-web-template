import { makeStyles } from '@material-ui/core/styles';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React, { useState, useCallback } from 'react';
import { Coordinates } from 'roundware-web-framework/dist/types';
import { useRoundware } from '../../../hooks';
import { RoundwareMapStyle } from '../../../styles/map-style';
import AssetLayer from './AssetLayer';
import AssetLoadingOverlay from './AssetLoadingOverlay';
import RangeCircleOverlay from './RangeCircleOverlay';
import WalkingModeButton from './WalkingModeButton';

const useStyles = makeStyles((theme) => {
	return {
		roundwareMap: {
			flexGrow: 1,
		},
	};
});

interface RoundwareMapProps {
	googleMapsApiKey: string;
	className: string;
}
const RoundwareMap = (props: RoundwareMapProps) => {
	const classes = useStyles();
	const { roundware } = useRoundware();
	const [map, setMap] = useState<google.maps.Map<Element> | undefined>();

	const updateListenerLocation = (newLocation?: Coordinates) => {
		if (!map) {
			return;
		}
		if (newLocation) roundware.updateLocation(newLocation);
		else {
			const center = map.getCenter();
			roundware.updateLocation({ latitude: center.lat(), longitude: center.lng() });
		}
		console.log('updated location on framework');
	};

	const onLoad = (map: google.maps.Map<Element>) => {
		const {
			southwest: { latitude: swLat, longitude: swLng },
			northeast: { latitude: neLat, longitude: neLng },
		} = roundware.getMapBounds();

		const bounds = new google.maps.LatLngBounds({ lat: swLat!, lng: swLng! }, { lat: neLat!, lng: neLng! });

		const styledMapType = new google.maps.StyledMapType(RoundwareMapStyle, { name: 'Street Map' });
		map.mapTypes.set('styled_map', styledMapType);

		map.setOptions({
			center: { lat: roundware?.project?.location?.latitude!, lng: roundware?.project?.location?.longitude! },
			zoom: 5,
			zoomControl: true,
			draggable: true,
			mapTypeControl: false,
			streetViewControl: false,
			draggableCursor: 'cursor',
			fullscreenControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.TOP_RIGHT,
			},
			rotateControl: false,
			mapTypeId: 'styled_map',
			mapTypeControlOptions: {
				mapTypeIds: [google.maps.MapTypeId.SATELLITE, 'styled_map'],
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position: google.maps.ControlPosition.BOTTOM_LEFT,
			},
			restriction: {
				latLngBounds: bounds,
				strictBounds: true,
			},
		});

		setMap(map);
	};

	return (
		<>
			{roundware.project ? (
				<LoadScript id='script-loader' googleMapsApiKey={props.googleMapsApiKey}>
					<AssetLoadingOverlay />
					<GoogleMap mapContainerClassName={classes.roundwareMap + ' ' + props.className} onZoomChanged={updateListenerLocation} onDragEnd={updateListenerLocation} onLoad={onLoad}>
						<AssetLayer updateLocation={updateListenerLocation} />
						<RangeCircleOverlay updateLocation={updateListenerLocation} />
						<WalkingModeButton />
					</GoogleMap>
				</LoadScript>
			) : null}
		</>
	);
};

export default RoundwareMap;
