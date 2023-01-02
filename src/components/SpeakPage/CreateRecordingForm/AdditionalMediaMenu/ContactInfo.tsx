import { Email } from '@mui/icons-material';
import Check from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { Box, DialogContent, ListItemIcon, ListItemText, MenuItem, Stack, TextField } from '@mui/material';
import Modal from 'components/elements/Modal';
import { useRoundwareDraft } from 'hooks';
import { useRef, useState } from 'react';

type Props = {};

const ContactInfo = (props: Props) => {
	const [open, setOpen] = useState(false);

	const firstNameRef = useRef<HTMLInputElement>(null);
	const lastNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);

	const { setUser, user } = useRoundwareDraft();

	return (
		<>
			<MenuItem onClick={() => setOpen(true)} tabIndex={-1}>
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
					<Stack spacing={2} minWidth='250px'>
						<TextField
							label='First Name'
							onKeyDown={(e) => {
								if (e.key === 'Tab') {
									e.preventDefault();
									lastNameRef.current?.focus();
								}
							}}
							name='first_name'
							required
							autoFocus
							defaultValue={user?.first_name}
							inputRef={firstNameRef}
						/>
						<TextField
							onKeyDown={(e) => {
								console.log(e.key);
								if (e.key === 'Tab') {
									e.preventDefault();
									emailRef.current?.focus();
								}
							}}
							label='Last Name'
							name='last_name'
							required
							defaultValue={user?.last_name}
							inputRef={lastNameRef}
						/>
						<TextField label='Email' defaultValue={user?.email} type='email' name='email' tabIndex={4} required inputRef={emailRef} />
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
