import { GeoListenMode } from 'roundware-web-framework';

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
	alert(`is mobile? ` + isMobile);
	if (process.env.GEO_LISTEN_MODE == 'device') {
		return isMobile ? GeoListenMode.AUTOMATIC : GeoListenMode.MANUAL;
	}
	const listenMode = (process.env.GEO_LISTEN_MODE || 'map,walking').split(`,`)[0];
	if (listenMode == 'map') return GeoListenMode.MANUAL;
	return GeoListenMode.AUTOMATIC;
};
