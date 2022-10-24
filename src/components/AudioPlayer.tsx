import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton, LinearProgress } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { WaveForm, WaveSurfer } from 'wavesurfer-react';
import { WaveSurferProps, WaveSurferRef } from 'wavesurfer-react/dist/containers/WaveSurfer';
// @ts-ignore
import RegionsPlugin from 'wavesurfer.js/dist/plugin/wavesurfer.regions';

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

	const wavesurferRef = React.useRef<WaveSurferRef>();

	const handleMount: WaveSurferProps[`onMount`] = React.useCallback(
		(waveSurfer: any) => {
			wavesurferRef.current = waveSurfer;
			if (wavesurferRef.current) {
				if (src) {
					wavesurferRef.current.load(src);
				}

				wavesurferRef.current.on('ready', () => {
					setLoading(false);
				});

				wavesurferRef.current.on('loading', (n: number) => {
					setProgress(n);
				});
			}
		},
		[src]
	);

	const [playing, setPlaying] = useState(false);
	const handlePlay = () => {
		if (playing) {
			setPlaying(false);
			return wavesurferRef.current?.pause();
		}
		wavesurferRef.current?.play();
		setPlaying(true);
	};

	useEffect(() => {
		return () => {
			wavesurferRef.current?.destroy();
		};
	}, []);

	if (!src) return null;
	return (
		<div style={{ width: size === 'small' ? '280px' : '360px', minHeight: 160 }}>
			<WaveSurfer plugins={plugins} onMount={handleMount}>
				<WaveForm
					id={'audio-player'}
					fillParent={true}
					mediaControls={true}
					height={size === 'small' ? 64 : 128}
					waveColor='purple'
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
