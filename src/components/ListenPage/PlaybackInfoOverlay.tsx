import { Card, CardContent, Fade, Link, Paper, Stack, ThemeProvider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { lightTheme } from 'styles';
import OpenInNew from '@mui/icons-material/OpenInNew';
import playbackInfo from '../../playbackInfo.json';
import { useRoundware } from 'hooks';
import CustomMapControl from './Map/CustomControl';

type PlaybackInfo = {
	id: number;
	startTime: number;
	stopTime: number;
	displayText: string;
	url: string;
};

const PLAYBACK_INFO: PlaybackInfo[] = playbackInfo;

const PlaybackInfoOverlay = () => {
	const [displayPlaybackInfo, setDisplayPlaybackInfo] = useState<PlaybackInfo | null>(null);

	const { roundware } = useRoundware();

	const [timeouts, setTimeouts] = useState<NodeJS.Timer[]>([]);

	useEffect(() => {
		if (roundware.mixer.playing) {
			const elapsedTimeMs = roundware.mixer.playlist?.elapsedTimeMs;
			if (typeof elapsedTimeMs !== 'number') return;

			const elapsedSeconds = elapsedTimeMs / 1000;
			// set intervals such that the playback info are displayed at the correct time;

			PLAYBACK_INFO.forEach((info) => {
				// if the elapsed time is within the range of the playback info, display it
				if (elapsedSeconds >= info.startTime && elapsedSeconds <= info.stopTime) {
					setDisplayPlaybackInfo(info);

					setTimeout(
						() => {
							setDisplayPlaybackInfo(null);
						},
						// remaining time
						(info.stopTime - elapsedSeconds) * 1000
					);

					// if the elapsed time is before the start time, schedule the display
				} else if (elapsedSeconds < info.startTime) {
					const timeout = setTimeout(() => {
						setDisplayPlaybackInfo(info);
						setTimeout(() => {
							setDisplayPlaybackInfo(null);
						}, (info.stopTime - info.startTime) * 1000);
					}, (info.startTime - elapsedSeconds) * 1000);

					setTimeouts([...timeouts, timeout]);
				}
			});
		} else {
			// cancel the intervals
			timeouts.forEach((timeout) => clearTimeout(timeout));
		}
	}, [roundware.mixer.playing]);

	return (
		<CustomMapControl position={google.maps.ControlPosition.TOP_CENTER}>
			<ThemeProvider theme={lightTheme}>
				<Fade in={displayPlaybackInfo !== null}>
					<Paper
						sx={{
							p: 2,
							borderRadius: 2,
							mt: 2,
						}}
					>
						<Link href={displayPlaybackInfo?.url} target='_blank' rel='noreferrer'>
							<Stack direction={'row'} spacing={2} alignItems={'center'}>
								<Typography variant='h6'>{displayPlaybackInfo?.displayText}</Typography>

								<OpenInNew />
							</Stack>
						</Link>
					</Paper>
				</Fade>
			</ThemeProvider>
		</CustomMapControl>
	);
};

export default PlaybackInfoOverlay;
