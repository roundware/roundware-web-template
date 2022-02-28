import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Modal from './elements/Modal';
import CopyableText from './elements/CopyableText';
import Collapse from '@mui/material/Collapse';
import LinkIcon from '@mui/icons-material/Link';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export type PlatformMessage = {
	title?: string;
	link?: string;
	message: React.ReactNode;
};
type Props = {
	getMessage: () => PlatformMessage | null;
};

const PlatformMessage = ({ getMessage }: Props) => {
	const [message, setMessage] = useState<PlatformMessage | null>(getMessage());
	const [getLink, setGetLink] = useState(false);
	const handleClose = () => setMessage(null);
	return (
		<Modal open={!!message} onClose={handleClose} title={message?.title || 'Note'}>
			<Typography>{message?.message}</Typography>
			<Collapse in={getLink}>{<CopyableText>{message?.link || window.location.href}</CopyableText>}</Collapse>
			<DialogActions>
				<Button endIcon={<LinkIcon />} variant='outlined' onClick={() => setGetLink((prev) => !prev)}>
					Get Link
				</Button>
				<Button onClick={handleClose} endIcon={<ChevronRightIcon />}>
					Continue Anyway
				</Button>
			</DialogActions>
		</Modal>
	);
};

export default PlatformMessage;
