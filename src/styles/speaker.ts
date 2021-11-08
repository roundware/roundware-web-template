import { PolygonProps } from '@react-google-maps/api';

export const speakerPolygonColors = ['#044389', '#FCFF4B', '#FFAD05', '#7CAFC4', '#63A375', '#EF27A6'];
export const speakerPolygonOptions: PolygonProps[`options`] = {
	clickable: false,
	draggable: false,
	editable: false,
	strokeOpacity: 0,
	strokeWeight: 0,
	fillOpacity: 0.25,
	strokeColor: undefined,
};
