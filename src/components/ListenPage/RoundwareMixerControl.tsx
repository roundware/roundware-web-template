import Forward5Icon from '@mui/icons-material/Forward5';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Replay5Icon from '@mui/icons-material/Replay5';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import { GeoListenMode } from 'roundware-web-framework';
import { useRoundware } from '../../hooks';

const RoundwareMixerControl = () => {
	const { roundware, forceUpdate } = useRoundware();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const isPlaying = roundware.mixer && roundware.mixer.playing;

	const handleSnackbarClose: SnackbarProps[`onClose`] = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
	};

	useEffect(() => {
		if (roundware?.mixer) {
			roundware.activateMixer({ geoListenMode: GeoListenMode.MANUAL }).then(() => {
				if (roundware && roundware.uiConfig && roundware.uiConfig.listen && roundware.uiConfig.listen[0]) {
					const listen_tags = roundware.uiConfig.listen[0].display_items.map((i) => i.tag_id);
					roundware.mixer.updateParams({
						listenerLocation: roundware.listenerLocation,
						minDist: 0,
						maxDist: 0,
						recordingRadius: 0,
						listenTagIds: listen_tags,
					});
					forceUpdate();
				}
			});
		}

		// when the control for the mixer is unmounted, clean up by stopping the mixer
		return () => {
			roundware?.mixer?.toggle(false);
		};
	}, [roundware]);

	function seek(offset: number): void {
		roundware.mixer.speakerTracks?.forEach((s) => {
			const currentTime = s.player.audio.currentTime;
			let newTime = currentTime + offset;

			// Ensure the new time is within the bounds of the audio duration
			if (newTime < 0) {
				newTime = 0;
			} else if (newTime > s.player.audio.duration) {
				newTime = s.player.audio.duration;
			}

			s.player.audio.currentTime = newTime;

			// Adjust global._roundwareSpeakerStartedAt to match the new seek time
			// @ts-ignore
			if (global._roundwareSpeakerStartedAt instanceof Date) {
				const seekDifference = newTime * 1000;
				//   @ts-ignore
				global._roundwareSpeakerStartedAt = new Date(new Date().getTime() - seekDifference);
			}
		});
	}

	return (
		<>
			<Button onClick={() => seek(-5)} disabled={isPlaying ? false : true}>
				<Replay5Icon />
			</Button>

			<Button
				onClick={() => {
					if (!roundware.mixer || !roundware.mixer?.playlist) {
						roundware.activateMixer({ geoListenMode: GeoListenMode.MANUAL }).then(() => {
							if (roundware && roundware.uiConfig && roundware.uiConfig.listen && roundware.uiConfig.listen[0]) {
								const listen_tags = roundware.uiConfig.listen[0].display_items.map((i) => i.tag_id);
								roundware.mixer.updateParams({
									listenerLocation: roundware.listenerLocation,
									minDist: 0,
									maxDist: 0,
									recordingRadius: 0,
									listenTagIds: listen_tags,
								});
								roundware.mixer.toggle();
								forceUpdate();
							}
						});
					} else {
						roundware.mixer.toggle();
						forceUpdate();
					}
				}}
			>
				{roundware && roundware.mixer && roundware.mixer.playing ? <PauseCircleOutlineIcon fontSize='large' /> : <PlayCircleOutlineIcon fontSize='large' />}
			</Button>

			<Button disabled={isPlaying ? false : true} onClick={() => seek(5)}>
				<Forward5Icon />
			</Button>

			<Button
				disabled={isPlaying ? false : true}
				onClick={() => {
					if (!roundware.mixer || !roundware.mixer.playlist) {
						return;
					} else {
						const trackIds = Object.keys(roundware.mixer.playlist.trackIdMap || {}).map((id) => parseInt(id));
						trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
						setSnackbarOpen(true);
					}
				}}
			>
				<SkipNextIcon />
			</Button>

			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} style={{ marginBottom: 50 }}>
				<Alert elevation={6} severity='success'>
					Remixing audio: skipping ahead!
				</Alert>
			</Snackbar>
		</>
	);
};

export default RoundwareMixerControl;
