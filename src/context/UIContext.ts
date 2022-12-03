import { createContext, useContext } from 'react';

export const UiConfigContext = createContext({
	infoWindowOrder: ['date', 'tags', 'description', 'text', 'audio', 'actions'],
	showShare: '',
	handleShare: (customLink?: string) => {},
	handleCloseShare: () => {},
});

export const useUIContext = () => useContext(UiConfigContext);
