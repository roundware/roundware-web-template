import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';

import { defaultTheme } from '../styles';
const UserConfirmation = (message: string, callback: (bool: boolean) => any) => {
	const container = document.createElement('div');
	container.setAttribute('custom-confirmation-navigation', '');
	document.body.appendChild(container);
	const parsedMessage = JSON.parse(message);
	const closeModal = (callbackState: boolean) => {
		ReactDOM.unmountComponentAtNode(container);
		document.body.removeChild(container);
		callback(callbackState);
	};
	ReactDOM.render(
		<ThemeProvider theme={defaultTheme}>
			<Dialog open={true}>
				<DialogTitle>Warning</DialogTitle>
				<DialogContent>{parsedMessage?.message}</DialogContent>
				<DialogActions>
					<Button variant='contained' onClick={() => closeModal(false)} color='success'>
						{parsedMessage?.stay}
					</Button>
					<Button variant='contained' onClick={() => closeModal(true)} color='error'>
						{parsedMessage?.leave}
					</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>,
		container
	);
};
export default UserConfirmation;
