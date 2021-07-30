//the createMuiTheme function was renamed to createTheme.
import { createTheme, makeStyles } from '@material-ui/core/styles';

export const defaultTheme = createTheme({
	palette: {
		type: 'dark',
		primary: {
			main: '#719EE3',
		},
	},
});

export const lightTheme = createTheme({
	palette: {
		type: 'light',
		primary: {
			main: '#159095',
		},
	},
});

export const useDefaultStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		display: 'flex',
	},
}));
