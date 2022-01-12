import { makeStyles } from '@mui/styles';
import config from 'config.json';
import { defaultTheme } from '../../styles';

const useStyles = makeStyles(() => {
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
			height: config.NAV_LOGO_HEIGHT || 34,
		},
	};
});
export default useStyles;
