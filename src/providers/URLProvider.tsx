import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { IRoundwareContext } from '../context/RoundwareContext';

import { IURLContext, URLContext } from '../context/URLContext';
import { useRoundware } from '../hooks';

type urlParamType = string | null;
// this syncs filters and selected asset with URL get params
export const URLSyncProvider = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();
	const history = useHistory();
	const { roundware, selectAsset, assetPage, selectedAsset, selectedTags, selectTags } = useRoundware();

	/** to wait until roundware is loaded */
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		/** wait until uiConfig loaded */
		if (!Array.isArray(roundware?.uiConfig?.listen)) return;

		/** when uiCOnfig is available */
		const params = new URLSearchParams(location.search);
		const tids = params.get('tag_ids');
		if (tids) {
			/** find the passed tag_ids and select them */
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

	const { eid, aid } = useMemo(() => {
		const params = new URLSearchParams(location.search);
		const eid = Number(params.get('eid')) || null;
		const aid = Number(params.get('aid')) || null;
		return { eid, aid };
	}, [location.search]);

	const [addedFromURL, setAddedFromURL] = useState(false);
	useEffect(() => {
		/** whenever eid or aid get param passed first time
		 *  select the relavant asset */
		if (assetPage?.length <= 0 || addedFromURL) return;

		if (eid) {
			const asset = assetPage.find((a) => a?.envelope_ids?.includes(eid));
			console.log('asset selected', asset);
			asset ? selectAsset(asset) : selectAsset(null);
		} else if (aid) {
			const asset = assetPage.find((a) => a.id == aid);
			console.log('asset selected', asset);
			asset ? selectAsset(asset) : selectAsset(null);
		}
		setAddedFromURL(true);
	}, [eid, aid, assetPage]);

	useEffect(() => {
		if (loading || !addedFromURL) return;
		if (!selectedAsset) {
			deleteFromURL(['eid', 'aid']);
			return;
		}
		let names = ['eid', 'aid'];
		let values: urlParamType[] = [null, null];
		if (selectedAsset && Array.isArray(selectedAsset.envelope_ids) && selectedAsset.envelope_ids.length > 0) {
			values[0] = selectedAsset.envelope_ids[0].toString();
		} else deleteFromURL('eid');
		if (selectedAsset && selectedAsset.id && selectedAsset.id) {
			values[1] = selectedAsset.id.toString();
		} else deleteFromURL('aid');

		/** add aid only when eid not available */
		if (values[0]) addToURL(names, [values[0], null]);
		else addToURL(names, values);
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

	const addToURL = (name: string | string[], value: string | urlParamType[]) => {
		const newParams = new URLSearchParams(location.search);
		// remove previous value
		if (Array.isArray(name) && Array.isArray(value)) {
			name.forEach((n, i) => {
				if (newParams.get(n)) newParams.delete(n);
				if (value[i]) newParams.append(n, value[i]!);
			});
		} else if (!Array.isArray(name) && !Array.isArray(value)) {
			if (newParams.get(name)) newParams.delete(name);
			if (value != null) {
				newParams.append(name, value);
			}
		}

		history.push({
			pathname: window.location.pathname,
			search: decodeURIComponent(newParams.toString()),
		});
	};
	const deleteFromURL = (name: string | string[]) => {
		const newParams = new URLSearchParams(location.search);
		if (Array.isArray(name)) name.forEach((n) => newParams.delete(n));
		else newParams.delete(name);
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
