import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import Helmet from 'react-helmet';
import { NavLink, Route, Switch, useLocation, Link } from 'react-router-dom';
import favicon from 'url:../../assets/favicon.png';
import logoSmall from 'url:../../assets/rw-full-logo-wb.png';
import logoMinimal from 'url:../../assets/rw-logo-minimal.png';
import { useRoundware } from '../../hooks';
import { defaultTheme } from '../../styles';
import DebugPage from '../DebugPage';
import InfoPopup from '../InfoPopup';
import { LandingPage } from '../LandingPage';
import ListenPage from '../ListenPage';
import ListenFilterDrawer from '../ListenPage/ListenFilterDrawer';
import RoundwareMixerControl from '../ListenPage/RoundwareMixerControl';
import SpeakPage from '../SpeakPage';
import SpeakButton from './SpeakButton';
import useStyles from './styles';

if (typeof process.env.GOOGLE_ANALYTICS_ID !== 'undefined' && process.env.GOOGLE_ANALYTICS_ID !== 'null' && typeof process.env.GOOGLE_ANALYTICS_ID == 'string') {
	ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID);
	ReactGA.pageview(window.location.pathname + window.location.search);
}

export const App = () => {
	const [theme] = useState(defaultTheme);
	const classes = useStyles();
	const { roundware } = useRoundware();
	const isExtraSmallScreen = useMediaQuery<boolean>(theme.breakpoints.down('xs'));

	if (process.env.GOOGLE_ANALYTICS_ID !== 'null') {
		let location = useLocation();

		useEffect(() => {
			ReactGA.pageview(window.location.pathname + window.location.search);
		}, [location.pathname]);
	}

	return (
		<>
			<CssBaseline />
			<Helmet>
				<meta charSet='utf-8' />
				<title>{roundware.project ? roundware.project.projectName : ''}</title>
				<link rel='icon' type='image/png' href={favicon} sizes='16x16' />
			</Helmet>

			<AppBar className={classes.topBar} position='fixed'>
				<Toolbar className={classes.topBar}>
					<Typography variant='h6' className={classes.title}>
						<NavLink to='/' className={classes.title}>
							{roundware.project ? roundware.project.projectName : ''}
						</NavLink>
					</Typography>
					<NavLink to='/'>
						<img src={isExtraSmallScreen ? logoMinimal : logoSmall} className={classes.navLogo} />
					</NavLink>
				</Toolbar>
			</AppBar>
			<Toolbar />
			<div className={classes.appContainer}>
				<Switch>
					<Route exact path='/' component={LandingPage} />
					<Route path='/listen' component={ListenPage} />
					<Route path='/speak' component={SpeakPage} />
					<Route path='/debug' component={DebugPage} />
				</Switch>
			</div>
			<AppBar position='sticky' className={classes.bottomBar}>
				<Toolbar style={{ width: '100%', justifyContent: 'center' }}>
					<Route path='/listen'>
						<Link to={`/speak`}>
							<SpeakButton />
						</Link>
						<ListenFilterDrawer />
						<RoundwareMixerControl />
					</Route>
					{process.env.DEBUG_MODE === 'true' ? <div style={{ color: 'white' }}>mixer: {roundware.mixer && JSON.stringify(roundware.mixer.mixParams)}</div> : null}
					<InfoPopup />
				</Toolbar>
			</AppBar>
		</>
	);
};
