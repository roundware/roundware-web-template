import { Mic } from '@mui/icons-material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Box, Button, Dialog, DialogActions, DialogContent, Tooltip, Skeleton, Fade, Fab, Stack } from '@mui/material';
import { point } from '@turf/helpers';
import { useRoundware } from '@/hooks/index';
import { useState } from 'react';

const AddLoopVoiceButton = () => {
	const { roundware, forceUpdate } = useRoundware();

	const [showNoSpeakerMessage, setShowNoSpeakerMessage] = useState(false);
	const [showLaunch, setShowLaunch] = useState(true);

	const handleClick = () => {
		const lat = roundware.listenerLocation.latitude as number;
		const lng = roundware.listenerLocation.longitude as number;
		roundware.mixer.initContext();
		roundware.mixer.speakerEngine?.updateParams({
			listenerPoint: point([lng, lat]),
		});

		const sts = roundware.mixer.speakerEngine?.speakers?.sort((st1, st2) => {
			return st2.volumeByLocation(point([lng, lat]).geometry) - st1.volumeByLocation(point([lng, lat]).geometry);
		});

		if (sts && sts.length > 0 && sts[0].volumeByLocation(point([lng, lat]).geometry) !== sts[0].minVolume) {
			roundware.mixer.stop();
			forceUpdate();
			// history.push({
			// 	pathname: '/speak',
			// 	search: `?lat=${lat}&lng=${lng}`,
			// });
			window.location.href = `/speak?lat=${lat}&lng=${lng}`;
		} else {
			setShowNoSpeakerMessage(true);
		}
	};
	return (
		<>
			<Fade in={showLaunch} timeout={1000}>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					position="absolute"
					width="100%"
					height="100%"
					sx={{ '& .MuiFab-root': { width: 120, height: 120 } }}>
					<Box sx={{ position: 'relative' }}>
						<Skeleton
							variant="circular"
							animation="pulse"
							sx={{
								position: 'absolute',
								width: 160,
								height: 160,
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
					
							}}
						/>
						<Tooltip title="TAP TO JOIN CHOIR" arrow placement="bottom">
							<Fab size="large" onClick={handleClick}>
								<AddCircleOutlineIcon fontSize="large" />
								
							</Fab>
						</Tooltip>
					</Box>
				</Box>
			</Fade>

			<Dialog open={showNoSpeakerMessage} onClose={() => setShowNoSpeakerMessage(false)}>
				<DialogContent>Sorry, but there is no choir here for you to join. Please find a new location for your participation!</DialogContent>
				<DialogActions>
					<Button onClick={() => setShowNoSpeakerMessage(false)} variant='contained' color='primary'>
						OK
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default AddLoopVoiceButton;
