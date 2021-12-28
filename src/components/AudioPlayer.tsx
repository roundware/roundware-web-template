import React, { useState, useEffect } from 'react';
import { WaveSurfer, WaveForm, Region } from 'wavesurfer-react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions';
import { IconButton, Grid, LinearProgress, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const plugins = [
	{
		plugin: RegionsPlugin,
		options: { dragSelection: false },
	},
];

interface PropTypes {
	src: string;
	size?: 'small' | 'medium' | 'large';
}

const AudioPlayer = ({ size = 'small', src }: PropTypes): JSX.Element | null => {
	const [loading, setLoading] = useState(true);

	const [progress, setProgress] = useState(0);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const wavesurferRef = React.useRef<any>();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const handleMount = React.useCallback(
		(waveSurfer: any) => {
			wavesurferRef.current = waveSurfer;
			if (wavesurferRef.current) {
				if (src) {
					wavesurferRef.current.load(src);
				}

				// wavesurferRef.current.on("region-created", regionCreatedHandler);

				wavesurferRef.current.on('ready', () => {
					setLoading(false);
				});

				wavesurferRef.current.on('loading', (n: number) => {
					setProgress(n);
				});

				// wavesurferRef.current.on("region-removed", (region) => {
				//   console.log("region-removed --> ", region);
				// });

				// wavesurferRef.current.on("loading", (data) => {
				//   console.log("loading --> ", data);
				// });
			}
		},
		[src]
	);

	const [playing, setPlaying] = useState(false);
	const handlePlay = () => {
		if (playing) {
			setPlaying(false);
			return wavesurferRef.current.pause();
		}
		wavesurferRef.current.play();
		setPlaying(true);
	};

	if (!src) return null;
	return (
		<div style={{ width: size === 'small' ? '280px' : '360px', minHeight: 160 }}>
			<WaveSurfer plugins={plugins} onMount={handleMount}>
				<WaveForm
					id={'audio-player'}
					fillParent={true}
					mediaControls={true}
					height={size === 'small' ? 64 : 128}
					// maxCanvasWidth={size === "small" ? 4000 : 6000}
				></WaveForm>
			</WaveSurfer>
			<Box display='flex' justifyContent='center' alignItems='center'>
				{loading ? (
					<LinearProgress variant='determinate' style={{ flexGrow: 1 }} value={progress} />
				) : (
					<>
						<IconButton onClick={handlePlay} size={size}>
							{playing ? <PauseIcon fontSize={size} /> : <PlayArrowIcon fontSize={size} />}
						</IconButton>
					</>
				)}
			</Box>
		</div>
	);
};

export default AudioPlayer;
