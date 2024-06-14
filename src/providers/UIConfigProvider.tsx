import { useMediaQuery, useTheme } from '@mui/material';
import finalConfig from 'config';
import React, { useEffect, useState } from 'react';
import { UiConfigContext } from '../context/UIContext';

const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpenState] = useState(false);

	const [manuallyClosed, setManuallyClosed] = useState(false);

	const setDrawerOpen = (open: boolean) => {
		if (open === false) {
			setManuallyClosed(true);
		}
		setDrawerOpenState(open);
	};
	// const history = useHistory();

	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	const updateDrawerState = () => {
		if (manuallyClosed) return;
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
	}, [manuallyClosed]);

	return <UiConfigContext.Provider value={{ showShare, handleCloseShare, handleShare, drawerOpen, setDrawerOpen }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
