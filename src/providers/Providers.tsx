import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoundwareProvider from './RoundwareProvider';
import UiConfigProvider from './UIConfigProvider';
import { URLSyncProvider } from './URLProvider';
import { defaultTheme } from '../styles';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import NoSleepProvider from './NoSleepProvider';
declare module '@mui/styles/defaultTheme' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface DefaultTheme extends Theme {}
}

interface Props {
	children: React.ReactNode;
}

const Providers = (props: Props) => {
	const [theme] = useState(defaultTheme);
	return (
		<NoSleepProvider>
			<RoundwareProvider>
				<UiConfigProvider>
					<BrowserRouter>
						<URLSyncProvider>
							<StyledEngineProvider injectFirst>
								<ThemeProvider theme={theme}>
									<LocalizationProvider dateAdapter={AdapterDateFns}>{props.children}</LocalizationProvider>
								</ThemeProvider>
							</StyledEngineProvider>
						</URLSyncProvider>
					</BrowserRouter>
				</UiConfigProvider>
			</RoundwareProvider>
		</NoSleepProvider>
	);
};

export default Providers;
