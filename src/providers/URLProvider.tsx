import React, { useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router';
import { IAssetData } from 'roundware-web-framework/dist/types';

import { IURLContext, URLContext } from '../context/URLContext';
import { useRoundware } from '../hooks';

// this custom hook syncs filters and selected asset with URL get params
export const URLSyncProvider = ({ children }: { children: React.ReactNode }) => {
	const location = useLocation();
	const history = useHistory();
	const { selectAsset, assetPage, selectedAsset } = useRoundware();

	// all the params for query
	const [params, setParams] = useState<IURLContext[`params`]>(new URLSearchParams());
	useEffect(() => {
		setParams(new URLSearchParams(location.search));
	}, [location]);

	// when params change get the individual params
	useEffect(() => {
		setEid(parseInt(params.get('eid') || '') || null);
	}, [params]);

	// envelope id passed in GET
	const [eid, setEid] = useState<number | null>(null);
	useEffect(() => {
		if (eid) {
			const asset = assetPage.find((a) => a?.envelope_ids?.indexOf(eid) !== -1);
			asset ? selectAsset(asset) : selectAsset(null);
		} else {
			selectAsset(null);
		}
	}, [eid, assetPage]);

	useEffect(() => {
		if (eid !== null && selectedAsset == null) deleteFromURL('eid');
		if (eid == null && selectedAsset && Array.isArray(selectedAsset.envelope_ids)) addToURL('eid', selectedAsset.envelope_ids[0].toString());
	}, [selectedAsset]);

	const addToURL = (name: string, value: string) => {
		const newParams = params;
		newParams.append(name, value);
		history.push({
			pathname: window.location.pathname,
			search: newParams.toString(),
		});
	};
	const deleteFromURL = (name: string) => {
		const newParams = params;
		newParams.delete(name);
		history.push({
			pathname: window.location.pathname,
			search: newParams.toString(),
		});
	};

	return <URLContext.Provider value={{ params, addToURL, deleteFromURL }}>{children}</URLContext.Provider>;
};
