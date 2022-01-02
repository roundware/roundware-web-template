import React from 'react';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
interface Props {}

const SpeakButton = (props: Props) => {
	return (
		<IconButton title='Speak'>
			<MicIcon />
		</IconButton>
	);
};

export default SpeakButton;
