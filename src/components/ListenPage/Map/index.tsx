import makeStyles from '@mui/styles/makeStyles';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import React, { useState, useCallback } from 'react';
import { Coordinates } from 'roundware-web-framework/dist/types';
import { useRoundware } from '../../../hooks';
import { RoundwareMapStyle } from '../../../styles/map-style';
import AssetLayer from './AssetLayer';
import AssetLoadingOverlay from './AssetLoadingOverlay';
import RangeCircleOverlay from './RangeCircleOverlay';
import WalkingModeButton from './WalkingModeButton';
import config from 'config';
import SpeakerPolygons from './Speakers/SpeakerPolygons';
import SpeakerReplayButton from './Speakers/SpeakerReplayButton';
import SpeakerLoadingIndicator from './Speakers/SpeakerLoadingIndicator';
import { useURLSync } from 'context/URLContext';
import ShareDialog from 'components/App/ShareDialog';
import ResetButton from './ResetButton';
import SpeakerImages from './Speakers/SpeakerImages';

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
	const [map, setMap] = useState<google.maps.Map | undefined>();

	const { deleteFromURL, params } = useURLSync();
	const updateListenerLocation = (newLocation?: Coordinates) => {
		if (!map) {
			return;
		}
		let location = newLocation;
		if (!location) {
			const center = map.getCenter();
			location = { latitude: center!.lat(), longitude: center!.lng() };
		}
		deleteFromURL([`longitude`, `latitude`]);

		roundware.updateLocation(location!);
		console.log('updated location on framework', location);
	};

	const onLoad = (map: google.maps.Map) => {
		let restriction;
		if (config.map.bounds != 'none') {
			let bounds: google.maps.LatLngBounds;

			if (config.map.bounds == 'auto') {
				const {
					southwest: { latitude: swLat, longitude: swLng },
					northeast: { latitude: neLat, longitude: neLng },
				} = roundware.getMapBounds();

				bounds = new google.maps.LatLngBounds({ lat: swLat!, lng: swLng! }, { lat: neLat!, lng: neLng! });
			} else {
				const { swLat, swLng, neLat, neLng } = config.map.boundsPoints;
				bounds = new google.maps.LatLngBounds({ lat: swLat!, lng: swLng! }, { lat: neLat!, lng: neLng! });
			}
			restriction = {
				latLngBounds: bounds,
				strictBounds: false,
			};
		}

		const styledMapType = new google.maps.StyledMapType(RoundwareMapStyle, { name: 'Street Map' });
		map.mapTypes.set('styled_map', styledMapType);
		const searchParams = new URLSearchParams(window.location.search);
		const urlLatitude = searchParams.get('latitude');
		const urlLongitude = searchParams.get('longitude');
		const urlZoom = searchParams.get('zoom');
		map.setOptions({
			center: {
				lat: parseFloat(typeof urlLatitude == 'string' ? urlLatitude : roundware?.project?.location?.latitude!?.toString()),
				lng: parseFloat(typeof urlLongitude == 'string' ? urlLongitude : roundware?.project?.location?.longitude!?.toString()),
			},
			zoom: parseInt(typeof urlZoom == 'string' ? urlZoom : '5'),
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
			restriction,
		});
		map.addListener('zoom_changed', () => {
			const currentZoom = map.getZoom();
			const paramZoom = new URLSearchParams(window.location.search).get('zoom');
			if (paramZoom) {
				if (Number(currentZoom) != Number(paramZoom)) {
					map.setZoom(Number(paramZoom));
				}
			}
			deleteFromURL('zoom');
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
						{map && roundware.mixer?.playlist && <WalkingModeButton />}
						{config.map.speakerDisplay == 'polygons' && <SpeakerPolygons />}
						{config.map.speakerDisplay == 'images' && <SpeakerImages />}
						<SpeakerLoadingIndicator />
						{!config.listen.speaker.loop && <SpeakerReplayButton />}
						<ShareDialog />
						<ResetButton updateLocation={updateListenerLocation} />

						{config.map.showBoundsMarkers && roundware && (
							<Marker
								position={{
									lat: roundware.getMapBounds().northeast.latitude!,
									lng: roundware.getMapBounds().northeast.longitude!,
								}}
							/>
						)}

						{config.map.showBoundsMarkers && roundware && (
							<Marker
								position={{
									lat: roundware.getMapBounds().southwest.latitude!,
									lng: roundware.getMapBounds().southwest.longitude!,
								}}
							/>
						)}
					</GoogleMap>
				</LoadScript>
			) : null}
		</>
	);
};

export default RoundwareMap;
