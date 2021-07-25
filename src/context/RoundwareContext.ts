import React from 'react';

// this is the equivalent to the createStore method of Redux
// https://redux.js.org/api/createstore
interface IRoundware {
	options: {
		serverUrl: string;
		projectId: number;
		getListenMode: boolean;
	};
	uiConfig: {
		speak: { display_items: { id: any }[] }[];
	};
	windowScope: any;
	_serverUrl: any;
	_projectId: any;
	_speakerFilters: any;
	_assetFilters: any;
	_assetData: any;
	_listenerLocation: any;
	_initialOptions: any;
	_assetUpdateInterval: unknown | 300000;
	_apiClient: unknown;
	_user: unknown;
	_geoPosition: {
		waitForInitialGeolocation();
	};
	_session: unknown;
	_mixer:
		| {
				updateParams({ listenTagIds, maxDist, recordingRadius }: { listenTagIds?: any[]; maxDist?: unknown; recordingRadius?: unknown }): void;
				mixParams;
		  }
		| undefined;
	_project: {
		recordingRadius;
	};
	_triggerOnPlayAssets(): void;
	updateLocation: (listenerLocation: any) => void;
	enableGeolocation(modeName: string): void;
	disableGeolocation(): void;
	connect(): Promise<{ uiConfig: unknown }>;
	getAssets(): Promise<unknown>;
	getAssetsFromPool(): Promise<unknown[]>;
	updateAssetPool(): Promise<unknown>;
	loadAssetPool(): Promise<unknown>;
	activateMixer(params: object): Promise<unknown>;
	play(firstPlayCallback: Function): void;
	pause(): void;
	kill(): void;
	replay(): void;
	skip(): void;
	tags(): void;
}

export interface IRoundwareContext {
	roundware: Partial<IRoundware> | any;
	tagLookup: any;
	sortField: any;
	selectedTags: any;
	selectedAsset: any;
	beforeDateFilter: any;
	afterDateFilter: any;
	assetPageIndex: any;
	assetsPerPage: any;
	geoListenMode: any;
	// state modification functions
	selectAsset: any;
	selectTags: any;
	setUserFilter: any;
	setBeforeDateFilter: any;
	setAfterDateFilter: any;
	setAssetPageIndex: any;
	setAssetsPerPage: any;
	setSortField: any;
	forceUpdate: any;
	setGeoListenMode: any;
	updateAssets: any;
	// computed properties
	assetPage: any;
	assetsReady: any;
}

const RoundwareContext: React.Context<Partial<IRoundwareContext>> = React.createContext({ roundware: undefined });

export default RoundwareContext;
