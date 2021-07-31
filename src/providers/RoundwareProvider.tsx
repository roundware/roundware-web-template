import * as React from 'react';
import RoundwareContext, { IRoundwareContext } from '../context/RoundwareContext';
import { useDeviceID } from '../hooks/useDeviceID';
import moment from 'moment';
import { useEffect, useReducer, useState } from 'react';
import { GeoListenMode, Roundware } from 'roundware-web-framework';

interface PropTypes {}
const RoundwareProvider = (props: PropTypes) => {
	const [roundware, setRoundware] = useState<IRoundwareContext[`roundware`]>({
		uiConfig: {
			speak: [],
		},
	});
	const [assetsReady, setAssetsReady] = useState(false);
	const [beforeDateFilter, setBeforeDateFilter] = useState(moment().format());
	const [afterDateFilter, setAfterDateFilter] = useState(null);
	const [userFilter, setUserFilter] = useState('');
	const [selectedAsset, selectAsset] = useState(null);
	const [selectedTags, setSelectedTags] = useState({});
	const [sortField, setSortField] = useState({ name: 'created', asc: false });
	const [assetPageIndex, setAssetPageIndex] = useState(0);
	const [assetsPerPage, setAssetsPerPage] = useState(10000);
	const [tagLookup, setTagLookup] = useState({});
	const [filteredAssets, setFilteredAssets] = useState([]);
	const deviceId = useDeviceID();
	const [assetPage, setAssetPage] = useState<any[]>([]);
	const [, forceUpdate] = useReducer((x) => !x, false);

	const sortAssets = (assets: any[]) => {
		const sort_value = sortField.asc ? 1 : -1;

		const sortEntries = (a: any, b: any) => {
			if (a[sortField.name] > b[sortField.name]) {
				return sort_value;
			}
			if (a[sortField.name] < b[sortField.name]) {
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
		const page: any[] = sortedAssets.slice(assetPageIndex * assetsPerPage, assetPageIndex * assetsPerPage + assetsPerPage);
		setAssetPage(page);
		if (roundware._assetData) {
			setAssetsReady(true);
		}
	}, [filteredAssets, assetPageIndex, assetsPerPage, sortField.name, sortField.asc]);

	useEffect(() => {
		if (!roundware.uiConfig.speak) {
			return;
		}
		const tag_lookup = {};
		roundware.uiConfig.speak.forEach((group) =>
			group.display_items.forEach((tag) => {
				tag_lookup[tag.id] = tag;
			})
		);
		setTagLookup(tag_lookup);
	}, [roundware.uiConfig && roundware.uiConfig.speak]);

	const filterAssets = (asset_data) => {
		return asset_data.filter((asset) => {
			// show the asset, unless a filter returns 'false'
			// filter by tags first
			let filteredByTag = false;
			const tag_filter_groups = Object.entries(selectedTags || {});
			tag_filter_groups.forEach(([_filter_group, tags]: [_filter_group: any, tags: any[]]) => {
				if (filteredByTag) {
					// if we've already filtered out this asset based on another tag group, stop thinking about it
					return;
				}
				if (tags.length) {
					const hasMatch = tags.some((tag_id) => asset.tag_ids.indexOf(tag_id) !== -1);
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
				const dateMatch = asset.created <= beforeDateFilter && asset.created >= afterDateFilter ? true : false;
				if (!dateMatch) {
					return false;
				}
			}
			return true;
		});
	};
	// tells the provider to update assetData dependencies with the roundware _assetData source
	const updateAssets = (assetData) => {
		const filteredAssets = filterAssets(assetData || roundware._assetData || []);
		setFilteredAssets(filteredAssets);
	};

	useEffect(() => {
		if (roundware._assetData) {
			const filteredAssets = filterAssets(roundware._assetData);
			setFilteredAssets(filteredAssets);
		}
	}, [roundware._assetData, selectedTags, userFilter, afterDateFilter, beforeDateFilter]);

	const selectTags = (tags, group) => {
		const group_key = group.group_short_name;
		const newFilters = { ...selectedTags };
		let listenTagIds = [];
		if (tags === null && newFilters[group_key]) {
			delete newFilters[group_key];
		} else {
			newFilters[group_key] = tags;
		}
		setSelectedTags(newFilters);
		Object.keys(newFilters).map(function (key) {
			listenTagIds.push(...newFilters[key]);
		});
		roundware._mixer.updateParams({ listenTagIds: listenTagIds });
	};

	// when this provider is loaded, initialize roundware via api
	useEffect(() => {
		const project_id = process.env.ROUNDWARE_DEFAULT_PROJECT_ID;
		const server_url = process.env.ROUNDWARE_SERVER_URL;
		// maybe we build the site with a default listener location,
		// otherwise we go to null island
		const initial_loc = {
			latitude: process.env.INITIAL_LATITUDE || 0,
			longitude: process.env.INITIAL_LONGITUDE || 0,
		};

		const roundware = new Roundware(window, {
			deviceId: deviceId,
			serverUrl: server_url,
			projectId: project_id,
			geoListenEnabled: false,
			speakerFilters: { activeyn: true },
			assetFilters: { submitted: true, media_type: 'audio' },
			listenerLocation: initial_loc,
			assetUpdateInterval: 30 * 1000,
		});

		roundware.connect().then(() => {
			// set the initial listener location to the project default
			roundware.updateLocation(roundware._project.location);
			roundware.onUpdateLocation = forceUpdate;
			roundware.onUpdateAssets = updateAssets;
			setRoundware(roundware);
		});
	}, []);

	useEffect(() => {
		if (roundware._project && typeof roundware.loadAssetPool == 'function') {
			roundware?.loadAssetPool().then(() => {
				setAssetsReady(true);
			});
		}
	}, [roundware._project]);

	const geoListenMode = (roundware._mixer && roundware._mixer?.mixParams?.geoListenMode) || GeoListenMode?.DISABLED;
	const setGeoListenMode = (modeName) => {
		roundware.enableGeolocation(modeName);
		let prom;
		// console.log(`roundware._mixer.mixParams.geoListenMode: ${roundware._mixer.mixParams.geoListenMode}`);
		if (modeName === GeoListenMode.AUTOMATIC) {
			prom = roundware._geoPosition.waitForInitialGeolocation();
			if (roundware._mixer) {
				roundware._mixer.updateParams({
					maxDist: roundware._project.recordingRadius,
					recordingRadius: roundware._project.recordingRadius,
				});
			}
		} else if (modeName === GeoListenMode.MANUAL) {
			// set maxDist to value calculated from range circle overlay
			prom = new Promise<void>((resolve, reject) => {
				resolve();
			});
		}
		prom.then(forceUpdate);
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
