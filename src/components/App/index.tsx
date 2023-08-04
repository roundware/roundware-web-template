import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PlatformMessage from 'components/PlatformMessage';
import config from 'config';
import React, { useState } from 'react';
import Helmet from 'react-helmet';
import { BrowserRouter, Link, NavLink, Route, Switch, useLocation } from 'react-router-dom';
import { getMessageOnLoad } from 'utils/platformMessages';
import favicon from '../../assets/favicon.png';
import logoSmall from '../../assets/rw-full-logo-wb.png';
import logoMinimal from '../../assets/rw-logo-minimal.png';
import { useRoundware } from '../../hooks';
import { defaultTheme } from '../../styles';
import DebugPage from '../DebugPage';
import InfoPopup from '../InfoPopup';
import { LandingPage } from '../LandingPage';
import ListenPage from '../ListenPage';
import ListenDrawer from '../ListenPage/ListenDrawer';
import RoundwareMixerControl from '../ListenPage/RoundwareMixerControl';
import SpeakPage from '../SpeakPage';
import UserConfirmation from '../UserConfirmation';
import DrawerSensitiveWrapper from './DrawerSensitiveWrapper';
import ShareButton from './ShareButton';
import ShareDialog from './ShareDialog';
import SpeakButton from './SpeakButton';
import useStyles from './styles';

export const App = () => {
	const [theme] = useState(defaultTheme);
	const classes = useStyles();
	const { roundware } = useRoundware();
	const isExtraSmallScreen = useMediaQuery<boolean>(theme.breakpoints.down('xs'));

	let location = useLocation();

	return (
		<>
			<BrowserRouter getUserConfirmation={(message, callback) => UserConfirmation(message, callback)}>
				<CssBaseline />

				<Helmet>
					<meta charSet='utf-8' />
					<title>{roundware.project ? roundware.project.projectName : ''}</title>
					<link rel='icon' type='image/png' href={favicon} sizes='16x16' />
					<meta name='theme-color' content={theme.palette.primary.main} />

					<script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_GOOGLE_ANALYTICS_ID}`}></script>
					<script>
						{`
						window.dataLayer = window.dataLayer || [];

		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', '${process.env.REACT_APP_GOOGLE_ANALYTICS_ID}');
		  `}
					</script>
				</Helmet>

				<DrawerSensitiveWrapper>
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
									<ListenDrawer />
									<RoundwareMixerControl />
								</Route>
							</div>

							{config.debugMode === true ? <div style={{ color: 'white' }}>mixer: {roundware.mixer && JSON.stringify(roundware.mixer.mixParams)}</div> : null}
							<div>
								<InfoPopup />
							</div>
						</Toolbar>
						<Switch>
							<Route path='/listen' exact component={() => <React.Fragment></React.Fragment>} />
							<Route path='/' component={ShareDialog} />
						</Switch>
					</AppBar>
				</DrawerSensitiveWrapper>
			</BrowserRouter>
		</>
	);
};
