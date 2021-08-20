import 'core-js/stable';
import 'regenerator-runtime/runtime';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

import { App } from './components/App';

import dotenv from 'dotenv';
dotenv.config();

import RoundwareProvider from './providers/RoundwareProvider';
import UiConfigProvider from './providers/UIConfigProvider';

const mountNode = document.getElementById('app');
ReactDOM.render(
	<RoundwareProvider>
		<UiConfigProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</UiConfigProvider>
	</RoundwareProvider>,
	mountNode
);
