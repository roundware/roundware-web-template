import { Paper, Stack, Switch, ThemeProvider, Typography } from '@mui/material';
import finalConfig from 'config';
import { useRoundware } from 'hooks';
import { useEffect, useState } from 'react';
import { lightTheme } from 'styles';
import CustomMapControl from './Map/CustomControl';

const SpeakerToggle = () => {
	const [speakerValues, setSpeakerValues] = useState(
		finalConfig.features.speakerToggleIds?.reduce((acc, id, idx) => {
			acc[id] = idx === 1;
			return acc;
		}, {} as Record<string, boolean>)
	);

	const { roundware, setHideSpeakerPolygons } = useRoundware();
	useEffect(() => {
		if (speakerValues) {
			roundware.mixer.speakerTracks?.forEach((st) => {
				if (st.speakerId in speakerValues) {
					if (speakerValues[st.speakerId] === false) {
						console.log('st', st.player);
						st.player.fadeOutAndPause();
						console.log('st', st.player);
					} else {
						st.updateVolume();
					}
				}
			});

			setHideSpeakerPolygons(
				Object.keys(speakerValues)
					.filter((key) => speakerValues[key] === false)
					.map((key) => parseInt(key, 10))
			);
		}
	}, [speakerValues, ...(roundware.mixer.speakerTracks?.map((st) => st.currentVolume) ?? [])]);

	return (
		<CustomMapControl position={window.google.maps.ControlPosition.RIGHT_CENTER}>
			<ThemeProvider theme={lightTheme}>
				<Paper
					sx={{
						p: 1.5,
						mr: 2,
					}}
					elevation={10}
				>
					<Stack spacing={1}>
						<Typography fontWeight={'bold'} variant={'body1'}>
							Speakers
						</Typography>

						<Switch
							checked={speakerValues[finalConfig.features.speakerToggleIds[1]]}
							onChange={(e) => {
								setSpeakerValues((prev) => {
									const newValues = { ...prev };

									const speakerToTurnOn = finalConfig.features.speakerToggleIds[e.target.checked ? 1 : 0];

									Object.keys(newValues).forEach((key) => {
										newValues[key] = false;
									});

									newValues[speakerToTurnOn] = true;

									return newValues;
								});
							}}
						/>
					</Stack>
				</Paper>
			</ThemeProvider>
		</CustomMapControl>
	);
};

export default SpeakerToggle;
