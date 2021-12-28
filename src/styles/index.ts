//the createMuiTheme function was renamed to createTheme.
import { createTheme } from '@mui/material/styles';
import { makeStyles } from '@mui/styles';
export const defaultTheme = createTheme({
	palette: {
		mode: 'dark',
		primary: {
			main: '#719EE3',
		},
	},
	components: {
		MuiButton: {
			styleOverrides: {
				textPrimary: {
					color: '#ffffff !important',
				},
			},
		},
	},
});

export const lightTheme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#159095',
		},
	},
});

export const useDefaultStyles = makeStyles(() => ({
	root: {
		height: '100vh',
		display: 'flex',
	},
}));
