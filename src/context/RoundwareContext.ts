import * as React from 'react';
import { Roundware } from 'roundware-web-framework';
import { GeoListenModeType, IAssetData, ITagGroup } from 'roundware-web-framework/dist/types';
import { ISelectedTags, ITagLookup } from '../types';

// this is the equivalent to the createStore method of Redux
// https://redux.js.org/api/createstore
export interface IRoundwareContext {
	roundware: Roundware;
	tagLookup: ITagLookup;
	sortField: {
		name: string;
		asc: boolean;
	};
	selectedTags: ISelectedTags | null;
	selectedAsset: IAssetData | null;
	beforeDateFilter: string;
	afterDateFilter: string | undefined;
	assetPageIndex: number;
	assetsPerPage: number;
	geoListenMode: GeoListenModeType;
	userFilter: string;
	// state modification functions
	selectAsset: React.Dispatch<React.SetStateAction<IAssetData | null>>;
	selectTags: (tags: number[] | null, group: ITagGroup) => void;
	setUserFilter: React.Dispatch<React.SetStateAction<string>>;
	setBeforeDateFilter: React.Dispatch<React.SetStateAction<string>>;
	setAfterDateFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
	setAssetPageIndex: React.Dispatch<React.SetStateAction<number>>;
	setAssetsPerPage: React.Dispatch<React.SetStateAction<number>>;
	setSortField: React.Dispatch<
		React.SetStateAction<{
			name: string;
			asc: boolean;
		}>
	>;
	forceUpdate: React.DispatchWithoutAction;
	setGeoListenMode: (modeName: GeoListenModeType) => void;
	updateAssets: (assetData?: IAssetData[]) => void;
	// computed properties
	assetPage: IAssetData[];
	assetsReady: boolean;
}

const RoundwareContext = React.createContext<IRoundwareContext>(undefined!);

export default RoundwareContext;
