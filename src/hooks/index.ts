import DraftRecordingContext from '../context/DraftRecordingContext';
import RoundwareContext from '../context/RoundwareContext';
import { useContext } from 'react';

import { useLocation } from 'react-router';
// A custom hook that builds on useLocation to parse
// the query string for you.
export const useQuery = () => {
	const location = useLocation();
	return new URLSearchParams(location.search);
};
export const useRoundware = () => {
	const context = useContext(RoundwareContext);
	return context;
};
export const useRoundwareDraft = () => useContext(DraftRecordingContext);

export const useLocationFromQuery = () => {
	const query = useQuery();
	const lat = parseFloat(query.get('lat') as string) || 0;
	const lng = parseFloat(query.get('lng') as string) || 0;
	return { lat, lng };
};
