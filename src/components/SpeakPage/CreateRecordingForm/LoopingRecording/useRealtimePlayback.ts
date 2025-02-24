import { useEffect, useRef } from 'react';

/*

Vol: 1
Delay: 0
Reverb: 0.5
Threshold: -20
Knee: 20
Ratio: 12
Attack: 10ms
Release: 250ms

*/

const PARAMS = {
	vol: 1,
	delay: 0, // Reduce delay to 0.1 for less echo
	reverb: 0.3, // Lower reverb gain for less intensity
	threshold: -20,
	knee: 20,
	ratio: 12,
	attack: 0.01,
	release: 0.25,
};

export const useRealtimePlayback = ({ audioContext, recordingStream }: { audioContext: AudioContext; recordingStream?: MediaStream }) => {
	// you need to check on the recordingStream every time it changes.
	// also when unmounting,
	// please make sure to stop the playback
	// and clean up the resources
	const convolverNode = useRef<ConvolverNode | null>(null);
	useEffect(() => {
		if (!recordingStream) return;

		// HERE:
		// when recordingStream is available,
		// setup live playback from the stream
		// along with the effects
		let micStream: MediaStreamAudioSourceNode | null = null;
		let gainNode: GainNode | null = null;
		let delayNode: DelayNode | null = null;
		let feedbackGainNode: GainNode | null = null;
		let compressorNode: DynamicsCompressorNode | null = null;
		let reverbGainNode: GainNode | null = null;

		try {
			// Create audio nodes
			micStream = audioContext.createMediaStreamSource(recordingStream);

			gainNode = audioContext.createGain();
			delayNode = audioContext.createDelay();
			feedbackGainNode = audioContext.createGain();
			compressorNode = audioContext.createDynamicsCompressor();
			reverbGainNode = audioContext.createGain();
			convolverNode.current = audioContext.createConvolver();

			// Load an impulse response for reverb
			const bufferSize = audioContext.sampleRate * 2;
			const impulseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
			const impulseData = impulseBuffer.getChannelData(0);
			for (let i = 0; i < bufferSize; i++) {
				impulseData[i] = Math.exp(-i / (bufferSize / 2)) * Math.random() * 2;
			}
			convolverNode.current.buffer = impulseBuffer;

			// Set the parameters from PARAMS
			gainNode.gain.value = Math.min(Math.max(PARAMS.vol, 0.1), 1.0);
			reverbGainNode.gain.value = PARAMS.reverb;
			delayNode.delayTime.value = Math.min(Math.max(PARAMS.delay, 0.1), 0.5);
			feedbackGainNode.gain.value = 0.2; // Lower feedback gain for less echo
			compressorNode.threshold.value = PARAMS.threshold;
			compressorNode.knee.value = PARAMS.knee;
			compressorNode.ratio.value = PARAMS.ratio;
			compressorNode.attack.value = Math.min(Math.max(PARAMS.attack, 0), 1);
			compressorNode.release.value = Math.min(Math.max(PARAMS.release, 0), 1);

			micStream.connect(gainNode).connect(delayNode).connect(feedbackGainNode).connect(compressorNode).connect(audioContext.destination);

			delayNode.connect(feedbackGainNode);
			feedbackGainNode.connect(delayNode);

			// Dry signal goes to the convolver for reverb
			gainNode.connect(convolverNode.current);
			convolverNode.current.connect(reverbGainNode);
			reverbGainNode.connect(audioContext.destination);

			// Dry signal (without reverb) also goes to the output
			gainNode.connect(audioContext.destination);
		} catch (err) {
			console.error('Error setting up audio nodes: ', err);
		}

		// Cleanup resources when unmounting or when recordingStream changes
		return () => {
			// HERE: cleanup the resources / effects / stop the playback
			if (micStream) micStream.disconnect();
			if (gainNode) gainNode.disconnect();
			if (delayNode) delayNode.disconnect();
			if (feedbackGainNode) feedbackGainNode.disconnect();
			if (compressorNode) compressorNode.disconnect();
			if (reverbGainNode) reverbGainNode.disconnect();
			if (convolverNode.current) convolverNode.current.disconnect();
		};
	}, [audioContext, recordingStream?.id]);
};
