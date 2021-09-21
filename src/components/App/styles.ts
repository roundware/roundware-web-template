import { makeStyles } from '@mui/material';
import { defaultTheme } from '../../styles';

const useStyles = makeStyles((theme) => {
	return {
		topBar: {
			backgroundColor: defaultTheme.palette.primary.main,
		},
		bottomBar: {
			top: 'auto',
			bottom: 0,
			flexFlow: 'row',
			backgroundColor: defaultTheme.palette.grey[900],
		},
		actionButton: {
			margin: 'auto',
		},
		appContainer: {
			display: 'flex',
			flexGrow: 1,
		},
		title: {
			flexGrow: 1,
			color: 'white',
			textDecoration: 'none',
		},
		navLogo: {
			height: parseInt(typeof process.env.NAV_LOGO_HEIGHT == 'string' ? process.env.NAV_LOGO_HEIGHT : '34'),
		},
	};
});
export default useStyles;
