import { Polygon, PolygonProps } from '@react-google-maps/api';
import React, { useMemo, useState } from 'react';
import { useRoundware } from 'hooks';
import { speakerPolygonColors as colors, speakerPolygonOptions } from 'styles/speaker';
import { polygonToGoogleMapPaths } from 'utils';
import CustomMapControl from '../CustomControl';
import config from 'config';
import { ISpeakerData } from 'roundware-web-framework/dist/types/speaker';
interface Props {}

const getColorForIndex = (index: number): string => {
	return colors[index % colors.length];
};
const SpeakerPolygons = (props: Props) => {
	const { roundware, hideSpeakerPolygons } = useRoundware();

	const [options, setOptions] = useState<PolygonProps[`options`]>(speakerPolygonOptions);

	const googleMapPolygonProps: PolygonProps[] = useMemo(() => {
		if (!Array.isArray(roundware.speakers())) return [];
		return roundware
			.speakers()
			?.sort((a, b) => (a?.id > b?.id ? -1 : 1))
			?.filter((speaker): speaker is ISpeakerData & Required<Pick<ISpeakerData, 'shape'>> => !!speaker.shape)
			?.filter((s) => !hideSpeakerPolygons.includes(s.id))
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
	}, [roundware.project, options, hideSpeakerPolygons]);

	return (
		<div>
			{config.debugMode === true && (
				<CustomMapControl position={window.google.maps.ControlPosition.LEFT_CENTER}>
					<div>
						<p>fillOpacity</p>
						<input type='number' value={options?.fillOpacity?.toString()} onChange={(e) => setOptions((prev) => ({ ...prev, fillOpacity: Number(e.target.value) }))} />
					</div>

					<div>
						<p>strokeOpacity</p>
						<input type='number' value={options?.strokeOpacity?.toString()} onChange={(e) => setOptions((prev) => ({ ...prev, strokeOpacity: Number(e.target.value) }))} />
					</div>

					<div>
						<p>strokeWeight</p>
						<input type='number' value={options?.strokeWeight?.toString()} onChange={(e) => setOptions((prev) => ({ ...prev, strokeWeight: Number(e.target.value) }))} />
					</div>
				</CustomMapControl>
			)}
			{Array.isArray(googleMapPolygonProps) && googleMapPolygonProps.map((p) => <Polygon {...p} />)}
		</div>
	);
};

export default SpeakerPolygons;
