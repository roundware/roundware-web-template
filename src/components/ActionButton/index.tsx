import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useStyles } from './styles';

interface Props {
	label: string;
	linkTo: string;
}

const ActionButton = ({ label, linkTo }: Props) => {
	const classes = useStyles();
	const history = useHistory();

	return (
		<Grid container direction={'column'}>
			<Grid item sm={9} md={6}>
				<Button
					aria-label={label}
					className={classes.actionButton}
					variant='contained'
					color='primary'
					onClick={() => {
						history.push(linkTo);
					}}
				>
					<Typography variant={'h3'} className={classes.buttonLabel}>
						{label}
					</Typography>
				</Button>
			</Grid>
		</Grid>
	);
};

export default ActionButton;
