import { Email } from '@mui/icons-material';
import { Box, Button, ListItemIcon, ListItemText, MenuItem, Stack, TextField } from '@mui/material';
import Modal from 'components/elements/Modal';
import { useRoundware } from 'hooks';
import config from 'config.json';
import { useRef, useState } from 'react';
import ApiClient from 'roundware-web-framework/dist/api-client';
import { User } from 'roundware-web-framework/dist/user';

type Props = {};

const ContactInfo = (props: Props) => {
	const [open, setOpen] = useState(false);

	const firstNameRef = useRef<HTMLInputElement>(null);
	const lastNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const { roundware } = useRoundware();
	return (
		<>
			<MenuItem onClick={() => setOpen(true)}>
				<ListItemIcon>
					<Email color='primary' />
				</ListItemIcon>
				<ListItemText primary='Contact Info' />
			</MenuItem>
			<Modal open={open} title='Contact Info' onClose={() => setOpen(false)}>
				<form
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<Stack spacing={1}>
						<TextField label='First Name' name='first_name' required autoFocus tabIndex={100} ref={firstNameRef} />
						<TextField label='Last Name' name='last_name' required tabIndex={101} ref={lastNameRef} />
						<TextField label='Email' type='email' name='email' required tabIndex={102} ref={emailRef} />
						<Box>
							<Button type='submit' variant='contained'>
								Submit
							</Button>
						</Box>
					</Stack>
				</form>
			</Modal>
		</>
	);
};

export default ContactInfo;
