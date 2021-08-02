import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ActionButton from '../ActionButton';
import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useRoundware } from '../../hooks';
import Container from '@material-ui/core/Container';

import banner from '../../assets/rw-icon-cluster.png';

import useStyles from './styles';

export const LandingPage = () => {
	const { roundware } = useRoundware();
	const classes = useStyles();

	if (!roundware._project || roundware._project.projectName === '(unknown)') {
		return null;
	}
	return (
		<Container style={{ paddingRight: 0, paddingLeft: 0 }}>
			<Grid container className={classes.landingHeader}>
				<Grid container justifyContent='center' style={{ height: '100px' }}>
					<Grid item style={{ margin: 'auto', height: '15vh', textAlign: 'center', paddingTop: 15 }} sm={12}>
						{/*<Typography
              variant={"h2"}
              className={classes.landingTitle}
            >
              {roundware._project && roundware._project.projectName}
            </Typography>*/}
						<img src={banner} className={classes.landingBanner} />
					</Grid>
					<Grid item sm={12}>
						<Typography variant={'subtitle1'} className={classes.landingTagline} style={{ textAlign: 'center', height: '15vh' }}>
							Contributory Audio Augmented Reality
							<br />
							for Art, Education and Documentary
						</Typography>
					</Grid>
				</Grid>
				<Grid container justifyContent='center' style={{ height: '200px' }}>
					<Grid item>
						<ActionButton label={'Listen'} linkTo={'/listen'} style={{ width: '100%' }} />
					</Grid>
					<Grid item>
						<ActionButton label={'Speak'} linkTo={'/speak'} />
					</Grid>
				</Grid>
			</Grid>
		</Container>
	);
};
