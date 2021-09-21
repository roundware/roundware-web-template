import 'core-js/stable';
import 'regenerator-runtime/runtime';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

import { App } from './components/App';

import Providers from './providers/Providers';

const mountNode = document.getElementById('app');
ReactDOM.render(
	<Providers>
		<App />
	</Providers>,
	mountNode
);
