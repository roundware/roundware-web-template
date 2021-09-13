import { Marker, useGoogleMap } from '@react-google-maps/api';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import React, { useEffect, useState } from 'react';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { OverlappingMarkerSpiderfier } from 'ts-overlapping-marker-spiderfier';
import { useRoundware } from '../../../../hooks';
import { AssetInfoWindowInner } from './AssetInfoWindow';
import marker from 'url:../../../../assets/marker.svg';
import marker2 from 'url:../../../../assets/marker-secondary.svg';
const AssetInfoWindow = ({ asset }: { asset: IAssetData }) => {
	const { selectedAsset, selectAsset, roundware } = useRoundware();

	if (!selectedAsset) return null;
	if (selectedAsset.id !== asset.id) {
		return null;
	}
	return <AssetInfoWindowInner asset={selectedAsset} selectAsset={selectAsset} roundware={roundware} />;
};

interface AssetMarkerProps {
	asset: IAssetData;
	clusterer: Clusterer;
	oms: OverlappingMarkerSpiderfier;
}
const AssetMarker = ({ asset, clusterer, oms }: AssetMarkerProps) => {
	const { roundware, selectAsset } = useRoundware();
	const iconPin = {
		scaledSize: new google.maps.Size(20, 20),
		fillOpacity: 1,
	};

	const map = useGoogleMap();
	// let url = 'https://fonts.gstatic.com/s/i/materialicons/place/v15/24px.svg';

	const isPlaying = roundware?.mixer?.playlist && roundware.mixer.playlist.playing && Array.isArray(roundware.currentlyPlayingAssets) && roundware.currentlyPlayingAssets.length > 0 && roundware.currentlyPlayingAssets[0].id === asset.id;
	return (
		<Marker
			position={{ lat: asset.latitude!, lng: asset.longitude! }}
			icon={{
				url: isPlaying ? marker2 : marker,
				scaledSize: new google.maps.Size(isPlaying ? 23 : 20, isPlaying ? 23 : 20),
				fillOpacity: 1,
			}}
			zIndex={isPlaying ? 101 : 100}
			clusterer={clusterer}
			onLoad={(m) => {
				//@ts-ignore
				m.asset = asset;
				oms.addMarker(m, () => selectAsset(asset));
			}}
			noClustererRedraw={true}
		>
			<AssetInfoWindow asset={asset} />
		</Marker>
	);
};

export default React.memo(AssetMarker);
