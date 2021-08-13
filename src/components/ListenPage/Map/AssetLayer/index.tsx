import { MarkerClusterer, useGoogleMap } from '@react-google-maps/api';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import React, { Fragment, useEffect, useState } from 'react';
import { IAssetData } from 'roundware-web-framework/dist/types';
import { OverlappingMarkerSpiderfier } from 'ts-overlapping-marker-spiderfier';
import { useQuery, useRoundware } from '../../../../hooks';
import AssetMarker from './AssetMarker';

const OverlappingMarkerSpiderfierComponent = (props: { children: (props: OverlappingMarkerSpiderfier | null) => React.ReactNode }) => {
	const map = useGoogleMap();
	const [spiderfier, set_spiderfier] = useState<OverlappingMarkerSpiderfier | null>(null);
	if (!map) {
		return null;
	}
	if (!spiderfier) {
		const oms_obj = new OverlappingMarkerSpiderfier(map, {
			markersWontMove: true,
			markersWontHide: true,
			basicFormatEvents: true,
		});
		set_spiderfier(oms_obj);
	}

	return <Fragment>{props.children(spiderfier)}</Fragment>;
};

const AssetLayer = () => {
	const { roundware, assetPage, selectedAsset, selectAsset, assetsReady, playingAssets } = useRoundware();
	const map = useGoogleMap();
	const query = useQuery();
	const assets = assetPage;
	const eid = parseInt(query.get('eid') || '');
	const [lastSelected, setLastSelected] = useState<number | undefined>();
	const [markerClusterer, setMarkerClusterer] = useState<Clusterer | null>(null);

	useEffect(() => {
		if (!eid || lastSelected === eid) {
			return;
		}
		const asset = assets.find((a) => a?.envelope_ids?.indexOf(eid) !== -1);
		if (!asset) {
			// todo  present an error and clear bad query params when we can't find the asset we're looking for
			return;
		}
		selectAsset(asset);
		// On further asset pool updates, prevent the map from panning unprompted to
		// the selected asset.
		setLastSelected(eid);
	}, [assetPage, eid]);

	// when the selected asset changes, pan to it
	useEffect(() => {
		if (!selectedAsset || !map || typeof selectedAsset.latitude !== 'number' || typeof selectedAsset.longitude !== 'number') {
			return;
		}
		const center = {
			lat: selectedAsset.latitude,
			lng: selectedAsset.longitude,
		};

		map.panTo(center);
		roundware.updateLocation({ latitude: selectedAsset.latitude, longitude: selectedAsset.longitude });
	}, [selectedAsset]);
	if (!map) {
		return null;
	}
	const markers = (clusterer: Clusterer) => {
		return <OverlappingMarkerSpiderfierComponent children={(oms) => assets.map((asset: IAssetData) => <AssetMarker key={asset.id} asset={asset} clusterer={clusterer} oms={oms!} />)} />;
	};

	// When a new asset starts playing, update the map markers and clusters.
	useEffect(() => {
		if (markerClusterer) {
			markerClusterer.repaint();
		}
	}, [playingAssets]);

	const recluster = () => {
		if (markerClusterer) {
			const markerObjs = markerClusterer.markers.slice();
			markerClusterer.clearMarkers();
			markerClusterer.repaint();
			markerClusterer.addMarkers(markerObjs, false);
		}
	};
	const wait_for_full_page = async () => {
		return new Promise<void>((resolve, reject) => {
			const checkStart = Date.now();
			const checkLength = () => {
				if (markerClusterer && assetPage.length >= markerClusterer.markers.length) {
					resolve();
				} else if (Date.now() > checkStart + 3000) {
					reject('asset page contains a different number of entries than the marker clusterer');
				} else {
					setTimeout(checkLength, 100);
				}
			};
			checkLength();
		});
	};
	useEffect(() => {
		if (!(markerClusterer && markerClusterer.ready)) return;
		wait_for_full_page().then(recluster);
	}, [markerClusterer && markerClusterer.ready, assetPage]);
	return (
		<MarkerClusterer
			maxZoom={12}
			minimumClusterSize={3}
			onLoad={setMarkerClusterer}
			calculator={(markers, numStyles) => {
				// Most of this implementation is copied from the default calculator for
				// React google maps. Change the `styles` property to configure how
				// clusters look.
				let index = 0;
				const title = '';
				const count = markers.length.toString();
				let dv = parseInt(count);
				while (dv !== 0) {
					dv = parseInt(dv.toString(), 10) / 10;
					index++;
				}

				index = Math.min(index + 1, numStyles);

				// Change style if any contained markers are being played.
				for (const m of markers) {
					for (const a of playingAssets) {
						// @ts-ignore
						if (a && a.id == m.asset.id) {
							// TODO Change this number to match whatever index in the
							// `styles` list is your "currently playing" style.
							index = 0;
							break;
						}
					}
				}

				return {
					text: count,
					index: index,
					title: title,
				};
			}}
			options={{
				imagePath: 'https://github.com/googlemaps/v3-utility-library/raw/master/packages/markerclustererplus/images/m',
			}}
			children={markers}
		/>
	);
};

export default AssetLayer;
