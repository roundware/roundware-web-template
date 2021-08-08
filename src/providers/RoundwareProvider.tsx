import * as React from 'react';
import RoundwareContext, { IRoundwareContext } from '../context/RoundwareContext';
import { useDeviceID } from '../hooks/useDeviceID';
import moment from 'moment';
import { useEffect, useReducer, useState } from 'react';
import { GeoListenMode, Roundware } from 'roundware-web-framework';
import { Coordinates, IAssetData, ITag, ITagGroup, IUiConfig } from 'roundware-web-framework/dist/types';
import { IRoundwareConstructorOptions } from 'roundware-web-framework/dist/types/roundware';
import { ISelectedTags, ITagLookup } from '../types';
interface PropTypes {
	children: React.ReactNode;
}

const RoundwareProvider = (props: PropTypes) => {
	const [roundware, setRoundware] = useState<Roundware>({
		uiConfig: {
			speak: [],
		},
	} as unknown as Roundware);
	const [assetsReady, setAssetsReady] = useState(false);
	const [beforeDateFilter, setBeforeDateFilter] = useState<string>(moment().format());
	const [afterDateFilter, setAfterDateFilter] = useState<string | undefined>(undefined);
	const [userFilter, setUserFilter] = useState<string>('');
	const [selectedAsset, selectAsset] = useState<IAssetData | undefined>(undefined);
	const [selectedTags, setSelectedTags] = useState<ISelectedTags | null>(null);
	const [sortField, setSortField] = useState({ name: 'created', asc: false });
	const [assetPageIndex, setAssetPageIndex] = useState(0);
	const [assetsPerPage, setAssetsPerPage] = useState(10000);
	const [tagLookup, setTagLookup] = useState<ITagLookup>({});
	const [filteredAssets, setFilteredAssets] = useState<IAssetData[]>([]);
	const deviceId = useDeviceID();
	const [assetPage, setAssetPage] = useState<IAssetData[]>([]);
	const [, forceUpdate] = useReducer((x) => !x, false);

	const sortAssets = (assets: IAssetData[]) => {
		const sort_value = sortField.asc ? 1 : -1;

		const sortEntries = (a: IAssetData, b: IAssetData) => {
			if (a[sortField.name]! > b[sortField.name]!) {
				return sort_value;
			}
			if (a[sortField.name]! < b[sortField.name]!) {
				return -Math.abs(sort_value);
			}
			return 0;
		};
		const sortedAssets = [...assets];
		sortedAssets.sort(sortEntries);
		return sortedAssets;
	};

	useEffect(() => {
		const sortedAssets = sortAssets(filteredAssets);
		if (sortedAssets.length < assetPageIndex * assetsPerPage) {
			setAssetPageIndex(0);
			return;
		}
		const page: IAssetData[] = sortedAssets.slice(assetPageIndex * assetsPerPage, assetPageIndex * assetsPerPage + assetsPerPage);
		setAssetPage(page);
		if (roundware.assetData) {
			setAssetsReady(true);
		}
	}, [filteredAssets, assetPageIndex, assetsPerPage, sortField.name, sortField.asc]);

	useEffect(() => {
		if (!roundware?.uiConfig?.speak) {
			return;
		}
		let tag_lookup: ITagLookup = {};
		roundware.uiConfig.speak.forEach((group) =>
			group.display_items.forEach((tag) => {
				console.log(tag);
				tag_lookup[tag.id] = tag;
			})
		);
		setTagLookup(tag_lookup);
	}, [roundware?.uiConfig && roundware?.uiConfig?.speak]);

	const filterAssets = (asset_data: IAssetData[]) => {
		return asset_data.filter((asset) => {
			// show the asset, unless a filter returns 'false'
			// filter by tags first
			let filteredByTag = false;
			const tag_filter_groups = Object.entries(selectedTags || {});
			tag_filter_groups.forEach(([_filter_group, tags]: [_filter_group: string, tags: number[]]) => {
				if (filteredByTag) {
					// if we've already filtered out this asset based on another tag group, stop thinking about it
					return;
				}
				if (tags.length) {
					const hasMatch = tags.some((tag_id: number) => asset.tag_ids!.indexOf(tag_id) !== -1);
					if (!hasMatch) {
						filteredByTag = true;
					}
				}
			});
			if (filteredByTag) {
				return false;
			}
			// then filter by user
			if (userFilter.length) {
				let user_str = 'anonymous';
				if (asset.user) {
					user_str = asset.user && `${asset.user.username} ${asset.user.email}`;
				}
				const user_match = user_str.indexOf(userFilter) !== -1;
				if (!user_match) {
					return false;
				}
			}
			// then filter by start and end dates
			if (afterDateFilter && beforeDateFilter) {
				const dateMatch = asset.created! <= beforeDateFilter && asset.created! >= afterDateFilter ? true : false;
				if (!dateMatch) {
					return false;
				}
			}
			return true;
		});
	};
	// tells the provider to update assetData dependencies with the roundware _assetData source
	const updateAssets = (assetData: IAssetData[]) => {
		const filteredAssets = filterAssets(assetData || roundware.assetData || []);
		setFilteredAssets(filteredAssets);
	};

	useEffect(() => {
		if (roundware?.assetData) {
			const filteredAssets = filterAssets(roundware.assetData);
			setFilteredAssets(filteredAssets);
		}
		console.log(selectedTags);
	}, [roundware?.assetData, selectedTags, userFilter, afterDateFilter, beforeDateFilter]);

	const selectTags = (tags: number[] | null, group: ITagGroup) => {
		const group_key = group.group_short_name!;
		const newFilters = { ...selectedTags };
		let listenTagIds: number[] = [];
		if (tags == null && newFilters[group_key]) {
			delete newFilters[group_key];
		} else {
			newFilters[group_key] = tags!;
		}
		setSelectedTags(newFilters);
		Object.keys(newFilters).map(function (key) {
			listenTagIds.push(...newFilters[key]);
		});
		roundware.mixer.updateParams({ listenTagIds: listenTagIds });
	};

	// when this provider is loaded, initialize roundware via api
	useEffect(() => {
		const project_id = Number(process.env.ROUNDWARE_DEFAULT_PROJECT_ID);
		const server_url = process.env.ROUNDWARE_SERVER_URL;
		if (typeof server_url == 'undefined') return console.error(`ROUNDWARE_SERVER_URL was missing from env variables`);
		if (typeof project_id == 'undefined') return console.error(`ROUNDWARE_DEFAULT_PROJECT_ID was missing from env variables`);
		// maybe we build the site with a default listener location,
		// otherwise we go to null island
		const initial_loc = {
			latitude: Number(process.env.INITIAL_LATITUDE) || 0,
			longitude: Number(process.env.INITIAL_LONGITUDE) || 0,
		};

		const roundwareOptions: IRoundwareConstructorOptions = {
			deviceId: deviceId,
			serverUrl: server_url,
			projectId: project_id,
			geoListenMode: true,
			speakerFilters: { activeyn: true },
			assetFilters: { submitted: true, media_type: 'audio' },
			listenerLocation: initial_loc,
			assetUpdateInterval: 30 * 1000,
			apiClient: undefined!,
		};
		const roundware = new Roundware(window, roundwareOptions);

		roundware.connect().then(() => {
			// set the initial listener location to the project default
			roundware.updateLocation(roundware.project.location);
			roundware.onUpdateLocation = forceUpdate;
			roundware.onUpdateAssets = updateAssets;

			setRoundware(roundware);
		});
	}, []);

	useEffect(() => {
		if (roundware.project && typeof roundware.loadAssetPool == 'function') {
			roundware?.loadAssetPool().then((data) => {
				setAssetsReady(true);
			});
		}
	}, [roundware?.project]);

	const geoListenMode = (roundware?.mixer && roundware?.mixer?.mixParams?.geoListenMode) || GeoListenMode?.DISABLED;
	const setGeoListenMode = (modeName: number) => {
		roundware.enableGeolocation(modeName);
		let prom: Promise<Coordinates | void>;
		// console.log(`roundware.mixer.mixParams.geoListenMode: ${roundware.mixer.mixParams.geoListenMode}`);
		if (modeName === GeoListenMode.AUTOMATIC) {
			prom = roundware.geoPosition.waitForInitialGeolocation();
			if (roundware.mixer) {
				roundware.mixer.updateParams({
					maxDist: roundware.project.recordingRadius,
					recordingRadius: roundware.project.recordingRadius,
				});
			}
			prom.then(forceUpdate);
		} else if (modeName === GeoListenMode.MANUAL) {
			// set maxDist to value calculated from range circle overlay
			prom = new Promise<void>((resolve, reject) => {
				resolve();
			});
			prom.then(forceUpdate);
		}
	};

	return (
		<RoundwareContext.Provider
			value={{
				roundware,
				// everything from the state
				tagLookup,
				sortField,
				selectedTags,
				selectedAsset,
				beforeDateFilter,
				afterDateFilter,
				assetPageIndex,
				assetsPerPage,
				geoListenMode,
				// state modification functions
				selectAsset,
				selectTags,
				setUserFilter,
				setBeforeDateFilter,
				setAfterDateFilter,
				setAssetPageIndex,
				setAssetsPerPage,
				setSortField,
				forceUpdate,
				setGeoListenMode,
				updateAssets,
				// computed properties
				assetPage,
				assetsReady,
			}}
		>
			{props.children}
		</RoundwareContext.Provider>
	);
};

export default RoundwareProvider;
