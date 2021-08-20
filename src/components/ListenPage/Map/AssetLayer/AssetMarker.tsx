import { Marker } from '@react-google-maps/api';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import React from 'react';
import { IAssetData } from 'roundware-web-framework/dist/types';
import { OverlappingMarkerSpiderfier } from 'ts-overlapping-marker-spiderfier';
import { useRoundware } from '../../../../hooks';
import { AssetInfoWindowInner } from './AssetInfoWindow';

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
	const { selectAsset } = useRoundware();
	const iconPin = {
		url: 'https://fonts.gstatic.com/s/i/materialicons/place/v15/24px.svg',
		scaledSize: new google.maps.Size(20, 20),
	};

	return (
		<Marker
			position={{ lat: asset.latitude!, lng: asset.longitude! }}
			icon={iconPin}
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

export default AssetMarker;
