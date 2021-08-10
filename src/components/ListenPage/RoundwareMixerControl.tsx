import React, { useEffect, useState } from 'react';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from '@material-ui/core/Button';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useRoundware } from '../../hooks';
import { GeoListenMode } from 'roundware-web-framework';

function Alert(props: AlertProps) {
	return <MuiAlert elevation={6} variant='filled' {...props} />;
}

const RoundwareMixerControl = () => {
	const { roundware, forceUpdate } = useRoundware();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const isPlaying = roundware.mixer && roundware.mixer.playing;

	const handleSnackbarClose = (event: React.SyntheticEvent<unknown, Event>, reason?: SnackbarCloseReason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
	};

	if (typeof roundware.activateMixer == 'function' && !roundware.mixer && GeoListenMode) {
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

	useEffect(() => {
		// when the control for the mixer is unmounted, clean up by stopping the mixer
		return () => {
			if (roundware.mixer && roundware.mixer.playing) {
				roundware.mixer.toggle();
			}
		};
	}, []);

	return (
		<>
			<Button
				onClick={() => {
					if (!roundware.mixer) {
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
						alert(trackIds);
						trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
						setSnackbarOpen(true);
					}
				}}
			>
				<SkipNextIcon />
			</Button>
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				<Alert onClose={handleSnackbarClose} severity='success'>
					Remixing audio: skipping ahead!
				</Alert>
			</Snackbar>
		</>
	);
};

export default RoundwareMixerControl;
