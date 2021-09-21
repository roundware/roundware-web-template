import { ThemeProvider } from '@mui/material';
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import RoundwareProvider from './RoundwareProvider';
import UiConfigProvider from './UIConfigProvider';
import { URLSyncProvider } from './URLProvider';
import { defaultTheme } from '../styles';
interface Props {
	children: React.ReactNode;
}

const Providers = (props: Props) => {
	const [theme] = useState(defaultTheme);
	return (
		<RoundwareProvider>
			<UiConfigProvider>
				<BrowserRouter>
					<URLSyncProvider>
						<ThemeProvider theme={theme}>{props.children}</ThemeProvider>
					</URLSyncProvider>
				</BrowserRouter>
			</UiConfigProvider>
		</RoundwareProvider>
	);
};

export default Providers;
