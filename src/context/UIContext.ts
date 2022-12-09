import React, { createContext, useContext } from 'react';

export const UiConfigContext = createContext({
	showShare: '',
	handleShare: (customLink?: string) => {},
	handleCloseShare: () => {},
	drawerOpen: false,
	setDrawerOpen: (open: boolean) => {},
});

export const useUIContext = () => useContext(UiConfigContext);
