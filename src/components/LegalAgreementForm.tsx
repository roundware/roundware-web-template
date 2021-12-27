import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import { ThemeProvider } from '@mui/styles';
import React, { Fragment, useState } from 'react';
import { useRoundware } from '../hooks';
import { lightTheme } from '../styles';

interface LegalAgreementFormProps {
	onAccept: React.MouseEventHandler<HTMLButtonElement>;
	onDecline: React.MouseEventHandler<HTMLButtonElement>;
}

const LegalAgreementForm = ({ onAccept, onDecline }: LegalAgreementFormProps) => {
	const { roundware } = useRoundware();
	const [accepted_agreement, set_accepted_agreement] = useState<boolean>(false);
	if (!roundware.project) {
		return null;
	}
	return (
		<Fragment>
			<DialogTitle>Content Agreement</DialogTitle>
			<DialogContent>
				<Typography variant='body1'>{roundware.project.legalAgreement}</Typography>
				<FormControlLabel
					label={'I AGREE'}
					control={
						<Checkbox
							checked={accepted_agreement === true}
							onChange={(e) => {
								set_accepted_agreement(e.target.checked);
							}}
							sx={(theme) => ({
								color: theme.palette.common.black,
								// '&.Mui-checked': {
								// 	color: theme.pale,
								// },
							})}
						/>
					}
				/>
			</DialogContent>

			<DialogActions>
				<Button variant='contained' color='secondary' onClick={onDecline}>
					Go Back
				</Button>
				<Button variant='contained' color='primary' disabled={!accepted_agreement} onClick={onAccept}>
					Submit
				</Button>
			</DialogActions>
		</Fragment>
	);
};

export default LegalAgreementForm;
