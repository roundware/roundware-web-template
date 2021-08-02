import { makeStyles } from '@material-ui/core';
// @ts-ignore
import landingHeaderImage from '../../assets/bg-about.jpg';
const useStyles = makeStyles((theme) => {
	return {
		topBar: {
			backgroundColor: theme.palette.grey[900],
		},
		bottomBar: {
			top: 'auto',
			bottom: 0,
		},
		actionButton: {
			margin: 'auto',
		},
		root: {
			margin: theme.spacing(2),
		},
		landingHeader: {
			backgroundImage: `linear-gradient(180deg, #000000ff, #ffffff00), url(${landingHeaderImage})`,
			backgroundSize: 'cover',
			height: '100%',
			backgroundPosition: 'center',
		},
		landingTitle: {
			fontSize: '6em',
			[theme.breakpoints.down('md')]: {
				fontSize: '4em',
			},
			[theme.breakpoints.down('sm')]: {
				fontSize: '3em',
			},
		},
		landingTagline: {
			textAlign: 'center',
			height: '15vh',
			paddingTop: 15,
			[theme.breakpoints.down('xs')]: {
				lineHeight: '1.2em',
			},
		},
		landingBanner: {
			width: 'auto',
			height: 100,
			[theme.breakpoints.down('xs')]: {
				width: '70%',
				height: 'auto',
			},
		},
	};
});

export default useStyles;
