import { createContext, useContext } from 'react';

export const UiConfigContext = createContext({
	infoWindowOrder: ['date', 'tags', 'description', 'text', 'audio', 'actions'],
	showShare: false,
	handleShare: () => {},
	handleCloseShare: () => {},
});

export const useUIContext = () => useContext(UiConfigContext);
