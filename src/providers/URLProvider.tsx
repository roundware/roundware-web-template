import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { IRoundwareContext } from '../context/RoundwareContext';

import { IURLContext, URLContext } from '../context/URLContext';
import { useRoundware } from '../hooks';

// this syncs filters and selected asset with URL get params
export const URLSyncProvider = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();
	const history = useHistory();
	const { roundware, selectAsset, assetPage, selectedAsset, selectedTags, selectTags } = useRoundware();

	// envelope id passed in GET
	const [eid_get, setEid_get] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);
	// when it's first time
	useEffect(() => {
		if (!Array.isArray(roundware?.uiConfig?.listen)) return;
		// when listen tag_ids are loaded
		// select the tag_ids which are passed in URL
		const params = new URLSearchParams(location.search);
		const tids = params.get('tag_ids');
		if (tids) {
			const get_tagIds = tagStringToArray(tids);
			setTag_ids_get(get_tagIds);
			if (Array.isArray(get_tagIds)) {
				roundware.uiConfig.listen.forEach((tg) => {
					// look if the tag_ids are relevant and belong to which group
					if (Array.isArray(tg.display_items)) {
						let tag_ids_group: number[] = [];
						tg.display_items.forEach((item) => {
							if (get_tagIds.includes(item.tag_id)) tag_ids_group.push(item.tag_id);
						});
						if (tag_ids_group.length > 0) {
							selectTags(tag_ids_group, tg);
						}
					}
				});
			}
		} else setTag_ids_get(null);
		setLoading(false);
	}, [roundware?.uiConfig?.listen]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		setEid_get(parseInt(params.get('eid') || '') || null);
	}, [location.search]);

	useEffect(() => {
		if (eid_get) {
			const asset = assetPage.find((a) => a?.envelope_ids?.indexOf(eid_get) !== -1);
			asset ? selectAsset(asset) : selectAsset(null);
		} else selectAsset(null);
	}, [eid_get, assetPage]);

	useEffect(() => {
		if (eid_get !== null && selectedAsset == null) deleteFromURL('eid');
		if (selectedAsset && Array.isArray(selectedAsset.envelope_ids) && selectedAsset.envelope_ids.length > 0 && selectedAsset.envelope_ids[0] !== eid_get) {
			addToURL('eid', selectedAsset.envelope_ids[0].toString());
		}
	}, [selectedAsset]);

	// add and remove tag_ids
	const [tag_ids_get, setTag_ids_get] = useState<number[] | null>();

	useEffect(() => {
		if (loading) return; // let the updating of tag_ids finish
		const params = new URLSearchParams(location.search);
		// check if URL is already synced with selectedTags
		if (JSON.stringify(tagStringToArray(params.get('tag_ids'))) == JSON.stringify(tagStringToArray(selectedTagsToURLString(selectedTags)))) {
			// no need to update the URL
			return;
		}
		if (selectedTags !== null) {
			addToURL('tag_ids', selectedTagsToURLString(selectedTags)!);
		} else deleteFromURL('tag_ids');
	}, [selectedTags]);

	const addToURL = (name: string, value: string) => {
		const newParams = new URLSearchParams(location.search);
		// remove previous value
		if (newParams.get(name)) newParams.delete(name);
		value !== null && newParams.append(name, value);
		history.push({
			pathname: window.location.pathname,
			search: decodeURIComponent(newParams.toString()),
		});
	};
	const deleteFromURL = (name: string) => {
		const newParams = new URLSearchParams(location.search);
		newParams.delete(name);
		history.push({
			pathname: window.location.pathname,
			search: decodeURIComponent(newParams.toString()),
		});
	};

	return <URLContext.Provider value={{ params: new URLSearchParams(location.search), addToURL, deleteFromURL }}>{children}</URLContext.Provider>;
};

const selectedTagsToURLString = (selectedTags: IRoundwareContext[`selectedTags`]): string | null => {
	if (selectedTags == null) return null;
	let tagString = '';
	let tags: number[] = [];
	Object.values(selectedTags).forEach((tag_group) => tag_group.forEach((tag) => tags.push(tag)));
	tags.sort((a, b) => a - b);
	tags.forEach((t) => (tagString = tagString + t + ','));
	if (tagString.length < 1) return null;
	return tagString.slice(0, -1);
};

const tagStringToArray = (tagString: null | string): number[] | null => {
	if (tagString == null || tagString.toString().length == 0) return null;
	const tagArray = tagString
		.toString()
		.split(',')
		.map((id) => parseInt(id));
	return tagArray.sort((a, b) => a - b);
};
