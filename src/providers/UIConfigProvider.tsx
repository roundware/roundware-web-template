import finalConfig from 'config';
import React, { MouseEvent, useEffect, useState } from 'react';
import { UiConfigContext } from '../context/UIContext';
import { Theme, useMediaQuery, useTheme } from '@mui/material';

const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpen] = useState(false);
	// const history = useHistory();

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const updateDrawerState = () => {
		console.log('updateDrawerState', window.location.pathname);
		if (window.location.pathname.includes(`/listen`)) setDrawerOpen(finalConfig.ui.listenSidebar.active && finalConfig.ui.listenSidebar.defaultOpen && !isMobile);
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
