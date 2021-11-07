import React, { useMemo, useState } from 'react';
import { useRoundware } from '../../../hooks';
import { polygonToGoogleMapPaths } from '../../../utils';
import { Polygon, PolygonProps } from '@react-google-maps/api';
interface Props {}

const colors = process.env.SPEAKER_STROKE_COLORS?.split(`,`) || ['blue'];
const getColorForIndex = (index: number): string => {
	return colors[index % colors.length];
};
const SpeakerPolygons = (props: Props) => {
	const { roundware } = useRoundware();

	const googleMapPolygonProps: PolygonProps[] = useMemo(() => {
		if (!Array.isArray(roundware.speakers())) return [];
		return roundware
			.speakers()
			?.sort((a, b) => (a?.id > b?.id ? -1 : 1))
			?.filter((speaker) => speaker.shape)
			.flatMap((s, index) => {
				const prop: PolygonProps = {
					path: polygonToGoogleMapPaths(s.shape),
					options: {
						clickable: false,
						draggable: false,
						editable: false,
						fillOpacity: 0,
						strokeOpacity: 1,
						strokeColor: getColorForIndex(index),
					},
					// @ts-ignore
					key: s?.id,
				};
				return [prop];
			});
	}, [roundware.project]);

	console.log(googleMapPolygonProps);
	return (
		<div>
			{googleMapPolygonProps.map((p) => (
				<Polygon {...p} />
			))}
		</div>
	);
};

export default SpeakerPolygons;
