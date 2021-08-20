import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import { UiConfigContext } from '../context/UIContext';
const UiConfigProvider = ({ children }: { children: React.ReactNode }) => {
	const [infoWindowOrder, setInfoWindowOrder] = useState<string[]>(['date', 'tags', 'description', 'text', 'audio', 'actions']);

	useEffect(() => {
		// pass INFOWINDOW_DISPLAY_ITEMS var in env to set the order
		// example: INFOWINDOW_DISPLAY_ITEMS=date,tags,description,text,audio,actions
		const passedOrder = process.env.INFOWINDOW_DISPLAY_ITEMS;
		if (passedOrder) {
			setInfoWindowOrder(passedOrder.split(','));
		}
	}, []);

	return <UiConfigContext.Provider value={{ infoWindowOrder }}>{children}</UiConfigContext.Provider>;
};

export default UiConfigProvider;
