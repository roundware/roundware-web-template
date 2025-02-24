import { useEffect, useRef, useState } from 'react';

export const useLoop = () => {
	const audioContext = useRef(new AudioContext());

	const [isLoading, setIsLoading] = useState(true);
	const [isStarted, setIsStarted] = useState(false);

	const speakerAudioBuffer = useRef<AudioBuffer | null>(null);
	const speakerSource = useRef<AudioBufferSourceNode | null>(null);
	const recordedAudioSource = useRef<AudioBufferSourceNode | null>(null);

	const [mode, setMode] = useState<'idle' | 'playing-speaker' | 'waiting-to-record' | 'recording' | 'recording-playback'>('idle');

	const interval = useRef<NodeJS.Timer | null>(null);

	const nextLoopPointAt = useRef<number | null>(null);

	const calculateNextPoint = () => {
		if (!speakerAudioBuffer.current) return;
		nextLoopPointAt.current = Date.now() + speakerAudioBuffer.current.duration * 1000;
		interval.current = setInterval(() => {
			if (!speakerAudioBuffer.current) return;
			nextLoopPointAt.current = Date.now() + speakerAudioBuffer.current.duration * 1000;
		}, speakerAudioBuffer.current.duration * 1000);
	};

	async function start(newMode?: typeof mode, recordedAudioBlob?: Blob) {
		console.debug('start', newMode, recordedAudioBlob);
		if (newMode) {
			setMode('idle');
			setTimeout(() => {
				setMode(newMode);
			}, 10);
		}
		if (isLoading || !speakerAudioBuffer.current) return;

		await audioContext.current.resume();

		console.debug('Starting loop');
		setIsStarted(true);

		speakerSource.current = audioContext.current.createBufferSource();
		speakerSource.current.buffer = speakerAudioBuffer.current;
		const speakerGain = audioContext.current.createGain();

		// speaker gain to 0.5 if there is a recorded audio blob
		speakerGain.gain.value = 0;

		const SPEAKER_VOLUMES: Record<typeof mode, number> = {
			'playing-speaker': 1,
			'waiting-to-record': 1,
			'recording-playback': 0.5,
			recording: 0.5,
			idle: 1,
		};

		const finalSpeakerVolume = SPEAKER_VOLUMES[newMode || mode];
		console.debug('finalSpeakerVolume', finalSpeakerVolume, newMode);
		const fadeDuration = 0.3;

		speakerSource.current.connect(speakerGain);
		speakerGain.connect(audioContext.current.destination);

		speakerSource.current.loop = true;

		if (recordedAudioBlob) {
			console.debug('Starting loop with recordedAudioBlob');
			recordedAudioSource.current = audioContext.current.createBufferSource();
			const blob = await recordedAudioBlob.arrayBuffer();

			audioContext.current.decodeAudioData(blob, (buffer) => {
				if (!recordedAudioSource.current) return;
				if (!speakerAudioBuffer.current) return;

				console.table({
					'speakerAudioBuffer.current.duration': speakerAudioBuffer.current.duration,
					'adjustedBuffer.duration': buffer.duration,
				});

				recordedAudioSource.current.buffer = buffer;
				recordedAudioSource.current.loop = true;

				// gain
				const recorderGain = audioContext.current.createGain();
				recorderGain.gain.value = 0;
				recordedAudioSource.current.connect(recorderGain);
				recorderGain.connect(audioContext.current.destination);

				calculateNextPoint();
				recordedAudioSource.current.start();

				recorderGain.gain.linearRampToValueAtTime(finalSpeakerVolume, audioContext.current.currentTime + fadeDuration);

				if (!speakerSource.current) return;
				speakerSource.current.start();

				setMode('recording-playback');
			});
		} else {
			recordedAudioSource.current = null;
			calculateNextPoint();
			speakerSource.current.start();
			console.debug('speakerSource.current.start()');
		}

		speakerGain.gain.linearRampToValueAtTime(finalSpeakerVolume, audioContext.current.currentTime + fadeDuration);
	}

	function stop() {
		if (interval.current) {
			clearInterval(interval.current);
		}
		if (speakerSource.current) {
			speakerSource.current.stop();
			speakerSource.current.disconnect();
		}
		if (recordedAudioSource.current) {
			recordedAudioSource.current.stop();
			recordedAudioSource.current.disconnect();
			recordedAudioSource.current = null;
		}
	}

	useEffect(() => {
		return () => {
			stop();
		};
	}, []);

	return {
		isLoading,
		setIsLoading,
		isStarted,
		mode,
		setMode,
		start,
		stop,
		nextLoopPointAt,
		speakerAudioBuffer,
		audioContext,
	};
};
