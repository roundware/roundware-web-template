import { Mic } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { point } from '@turf/helpers';
import { useRoundware } from '@/hooks/index';
import { useState } from 'react';

const AddLoopVoiceButton = () => {
	const { roundware, forceUpdate } = useRoundware();

	const [showNoSpeakerMessage, setShowNoSpeakerMessage] = useState(false);

	const handleClick = () => {
		const lat = roundware.listenerLocation.latitude as number;
		const lng = roundware.listenerLocation.longitude as number;
		roundware.mixer.initializeSpeakers();
		roundware.mixer.speakerTracks?.forEach((speaker) => {
			speaker.updateParams(false, {
				listenerPoint: point([lng, lat]),
			});
		});

		const sts = roundware.mixer.speakerTracks?.sort((st1, st2) => {
			console.log('volume: ', st1.speakerData.id, st1.calculateVolume(), st1.listenerPoint);
			console.log('volume:', st2.speakerData.id, st2.calculateVolume());
			return st2.calculateVolume() - st1.calculateVolume();
		});

		if (sts && sts.length > 0 && sts[0].calculateVolume() !== sts[0].minVolume) {
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
			<Button
				sx={{
					position: 'absolute',
					bottom: 0,
					left: '50%',
					transform: 'translate(-50%, -50%)',
					zIndex: 1000,
				}}
				variant='contained'
				size='large'
				startIcon={<Mic />}
				onClick={handleClick}
			>
				Add your voice here
			</Button>

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
