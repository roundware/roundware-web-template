import { GeoListenMode } from 'roundware-web-framework';
import config from 'config';
export const wait = <PromiseType>(delay: number, value?: any): Promise<PromiseType> => new Promise((resolve) => setTimeout(resolve, delay, value));

/** gets google map paths from geojson polygon
 * (from roundware-react-admin) */
export const polygonToGoogleMapPaths = (polygon: { type: string; coordinates: number[][][] | number[][][][] }) => {
	let coordinates: number[][] = [];
	// @ts-ignore
	if (polygon.type == 'MultiPolygon') coordinates = polygon.coordinates[0][0];
	// @ts-ignore
	else if (polygon.type == 'Polygon') coordinates = polygon.coordinates[0];
	return coordinates?.map((p) => new window.google.maps.LatLng(p[1], p[0]));
};
function getWidth() {
	return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);
}

export const getDefaultListenMode = () => {
	const isMobile = getWidth() < 600;

	if (config.listen.geoListenMode == 'device') {
		return isMobile ? GeoListenMode.AUTOMATIC : GeoListenMode.MANUAL;
	}
	const listenMode = (config.listen.geoListenMode || ['map', 'walking'])[0];
	if (listenMode == 'map') return GeoListenMode.MANUAL;
	return GeoListenMode.AUTOMATIC;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
export function getRandomArbitrary(min: number, max: number) {
	return Math.random() * (max - min) + min;
}
