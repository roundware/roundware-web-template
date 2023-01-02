import finalConfig from 'config';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { UiConfigContext } from '../context/UIContext';

const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpen] = useState(false);
	const { pathname } = useLocation();
	const isListenPage = useMemo(() => pathname.includes(`/listen`), [pathname]);

	useEffect(() => {
		if (isListenPage) setDrawerOpen(finalConfig.ui.listenSidebar.active && finalConfig.ui.listenSidebar.defaultOpen);
		else setDrawerOpen(false);
	}, [isListenPage]);

	return <UiConfigContext.Provider value={{ showShare, handleCloseShare, handleShare, drawerOpen, setDrawerOpen }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
