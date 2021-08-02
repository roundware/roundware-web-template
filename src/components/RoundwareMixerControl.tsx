import React, { useEffect, useState } from 'react';
import PauseCircleOutlineIcon from '@material-ui/icons/PauseCircleOutline';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import Button from '@material-ui/core/Button';
import Snackbar, { SnackbarCloseReason } from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { useRoundware } from '../hooks';
import { GeoListenMode } from 'roundware-web-framework';

function Alert(props: AlertProps) {
	return <MuiAlert elevation={6} variant='filled' {...props} />;
}

const RoundwareMixerControl = () => {
	const { roundware, forceUpdate } = useRoundware();
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const isPlaying = roundware._mixer && roundware._mixer.playing;

	const handleSnackbarClose = (event: React.SyntheticEvent<any, Event>, reason: SnackbarCloseReason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
	};

	if (roundware.activateMixer && !roundware._mixer && GeoListenMode) {
		roundware.activateMixer({ geoListenMode: GeoListenMode.MANUAL }).then((token: any, force: any) => {
			const listen_tags = roundware.uiConfig.listen[0].display_items.map((i: any) => i.tag_id);
			roundware._mixer.updateParams({
				listenerLocation: roundware._listenerLocation,
				minDist: 0,
				maxDist: 0,
				recordingRadius: 0,
				listenTagIds: listen_tags,
			});
			forceUpdate();
		});
	}

	useEffect(() => {
		// when the control for the mixer is unmounted, clean up by stopping the mixer
		return () => {
			if (roundware._mixer && roundware._mixer.active) {
				roundware._mixer.toggle(roundware._mixer.token);
			}
		};
	}, []);

	return (
		<>
			<Button
				onClick={() => {
					if (!roundware._mixer) {
						roundware.activateMixer({ geoListenMode: GeoListenMode.MANUAL }).then((token: any, force: any) => {
							const listen_tags = roundware.uiConfig.listen[0].display_items.map((i: any) => i.tag_id);
							roundware._mixer.updateParams({
								listenerLocation: roundware._listenerLocation,
								minDist: 0,
								maxDist: 0,
								recordingRadius: 0,
								listenTagIds: listen_tags,
							});
							roundware._mixer.toggle(token, force);
							forceUpdate();
						});
					} else {
						roundware._mixer.toggle(roundware._mixer.token, false);
						forceUpdate();
					}
				}}
			>
				{roundware && roundware._mixer && roundware._mixer.playing ? <PauseCircleOutlineIcon fontSize='large' /> : <PlayCircleOutlineIcon fontSize='large' />}
			</Button>
			<Button
				disabled={isPlaying ? false : true}
				onClick={() => {
					if (!roundware._mixer) {
						return;
					} else {
						const trackIds = Object.keys(roundware._mixer.playlist.trackIdMap).map((id) => parseInt(id));
						trackIds.forEach((audioTrackId) => roundware._mixer.skipTrack(audioTrackId));
						setSnackbarOpen(true);
					}
				}}
			>
				<SkipNextIcon />
			</Button>
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				{/* @ts-ignore onClose property conflicts */}
				<Alert onClose={handleSnackbarClose} severity='success'>
					Remixing audio: skipping ahead!
				</Alert>
			</Snackbar>
		</>
	);
};

export default RoundwareMixerControl;
