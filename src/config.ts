const config: IConfig = {
	debugMode: false,

	project: {
		apiUrl: 'https://prod.roundware.com/api/2',
		serverUrl: 'https://prod.roundware.com/',
		id: 1,
		initialLocation: {
			latitude: 40.7128,
			longitude: -74.006,
		},
	},

	listen: {
		availableListenModes: 'device',
		keepPausedAssets: true,
		geoListenMode: 'device',
		autoplay: false,
		speaker: {
			sync: false,
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
		infowindowDisplayItems: ['date', 'tags', 'text', 'description', 'audio'],
		availableListenFilters: ['date', 'description', 'tags'],
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
	},

	features: {
		autoConcludeDuration: 992,
		concludeDuration: 2,
		surveyLink: 'https://forms.gle/nMfJNPozSW1KFddu7',
		autoResetTimeSeconds: 0,
	},
};

export default config;

type IConfig = {
	debugMode: boolean;
	project: {
		apiUrl: string;
		serverUrl: string;
		id: number;
		initialLocation: {
			latitude: number;
			longitude: number;
		};
	};
	listen: {
		availableListenModes: 'device' | ('map' | 'walking')[];
		keepPausedAssets: boolean;
		geoListenMode: 'device' | ('map' | 'walking')[];
		autoplay: boolean;
		speaker: {
			sync: boolean;
			prefetch: boolean;
			loop: boolean;
			acceptableDelayMs: number;
			syncCheckInterval: number;
		};
	};
	speak: {
		allowPhotos: boolean;
		allowText: boolean;
		allowSpeakTags: boolean;
		defaultSpeakTags: number[];
	};
	map: {
		infowindowDisplayItems: ('date' | 'tags' | 'text' | 'description' | 'audio')[];
		availableListenFilters: ('date' | 'description' | 'tags')[];
		zoom: {
			high: number;
			low: number;
			walking: number;
		};
		speakerDisplay: 'images' | 'polygons';
		speakerPolygonColors: string[];
		useListenMapBounds: boolean;
		showBoundsMarkers: boolean;
		bounds: 'none' | 'auto';
		boundsPoints: {
			swLat: number;
			swLng: number;
			neLat: number;
			neLng: number;
		};
	};
	ui: {
		navLogoHeight: number;
	};
	features: {
		autoConcludeDuration: number;
		concludeDuration: number;
		surveyLink: string;
		autoResetTimeSeconds: number;
	};
};
