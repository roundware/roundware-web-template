import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useRoundware } from '../../../hooks';
import { polygonToGoogleMapPaths } from '../../../utils';
import { useGoogleMap, Polygon, PolygonProps } from '@react-google-maps/api';
import { speakerPolygonColors as colors, speakerPolygonOptions } from '../../../styles/speaker';
import CustomMapControl from './CustomControl';
interface Props {}

const getColorForIndex = (index: number): string => {
	return colors[index % colors.length];
};
const SpeakerPolygons = (props: Props) => {
	const { roundware } = useRoundware();

	const [options, setOptions] = useState<PolygonProps[`options`]>(speakerPolygonOptions);

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
						...options,
						fillColor: getColorForIndex(index),
						strokeColor: getColorForIndex(index),
					},
					// @ts-ignore
					key: s?.id,
				};
				return [prop];
			});
	}, [roundware.project, options]);

	return (
		<div>
			{process.env.DEBUG_MODE == 'true' && (
				<CustomMapControl position={window.google.maps.ControlPosition.LEFT_CENTER}>
					<div>
						<p>fillOpacity</p>
						<input type='number' value={options?.fillOpacity} onChange={(e) => setOptions((prev) => ({ ...prev, fillOpacity: Number(e.target.value) }))} />
					</div>

					<div>
						<p>strokeOpacity</p>
						<input type='number' value={options?.strokeOpacity} onChange={(e) => setOptions((prev) => ({ ...prev, strokeOpacity: Number(e.target.value) }))} />
					</div>

					<div>
						<p>strokeWeight</p>
						<input type='number' value={options?.strokeWeight} onChange={(e) => setOptions((prev) => ({ ...prev, strokeWeight: Number(e.target.value) }))} />
					</div>
				</CustomMapControl>
			)}
			{Array.isArray(googleMapPolygonProps) && googleMapPolygonProps.map((p) => <Polygon {...p} />)}
		</div>
	);
};

export default SpeakerPolygons;
