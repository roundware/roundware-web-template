import { CircularProgress, useMediaQuery } from '@material-ui/core';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React, { Suspense, useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import Helmet from 'react-helmet';
import { NavLink, Route, Switch, useLocation } from 'react-router-dom';
import { useRoundware } from '../../hooks';
import { defaultTheme } from '../../styles';
// @ts-ignore
import favicon from '../../assets/favicon.png';
// @ts-ignore
import logoSmall from '../../assets/rw-full-logo-wb.png';
// @ts-ignore
import logoMinimal from '../../assets/rw-logo-minimal.png';
import DebugPage from '../DebugPage';
import InfoPopup from '../InfoPopup';
import { LandingPage } from '../LandingPage';
import ListenFilterDrawer from '../ListenFilterDrawer';
import RoundwareMixerControl from '../RoundwareMixerControl';
import useStyles from './styles';

const ListenPageComponent = React.lazy(() => import('../ListenPage'));
const ListenPage = () => (
	<Suspense fallback={<CircularProgress />}>
		<ListenPageComponent />
	</Suspense>
);
const SpeakPageComponent = React.lazy(() => import('../SpeakPage'));
const SpeakPage = () => (
	<Suspense fallback={<CircularProgress />}>
		<SpeakPageComponent />
	</Suspense>
);

if (process.env.GOOGLE_ANALYTICS_ID !== 'null') {
	ReactGA.initialize(process.env.GOOGLE_ANALYTICS_ID);
	ReactGA.pageview(window.location.pathname + window.location.search);
}

export const App = () => {
	const [theme] = useState(defaultTheme);
	const classes = useStyles();
	const { roundware } = useRoundware();
	const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));

	if (process.env.GOOGLE_ANALYTICS_ID !== 'null') {
		let location = useLocation();

		useEffect(() => {
			ReactGA.pageview(window.location.pathname + window.location.search);
		}, [location.pathname]);
	}

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<Helmet>
				<meta charSet='utf-8' />
				<title>{roundware._project ? roundware._project.projectName : ''}</title>
				<link rel='icon' type='image/png' href={favicon} sizes='16x16' />
			</Helmet>

			<AppBar className={classes.topBar} position='fixed'>
				<Toolbar className={classes.topBar}>
					<Typography variant='h6' className={classes.title}>
						<NavLink to='/' className={classes.title}>
							{roundware._project ? roundware._project.projectName : ''}
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
			<AppBar position='fixed' className={classes.bottomBar}>
				<Toolbar style={{ width: '100%', justifyContent: 'center' }}>
					<Route path='/listen'>
						<ListenFilterDrawer />
						<RoundwareMixerControl />
					</Route>
					{process.env.DEBUG_MODE === 'true' ? <div style={{ color: 'white' }}>mixer: {roundware._mixer && JSON.stringify(roundware._mixer.mixParams)}</div> : null}
					<InfoPopup />
				</Toolbar>
			</AppBar>
		</MuiThemeProvider>
	);
};
