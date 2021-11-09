import { ISpeakerData } from 'roundware-web-framework/dist/types/speaker';
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
