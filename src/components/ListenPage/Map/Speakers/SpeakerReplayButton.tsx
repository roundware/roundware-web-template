import React, { useEffect, useState } from 'react';
import { styled, Button, Grow } from '@mui/material';
import { useRoundware } from 'hooks';
import ReplayIcon from '@mui/icons-material/Replay';
type Props = {};

const SpeakerReplayButton = (props: Props) => {
	const { roundware } = useRoundware();
	const [showReplay, setShowReplay] = useState(false);
	useEffect(() => {
		setupListener();
	}, [roundware?.mixer?.speakerTracks]);

	const setupListener = () => {
		if (roundware.mixer && Array.isArray(roundware.mixer.speakerTracks)) {
			roundware.mixer.onAllSpeakersEnd(() => {
				setShowReplay(true);
				console.log(`all ended`);
			});
		}
	};

	const handleOnReplay = () => {
		roundware?.mixer?.replay();
		setShowReplay(false);
	};
	console.log(`show replay`, showReplay);
	return (
		<Grow in={showReplay}>
			<StyledButton startIcon={<ReplayIcon />} variant='contained' onClick={handleOnReplay}>
				Replay
			</StyledButton>
		</Grow>
	);
};

const StyledButton = styled(Button)({
	position: 'fixed',
	bottom: 80,
	right: 20,
});

export default SpeakerReplayButton;
