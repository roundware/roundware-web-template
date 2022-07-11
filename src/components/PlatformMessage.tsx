import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import Modal from './elements/Modal';

export type PlatformMessage = {
	title?: string;

	message: React.ReactNode;
	action?: React.ReactNode;
	buttonLabel?: string;
};
type Props = {
	getMessage: () => PlatformMessage | null;
};

const PlatformMessage = ({ getMessage }: Props) => {
	const [message, setMessage] = useState<PlatformMessage | null>(getMessage());

	const handleClose = () => setMessage(null);

	return (
		<Modal open={!!message} onClose={handleClose} title={message?.title || 'Note'}>
			<Typography>{message?.message}</Typography>

			<DialogActions>
				{message?.action || null}
				<Button onClick={handleClose} endIcon={<ChevronRightIcon />}>
					{message?.buttonLabel || 'Continue Anyway'}
				</Button>
			</DialogActions>
		</Modal>
	);
};

export default PlatformMessage;
