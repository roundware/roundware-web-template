import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import React from 'react';

interface ErrorDialogProps {
	error: Error | null;
	set_error: React.Dispatch<React.SetStateAction<Error | null>>;
}
const ErrorDialog = ({ error, set_error }: ErrorDialogProps) => {
	return (
		<Dialog open={error !== null}>
			<DialogContent>
				<DialogContentText>{error ? error.message : `Something went wrong! Please try again.`}</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						set_error(null);
					}}
				>
					OK
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ErrorDialog;
