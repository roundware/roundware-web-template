import { createContext } from 'react';

export const UiConfigContext = createContext({
	infoWindowOrder: ['date', 'tags', 'description', 'text', 'audio', 'actions'],
});
