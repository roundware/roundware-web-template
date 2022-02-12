import React from 'react';
import { Dialog, DialogContent, Stack, IconButton, DialogProps, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
interface Props extends DialogProps {
	title?: string;
	subtitle?: string;
}

const Modal = ({ title, ...props }: Props) => {
	return (
		<Dialog {...props}>
			<DialogContent>
				<Stack spacing={2}>
					<Stack direction='row' spacing={3} alignItems='center' justifyContent='space-between'>
						<Typography variant='h6'>{title}</Typography>
						<IconButton onClick={(e) => props.onClose?.(e, 'backdropClick')}>
							<CloseIcon />
						</IconButton>
					</Stack>
					{props.children}
				</Stack>
			</DialogContent>
		</Dialog>
	);
};

export default Modal;
