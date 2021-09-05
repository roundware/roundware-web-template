import { makeStyles } from '@material-ui/core/styles';
import { GoogleMap, LoadScript } from '@react-google-maps/api';
import React, { useState, useEffect } from 'react';
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

	const updateListenerLocation = () => {
		if (!map) {
			return;
		}
		const center = map.getCenter();
		roundware.updateLocation({ latitude: center.lat(), longitude: center.lng() });
		console.log('updated location on framework');
	};

	// when the listenerLocation is updated, center the map
	useEffect(() => {
		const loc = roundware.listenerLocation;
		const lat = loc && loc.latitude;
		const lng = loc && loc.longitude;
		const center = { lat: lat!, lng: lng! };
		const ready = typeof lat === 'number' && typeof lng === 'number' && map;
		if (ready) {
			const c = map.getCenter();
			if (center.lat !== c.lat() || center.lng !== c.lng()) {
				console.log('new location provided by framework');
				if (typeof center.lat == 'number' && typeof center.lng == 'number') map.panTo(center);
			}
		}
	}, [roundware.listenerLocation]);

	const onLoad = (map: google.maps.Map<Element>) => {
		setMap(map);
		const styledMapType = new google.maps.StyledMapType(RoundwareMapStyle, { name: 'Street Map' });
		map.mapTypes.set('styled_map', styledMapType);
		map.setOptions({
			center: { lat: roundware.project.location.latitude || 0, lng: roundware.project.location.longitude || 0 },
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
		setMapLoaded(true);
	};

	const [clusturerLoaded, setClusturerLoaded] = useState(false);
	const [mapLoaded, setMapLoaded] = useState(false);
	const onClustererLoad = () => setClusturerLoaded(true);

	if (!roundware.project) {
		return null;
	}
	return (
		<>
			<AssetLoadingOverlay show={clusturerLoaded && mapLoaded} />
			<LoadScript id='script-loader' googleMapsApiKey={props.googleMapsApiKey}>
				<GoogleMap mapContainerClassName={classes.roundwareMap + ' ' + props.className} onZoomChanged={updateListenerLocation} onDragEnd={updateListenerLocation} onLoad={onLoad} onProjectionChanged={updateListenerLocation}>
					<AssetLayer onClustererLoad={onClustererLoad} />
					<RangeCircleOverlay />
					<WalkingModeButton />
				</GoogleMap>
			</LoadScript>
		</>
	);
};

export default RoundwareMap;
