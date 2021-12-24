import makeStyles from '@mui/styles/makeStyles';
import PhotoIcon from '@mui/icons-material/Photo';
export const useStyles = makeStyles((theme) => {
	return {
		container: {
			overflowX: 'hidden',
			padding: theme.spacing(2),
			marginBottom: 70,
		},
		iconButtonLabel: {
			display: 'flex',
			flexDirection: 'column',
		},
		iconButton: {
			height: 150,
			width: 150,
			[theme.breakpoints.down('sm')]: {
				height: 100,
				width: 100,
			},
		},
		iconButtonSmall: {
			height: 50,
			width: 50,
			[theme.breakpoints.down('sm')]: {
				height: 30,
				width: 30,
			},
		},
		audioVisualizer: {
			backgroundColor: '#333',
			padding: '0 !important',
			height: 150,
			width: 300,
			[theme.breakpoints.down('sm')]: {
				height: 150,
			},
			[theme.breakpoints.down(undefined)]: {
				height: 100,
			},
		},
		label: {
			paddingTop: 0,
		},
		tagGroupHeaderLabel: {
			marginTop: theme.spacing(2),
			fontSize: '2rem',
			[theme.breakpoints.down('md')]: {
				fontSize: '1.2rem',
			},
		},
	};
});

export const useStylesAudioPlayer = makeStyles((theme) => {
	return {
		root: {
			width: 700,
			[theme.breakpoints.down('md')]: {
				width: 500,
			},
			[theme.breakpoints.down('sm')]: {
				width: '90vw',
			},
		},
		playIcon: {
			//color: '#f50057',
			height: 75,
			width: 75,
			'&:hover': {
				//color: '#ff4081'
			},
		},
		pauseIcon: {
			height: 75,
			width: 75,
		},
		replayIcon: {
			height: 75,
			width: 75,
		},
		progressTime: {
			fontSize: '2em',
		},
		mainSlider: {
			//color: '#3f51b5',
			'& .MuiSlider-rail': {
				//color: '#7986cb',
				marginTop: 4,
			},
			'& .MuiSlider-track': {
				//color: '#3f51b5',
				marginTop: 4,
			},
			'& .MuiSlider-thumb': {
				//color: '#303f9f'
				height: 20,
				width: 20,
			},
		},
	};
});
