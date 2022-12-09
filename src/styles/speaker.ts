import { PolygonProps } from '@react-google-maps/api';
import finalConfig from 'config';

export const speakerPolygonColors = finalConfig.map.speakerPolygonColors;
export const speakerPolygonOptions: PolygonProps[`options`] = {
	clickable: false,
	draggable: false,
	editable: false,
	strokeOpacity: 0,
	strokeWeight: 0,
	fillOpacity: 0.25,
	strokeColor: undefined,
};
