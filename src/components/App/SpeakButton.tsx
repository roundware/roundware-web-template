import React from 'react';
import IconButton from '@mui/material/IconButton';
import MicIcon from '@mui/icons-material/Mic';
import Box from '@mui/material/Box';
interface Props {}

const SpeakButton = (props: Props) => {
	return (
		<Box>
			<IconButton title='Speak'>
				<MicIcon />
			</IconButton>
		</Box>
	);
};

export default SpeakButton;
