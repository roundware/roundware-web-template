import finalConfig from 'config';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { UiConfigContext } from '../context/UIContext';

const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpen] = useState(false);
	// const history = useHistory();

	const updateDrawerState = () => {
		console.log('updateDrawerState', window.location.pathname);
		if (window.location.pathname.includes(`/listen`)) setDrawerOpen(finalConfig.ui.listenSidebar.active && finalConfig.ui.listenSidebar.defaultOpen);
		else setDrawerOpen(false);
	};

	useEffect(() => {
		updateDrawerState();
		window.addEventListener('popstate', updateDrawerState);
		window.addEventListener('click', updateDrawerState);
		return () => {
			window.removeEventListener('popstate', updateDrawerState);
			window.removeEventListener('click', updateDrawerState);
		};
	}, []);

	return <UiConfigContext.Provider value={{ showShare, handleCloseShare, handleShare, drawerOpen, setDrawerOpen }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
