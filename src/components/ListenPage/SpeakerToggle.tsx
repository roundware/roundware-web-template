import { Paper, Stack, Switch, ThemeProvider, Typography } from '@mui/material';
import finalConfig from 'config';
import { useRoundware } from 'hooks';
import { useEffect, useState } from 'react';
import { lightTheme } from 'styles';
import CustomMapControl from './Map/CustomControl';

const SpeakerToggle = () => {
	const [speakerValues, setSpeakerValues] = useState(
		finalConfig.features.speakerToggleIds?.reduce((acc, id) => {
			acc[id] = true;
			return acc;
		}, {} as Record<string, boolean>)
	);

	const { roundware } = useRoundware();
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
						{finalConfig.features.speakerToggleIds?.map((id) => (
							<Stack direction={'row'} spacing={1} key={id} alignItems={'center'}>
								<Typography>{id}</Typography>
								<Switch
									checked={speakerValues[id]}
									onChange={(e) => {
										setSpeakerValues((prev) => {
											const newValues = { ...prev };
											newValues[id] = e.target.checked;
											return newValues;
										});
									}}
								/>
							</Stack>
						))}
					</Stack>
				</Paper>
			</ThemeProvider>
		</CustomMapControl>
	);
};

export default SpeakerToggle;
