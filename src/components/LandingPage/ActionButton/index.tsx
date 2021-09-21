import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useStyles } from './styles';

interface Props {
	label: string;
	linkTo: string;
	style?: React.CSSProperties;
}

const ActionButton = ({ label, linkTo, style = {} }: Props) => {
	const classes = useStyles();
	const history = useHistory();

	return (
		<Grid container direction={'column'} style={style}>
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
