import { useRef, useState } from 'react';
import { useLoop } from './useLoop';
import { createBlobFromAudioBuffer, trimAudioBuffer } from '@/utils/index';

export const useRecorder = ({ duration, loop }: { duration?: number; loop: ReturnType<typeof useLoop> }) => {
	const mediaRecorder = useRef<MediaRecorder | null>(null);

	const audioChunk = useRef<Blob>();

	const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

	const [isPermissionDenied, setIsPermissionDenied] = useState(false);

	const [recorderStream, setRecorderStream] = useState<MediaStream>();

	// just for checking permission start a small recording and stop it
	const checkMicrophonePermission = async () => {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
					autoGainControl: false,
				},
			});
			stream.getTracks().forEach((track) => {
				track.stop();
				console.debug(track.readyState);
			});

			return true;
		} catch (error) {
			console.error('Microphone permission denied:', error);
			setIsPermissionDenied(true);
			return false;
		}
	};

	// schedule recording to start from next loop point in timer
	const scheduleRecording = async () => {
		const hasPermission = await checkMicrophonePermission();
		if (!hasPermission) return;
		if (typeof duration !== 'number') return;

		loop.setMode('waiting-to-record');
		setRecordedAudioBlob(null);

		console.debug('Scheduling recording', loop.nextLoopPointAt.current, Date.now());
		console.debug('Starting recording in', ((loop.nextLoopPointAt.current ?? 0) - Date.now()) / 1000 + 's');

		setTimeout(
			() => {
				startRecording();
			},
			loop.nextLoopPointAt.current ? loop.nextLoopPointAt.current - Date.now() : 0
		);
	};

	const startRecording = async () => {
		try {
			setRecordedAudioBlob(null);
			audioChunk.current = undefined;

			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
				},
			});

			setRecorderStream(stream);

			mediaRecorder.current = new MediaRecorder(stream);

			mediaRecorder.current.ondataavailable = async (event) => {
				if (audioChunk.current) return;
				stopRecording();

				audioChunk.current = event.data;

				console.log('Speaker Duration:', duration);

				const audioBuffer = await loop.audioContext.current.decodeAudioData(await new Blob([event.data], { type: 'audio/wav' }).arrayBuffer());

				if (!audioBuffer || !duration) throw new Error('Something went wrong while decoding audio data');

				let adjustedBuffer = audioBuffer;

				if (adjustedBuffer.duration > duration) {
					const difference = adjustedBuffer.duration - duration;
					// 5% from start, rest from end
					adjustedBuffer = trimAudioBuffer(audioBuffer, difference * (10 / 100), audioBuffer.duration - difference * (90 / 100), loop.audioContext.current);
					console.log('Trimmed audio buffer:', adjustedBuffer);
				}

				const audioBlob = createBlobFromAudioBuffer(adjustedBuffer);

				setRecordedAudioBlob(audioBlob);
				loop.stop();
				loop.start('recording-playback', audioBlob);
			};

			mediaRecorder.current.onstop = () => {
				// stop
				stream.getTracks().forEach((track) => {
					track.stop();
				});
			};

			mediaRecorder.current.onstart = () => {
				console.debug('Recording started');

				loop.start('recording');

				if (!duration) return;
			};

			loop.stop();

			console.log('Will be reocording for:', duration);
			mediaRecorder.current.start(duration ? (duration + 0.1) * 1000 : undefined);
		} catch (error) {
			console.error('Error starting recording:', error);
			setIsPermissionDenied(true);
			loop.stop();
		}
	};

	const stopRecording = () => {
		if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
			mediaRecorder.current.stop();
			console.debug('Recording stopped');
		}
	};

	return {
		recordedAudioBlob,
		isPermissionDenied,
		setIsPermissionDenied,
		scheduleRecording,
		stopRecording,
		checkMicrophonePermission,
		recorderStream,
	};
};
