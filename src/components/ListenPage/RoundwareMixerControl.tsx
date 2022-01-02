import React, { useEffect, useState } from 'react';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import Button from '@mui/material/Button';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useRoundware } from '../../hooks';
import { GeoListenMode } from 'roundware-web-framework';

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

	return (
		<>
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
