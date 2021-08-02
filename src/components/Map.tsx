import { makeStyles } from '@material-ui/core/styles';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React, { useState } from 'react';
import { useRoundware } from '../hooks';
import { RoundwareMapStyle } from '../map-style';
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

	if (!roundware._project) {
		return null;
	}

	const updateListenerLocation = () => {
		if (!map) {
			return;
		}
		const center = map.getCenter();
		roundware.updateLocation({ latitude: center.lat(), longitude: center.lng() });
	};

	// when the listener location changes, center the map
	return (
		<LoadScript id='script-loader' googleMapsApiKey={props.googleMapsApiKey}>
			<AssetLoadingOverlay />
			<GoogleMap
				mapContainerClassName={classes.roundwareMap + ' ' + props.className}
				onZoomChanged={updateListenerLocation}
				onDragEnd={updateListenerLocation}
				onLoad={(map) => {
					setMap(map);
					const styledMapType = new google.maps.StyledMapType(RoundwareMapStyle, { name: 'Street Map' });
					map.mapTypes.set('styled_map', styledMapType);
					map.setOptions({
						center: { lat: 0, lng: 0 },
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
					});
				}}
				onUnmount={(map) => {
					// do your stuff before map is unmounted
				}}
			>
				<AssetLayer />
				<RangeCircleOverlay />
				<WalkingModeButton />
			</GoogleMap>
		</LoadScript>
	);
};

export default RoundwareMap;
