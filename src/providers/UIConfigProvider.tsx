import React, { useState } from 'react';
import { UiConfigContext } from '../context/UIContext';

const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [showShare, setShowShare] = useState('');
	const handleCloseShare = () => setShowShare('');
	const handleShare = (customUrl?: string) => {
		setShowShare(customUrl || 'true');
	};

	const [drawerOpen, setDrawerOpen] = useState(false);

	return <UiConfigContext.Provider value={{ showShare, handleCloseShare, handleShare, drawerOpen, setDrawerOpen }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
