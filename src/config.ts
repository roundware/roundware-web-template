import configJSON from 'config.json';
import { IConfig } from 'configTypes';
import { merge } from 'lodash';

// this config object can be overridden by config.json
// Refer the type object below for info and comments on each config option
let config: IConfig = {
	locale: 'es',
	debugMode: false,

	project: {
		apiUrl: 'https://dev.roundware.com/api/2',
		serverUrl: 'https://dev.roundware.com/',
		id: 1,
		initialLocation: {
			latitude: 21.1458,
			longitude: 79.0882,
		},
	},

	listen: {
		availableListenModes: 'device',
		keepPausedAssets: true,
		geoListenMode: 'device',
		autoplay: false,
		speaker: {
			sync: true,
			prefetch: false,
			loop: true,
			acceptableDelayMs: 50,
			syncCheckInterval: 2500,
		},
	},

	speak: {
		allowPhotos: true,
		allowText: true,
		allowSpeakTags: true,
		defaultSpeakTags: [],
	},

	map: {
		infoWindowItems: {
			available: ['date', 'tags', 'description', 'audio', 'photo', 'text', 'actions'],
			actionItems: ['like', 'flag', 'show'],
		},

		zoom: {
			high: 17,
			low: 15,
			walking: 22,
		},
		speakerDisplay: 'images',
		speakerPolygonColors: ['#044389', '#FCFF4B', '#FFAD05', '#7CAFC4', '#63A375', '#EF27A6'],
		useListenMapBounds: true,
		showBoundsMarkers: false,
		bounds: 'none',
		boundsPoints: {
			swLat: 3,
			swLng: 5,
			neLat: 5,
			neLng: 43,
		},
	},

	ui: {
		navLogoHeight: 34,
		listenSidebar: {
			defaultOpen: true,
			active: true,
			filter: {
				active: false,
				available: ['date', 'tags', 'description'],
			},
			history: {
				active: true,
				available: {
					available: ['date', 'description', 'photo', 'text', 'audio', 'actions'],
					actionItems: ['show'],
				},
				infoCardDefaultCollapsed: false,
			},
		},
	},

	features: {
		autoConcludeDuration: 992,
		concludeDuration: 2,
		surveyLink: 'https://forms.gle/nMfJNPozSW1KFddu7',
		autoResetTimeSeconds: 0,

		speakerToggleIds: [18, 19],
	},
};

// override the default config
// with values from a config.json file
let finalConfig: IConfig;
if (configJSON) {
	finalConfig = merge(config, configJSON);
} else finalConfig = config;

export default finalConfig;
