import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';

interface Props {
	label: string;
	linkTo: string;
	style?: React.CSSProperties;
	onClick?: () => void;
}

const ActionButton = ({ label, linkTo, style = {}, onClick }: Props) => {
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
						if (onClick instanceof Function) {
							onClick?.();
						}
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

export const useStyles = makeStyles((theme: { spacing: (arg0: number) => any; breakpoints: { down: (arg0: string) => any } }) => {
	return {
		actionButton: {
			margin: theme.spacing(2),
			width: 300,
			// padding: 50
			height: 100,
			[theme.breakpoints.down('md')]: {
				width: 250,
				height: 75,
			},
		},
		buttonLabel: {
			margin: theme.spacing(2),
			[theme.breakpoints.down('md')]: {
				fontSize: '2rem',
			},
		},
	};
});
