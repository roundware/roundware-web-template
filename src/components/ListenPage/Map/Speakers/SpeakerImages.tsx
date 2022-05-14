import { GroundOverlay, GroundOverlayProps, Marker, useGoogleMap } from '@react-google-maps/api';
import React, { useMemo, useState } from 'react';
import { useRoundware } from 'hooks';
import { speakerPolygonColors as colors, speakerPolygonOptions } from 'styles/speaker';
import { polygonToGoogleMapPaths } from 'utils';
import CustomMapControl from '../CustomControl';
import config from 'config.json';
import { polygon, point, Point } from '@turf/helpers';
import getCenterOfMass from '@turf/center-of-mass';
import getTangentsOfPolygon from '@turf/polygon-tangents';
import polygonToLines from '@turf/polygon-to-line';
import midpoint from '@turf/midpoint';
import distance from '@turf/distance';
import destination from '@turf/destination';
import { Position } from '@turf/helpers';
import speakerImage from 'assets/speaker.png';
interface Props {}

const getColorForIndex = (index: number): string => {
	return colors[index % colors.length];
};
const SpeakerImages = (props: Props) => {
	const { roundware } = useRoundware();

	const map = useGoogleMap();
	const overlayProps: GroundOverlayProps[] = useMemo(() => {
		if (!Array.isArray(roundware.speakers())) return [];
		return roundware
			.speakers()
			?.sort((a, b) => (a?.id > b?.id ? -1 : 1))
			?.filter((speaker) => speaker.shape)
			.flatMap((s, index) => {
				const shape = polygon(s.shape.coordinates[0]);
				const coordinates = shape.geometry.coordinates[0];

				// get midpoints of all edges
				const midpoints: Point[] = [];

				for (let i = 0; i < coordinates.length - 1; i++) {
					const currentPoint = point(coordinates[i]);
					const nextPoint = point(coordinates[i + 1]);
					midpoints.push(midpoint(currentPoint, nextPoint).geometry);
				}

				// center of mass of polygon
				const centerOfMass = getCenterOfMass(shape).geometry.coordinates;

				// distances from center of mass to each midpoint
				const distances: number[] = [];

				midpoints.forEach((m) =>
					distances.push(
						distance(centerOfMass, m.coordinates, {
							units: 'degrees',
						})
					)
				);

				// take mean distance
				const avgDistance = (Math.min(...distances) + Math.max(...distances)) / 2;

				// find square points
				const squarePoints: Position[] = [];

				for (let i = 0; i < 4; i++) {
					squarePoints.push(
						destination(centerOfMass, avgDistance, 90 * i + 45, {
							units: 'degrees',
						}).geometry.coordinates
					);
				}

				const prop: GroundOverlayProps = {
					bounds: new google.maps.LatLngBounds(new google.maps.LatLng(squarePoints[2][1], squarePoints[2][0]), new google.maps.LatLng(squarePoints[0][1], squarePoints[0][0])),
					url: speakerImage,
					options: {
						opacity: 0.2,
					},
					// @ts-ignore
					key: s?.id,
				};
				// const prop2: PolygonProps = {
				// 	path: polygonToGoogleMapPaths(s.shape),
				// 	options: {
				// 		...speakerPolygonOptions,
				// 		fillColor: getColorForIndex(index),
				// 		strokeColor: getColorForIndex(index),
				// 	},
				// 	// @ts-ignore
				// 	key: s?.id,
				// };
				return [prop];
			});
	}, [roundware.project, speakerPolygonOptions]);
	console.log(`speaker:images:markerPoints`);
	return (
		<>
			{Array.isArray(overlayProps) &&
				overlayProps.map((p) => {
					return <GroundOverlay {...p} key={Math.random().toString()} />;
				})}
		</>
	);
};

export default SpeakerImages;
