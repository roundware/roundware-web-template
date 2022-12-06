import React, { createContext, useContext } from 'react';

export const UiConfigContext = createContext({
	infoWindowOrder: ['date', 'tags', 'description', 'text', 'audio', 'actions'],
	showShare: '',
	handleShare: (customLink?: string) => {},
	handleCloseShare: () => {},
	drawerOpen: false,
	setDrawerOpen: (open: boolean) => {},
});

export const useUIContext = () => useContext(UiConfigContext);
