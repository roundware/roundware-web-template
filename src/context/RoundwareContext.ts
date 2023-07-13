import * as React from 'react';
import { Roundware } from 'roundware-web-framework';
import { GeoListenModeType, ITagGroup } from 'roundware-web-framework/dist/types';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { ISelectedTags, ITagLookup } from '../types';

// this is the equivalent to the createStore method of Redux
// https://redux.js.org/api/createstore
export interface IRoundwareContext {
	roundware: Roundware;
	tagLookup: ITagLookup;
	sortField: {
		name: keyof IAssetData;
		asc: boolean;
	};
	selectedTags: ISelectedTags | null;
	selectedAsset: IAssetData | null;
	beforeDateFilter: Date | null;
	afterDateFilter: Date | null;
	assetPageIndex: number;
	assetsPerPage: number;
	geoListenMode: GeoListenModeType;
	userFilter: string;
	playingAssets: IAssetData[];

	descriptionFilter: string | null;
	// state modification functions
	selectAsset: React.Dispatch<React.SetStateAction<IAssetData | null>>;
	selectTags: (tags: number[] | null, group: ITagGroup) => void;
	setUserFilter: React.Dispatch<React.SetStateAction<string>>;
	setBeforeDateFilter: React.Dispatch<React.SetStateAction<Date | null>>;
	setAfterDateFilter: React.Dispatch<React.SetStateAction<Date | null>>;
	setAssetPageIndex: React.Dispatch<React.SetStateAction<number>>;
	setAssetsPerPage: React.Dispatch<React.SetStateAction<number>>;
	setSortField: React.Dispatch<
		React.SetStateAction<{
			name: keyof IAssetData;
			asc: boolean;
		}>
	>;
	setDescriptionFilter: React.Dispatch<React.SetStateAction<string | null>>;
	forceUpdate: React.DispatchWithoutAction;
	setGeoListenMode: (modeName: GeoListenModeType) => void;
	updateAssets: (assetData?: IAssetData[]) => void;
	resetFilters: () => void;
	// computed properties
	assetPage: IAssetData[];
	assetsReady: boolean;
}

const RoundwareContext = React.createContext<IRoundwareContext>(undefined!);

export default RoundwareContext;
