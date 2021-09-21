//the createMuiTheme function was renamed to createTheme.
import { createTheme, makeStyles, adaptV4Theme } from '@mui/material/styles';

export const defaultTheme = createTheme(adaptV4Theme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#719EE3',
		},
	},
}));

export const lightTheme = createTheme(adaptV4Theme({
	palette: {
		mode: 'light',
		primary: {
			main: '#159095',
		},
	},
}));

export const useDefaultStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		display: 'flex',
	},
}));
