import React from 'react';
import ReactDOM from 'react-dom';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import { ThemeProvider } from '@mui/styles';
import { defaultTheme } from '../styles';
const UserConfirmation = (message: string, callback: (bool: boolean) => any) => {
	const container = document.createElement('div');
	container.setAttribute('custom-confirmation-navigation', '');
	document.body.appendChild(container);
	const closeModal = (callbackState: boolean) => {
		ReactDOM.unmountComponentAtNode(container);
		document.body.removeChild(container);
		callback(callbackState);
	};
	ReactDOM.render(
		<ThemeProvider theme={defaultTheme}>
			<Dialog open={true}>
				<DialogTitle>Warning</DialogTitle>
				<DialogContent>{message}</DialogContent>
				<DialogActions>
					<Button variant='contained' onClick={() => closeModal(false)} color='success'>
						Stay
					</Button>
					<Button variant='contained' onClick={() => closeModal(true)} color='error'>
						Leave
					</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>,
		container
	);
};
export default UserConfirmation;
