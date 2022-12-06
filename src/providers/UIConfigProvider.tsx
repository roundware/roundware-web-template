import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { UiConfigContext } from '../context/UIContext';
import config from 'config.json';
const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [infoWindowOrder, setInfoWindowOrder] = useState<string[]>(['date', 'tags', 'description', 'text', 'audio', 'actions']);

	useEffect(() => {
		// pass INFOWINDOW_DISPLAY_ITEMS var in env to set the order
		// example: INFOWINDOW_DISPLAY_ITEMS=date,tags,description,text,audio,actions

		if (config.INFOWINDOW_DISPLAY_ITEMS) {
			setInfoWindowOrder(config.INFOWINDOW_DISPLAY_ITEMS);
		}
	}, []);

	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpen] = useState(false);

	return <UiConfigContext.Provider value={{ infoWindowOrder, showShare, handleCloseShare, handleShare, drawerOpen, setDrawerOpen }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
