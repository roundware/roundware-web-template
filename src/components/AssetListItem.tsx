import React from 'react';
import moment from 'moment';
import AssetPlayer from './AssetPlayer';
import { useRoundware } from '../hooks';
import { TagsDisplay } from './AssetTags';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';

interface AssetListItemProps {
	asset: IAssetData;
	player?: boolean;
}
const AssetListItem = ({ asset, player }: AssetListItemProps) => {
	const { roundware, selectedAsset, selectAsset } = useRoundware();
	if (!roundware) {
		return null;
	}
	if (player === undefined) {
		player = true;
	}
	const isSelected = selectedAsset && selectedAsset.id === asset.id;
	return (
		<div className={`asset-list--item ${isSelected ? 'asset-list--item--selected' : ''}`}>
			<div className='created'>{moment(asset.created).format('LLL')}</div>
			<a className={asset.user && asset.user.username ? '' : 'hidden'} href='#'>
				<i className='fa fa-user-circle' />
			</a>
			<TagsDisplay tagIds={asset.tag_ids!} />
			{player ? <AssetPlayer asset={asset} /> : null}
			<button
				onClick={() => {
					selectAsset(asset);
				}}
				title='show recording on map'
			>
				<i className='fa fa-map-pin' />
			</button>
		</div>
	);
};

export default AssetListItem;
