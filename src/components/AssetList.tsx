import React, { useState } from 'react';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { useRoundware } from '../hooks';
import AssetFilterPanel from './AssetFilterPanel';
import AssetListItem from './AssetListItem';

interface AssetListProps {
	assets: IAssetData[];
}
const AssetList = (props: AssetListProps) => {
	const { roundware, selectAsset, selectedAsset } = useRoundware();

	const [minimized, set_minimized] = useState(false);
	const [showing_filters, show_filters] = useState(false);

	let assets;
	if (!roundware) {
		assets = props.assets || [];
	} else {
		assets = props.assets || [];
	}
	// sortEntries is not implemented
	const entries = assets.sort().map((asset: IAssetData) => {
		return <AssetListItem key={asset.id} asset={asset} player={false} />;
	});
	return (
		<div className='asset-list'>
			<div className='asset-list--header'>
				<div className='header-controls'>
					<button className={`minimizeButton fa fa-${minimized ? 'expand-alt' : 'compress-alt'}`} onClick={() => set_minimized(!minimized)} />
					<button className='showFiltersButton fa fa-filter' onClick={() => show_filters(!showing_filters)} />
				</div>
				<AssetFilterPanel hidden={!showing_filters} />
			</div>
			<div className={`asset-list--assets ${minimized ? 'hidden' : ''}`}>{entries}</div>
		</div>
	);
};

export default AssetList;
