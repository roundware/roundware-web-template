import { useMediaQuery, Grid } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import React, { useEffect, useState } from 'react';
import ReactGA from 'react-ga4';
import Helmet from 'react-helmet';
import { NavLink, Route, Switch, useLocation, Link, BrowserRouter } from 'react-router-dom';
import favicon from '../../assets/favicon.png';
import logoSmall from '../../assets/rw-full-logo-wb.png';
import logoMinimal from '../../assets/rw-logo-minimal.png';
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
import config from 'config.json';
import UserConfirmation from '../UserConfirmation';
import ShareButton from './ShareButton';
import ShareDialog from './ShareDialog';
import { getMessageOnLoad } from 'utils/platformMessages';
import PlatformMessage from 'components/PlatformMessage';

export const App = () => {
	const [theme] = useState(defaultTheme);
	const classes = useStyles();
	const { roundware } = useRoundware();
	const isExtraSmallScreen = useMediaQuery<boolean>(theme.breakpoints.down('xs'));

	let location = useLocation();

	useEffect(() => {
		if (!process.env.REACT_APP_GOOGLE_ANALYTICS_ID) return;

		ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
		ReactGA.send({
			hitType: 'pageView',
			page: window.location.pathname + window.location.search,
		});
	}, [location.pathname]);

	return (
		<>
			<BrowserRouter getUserConfirmation={(message, callback) => UserConfirmation(message, callback)}>
				<CssBaseline />

				<Helmet>
					<meta charSet='utf-8' />
					<title>{roundware.project ? roundware.project.projectName : ''}</title>
					<link rel='icon' type='image/png' href={favicon} sizes='16x16' />
					<meta name='theme-color' content={theme.palette.primary.main} />
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
				<PlatformMessage getMessage={getMessageOnLoad} />
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
					<Toolbar style={{ width: '100%', justifyContent: 'space-between' }}>
						<Stack spacing={1} direction='row'>
							<ShareButton />
							<Route path='/listen'>
								{roundware?.project?.data?.speak_enabled && (
									<Link to={`/speak`}>
										<SpeakButton />
									</Link>
								)}
							</Route>
						</Stack>
						<div>
							<Route path='/listen'>
								<ListenFilterDrawer />
								<RoundwareMixerControl />
							</Route>
						</div>

						{config.DEBUG_MODE === true ? <div style={{ color: 'white' }}>mixer: {roundware.mixer && JSON.stringify(roundware.mixer.mixParams)}</div> : null}
						<div>
							<InfoPopup />
						</div>
					</Toolbar>
					<Switch>
						<Route path='/listen' exact component={() => <React.Fragment></React.Fragment>} />
						<Route path='/' component={ShareDialog} />
					</Switch>
				</AppBar>
			</BrowserRouter>
		</>
	);
};
