import { Email } from '@mui/icons-material';
import Check from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { Box, ListItemIcon, ListItemText, MenuItem, Stack, TextField } from '@mui/material';
import Modal from 'components/elements/Modal';
import { useRoundwareDraft } from 'hooks';
import { useRef, useState } from 'react';

type Props = {};

const ContactInfo = (props: Props) => {
	const [open, setOpen] = useState(false);

	const firstNameRef = useRef<HTMLInputElement>(null);
	const lastNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);

	const { setUser } = useRoundwareDraft();

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

						setUser({
							first_name: firstNameRef.current?.value as string,
							last_name: lastNameRef.current?.value as string,
							email: emailRef.current?.value as string,
						});
						setOpen(false);
					}}
				>
					<Stack spacing={2} minWidth='300px'>
						<TextField label='First Name' name='first_name' required autoFocus tabIndex={100} inputRef={firstNameRef} />
						<TextField label='Last Name' name='last_name' required tabIndex={101} inputRef={lastNameRef} />
						<TextField label='Email' type='email' name='email' required tabIndex={102} inputRef={emailRef} />
						<Box>
							<LoadingButton startIcon={<Check />} type='submit' variant='contained'>
								OK
							</LoadingButton>
						</Box>
					</Stack>
				</form>
			</Modal>
		</>
	);
};

export default ContactInfo;
