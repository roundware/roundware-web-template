import { point } from '@turf/helpers';
import finalConfig from '@/config';
import { useRoundware } from '@/hooks/index';
import { useEffect, useState } from 'react';
import { useLoop } from './useLoop';
import { ISpeakerData } from 'roundware-web-framework/dist/types/speaker';
import { VPTrack } from 'roundware-web-framework/dist/speaker/speaker_volume_processor';
import { SpeakerTrack } from 'roundware-web-framework/dist/speaker/speaker_track';

const getSpeakerAudioBuffer = async (uri: string, audioContext: AudioContext) => {
	const response = await fetch(uri);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = await audioContext.decodeAudioData(arrayBuffer);
	return buffer;
};

export const useBaseSpeakerAudio = (
	lat: number,
	lng: number,
	loop: ReturnType<typeof useLoop>
):
	| {
			baseSpeakers: ISpeakerData[];
			duration: number;
			isReady: true;
	  }
	| {
			baseSpeakers: null;
			duration: null;
			isReady: false;
	  } => {
	const { roundware } = useRoundware();

	const [baseSpeakers, setBaseSpeakers] = useState<ISpeakerData[]>([]);

	const [duration, setAudioDuration] = useState<number | null>(null);

	useEffect(() => {
		if (!roundware.speakers) return;

		roundware.mixer.speakerEngine?.initializeSpeakers();

		if (!roundware.mixer.speakerEngine?.speakerTracks) return;

		const listenerPoint = point([lng, lat]);

		roundware.mixer.speakerEngine?.updateParams(false, {
			listenerPoint,
		});

		const sts = roundware.mixer.speakerEngine?.speakerTracks?.filter((st) => {
			return st.outerBoundaryContains(listenerPoint) || st.attenuationShapeContains(listenerPoint);
		});

		let baseSpeakers = (
			finalConfig.speak.baseRecordingLoopSelectionMethod === 'all'
				? sts
				: (() => {
						// map
						return [roundware.mixer.speakerEngine?.volumeProcessor.findRoot(sts as VPTrack[])];
				  })()
		) as SpeakerTrack[];

		(async () => {
			let finalBuffer: AudioBuffer;

			if (baseSpeakers.length > 1) {
				const audioBuffers = await Promise.all(
					baseSpeakers.map(async (st) => ({
						buffer: await getSpeakerAudioBuffer((st as SpeakerTrack).uri, loop.audioContext.current),
						volume: st.volumeByLocation(listenerPoint.geometry),
					}))
				);

				const totalVolume = audioBuffers.reduce((acc, { volume }) => acc + volume, 0);

				// mix the audio buffers based on volume of each speaker
				finalBuffer = audioBuffers.reduce(
					(acc, { buffer, volume }) => {
						const ratio = volume / totalVolume;
						console.debug(`Mixing volume ${volume} buffer with ratio:`, ratio);
						const mixed = mix(acc, buffer, (a: number, b: number) => {
							return a * 1 + b * (ratio as number);
						});
						return mixed;
					},
					// create an empty buffer with the same length and sample rate as the first buffer
					loop.audioContext.current.createBuffer(audioBuffers[0].buffer.numberOfChannels, audioBuffers[0].buffer.length, audioBuffers[0].buffer.sampleRate)
				);
			} else {
				finalBuffer = await getSpeakerAudioBuffer(baseSpeakers[0].uri, loop.audioContext.current);
			}
			loop.speakerAudioBuffer.current = finalBuffer;
			setBaseSpeakers(baseSpeakers.map((s) => s.speakerData));
			loop.setIsLoading(false);
			setAudioDuration(finalBuffer.duration);
		})();
	}, [lat, lng, roundware]);

	if (baseSpeakers.length === 0 || duration == null) {
		return {
			baseSpeakers: null,
			duration: null,
			isReady: false,
		};
	}
	console.debug('baseSpeakers', baseSpeakers);
	return {
		baseSpeakers,
		duration,
		isReady: true,
	};
};

function mix(bufferA: AudioBuffer, bufferB: AudioBuffer, ratio?: number | ((a: number, b: number, i: number, channel: number) => number), offset?: number): AudioBuffer {
	if (ratio == null) ratio = 0.5;
	var fn =
		ratio instanceof Function
			? ratio
			: function (a: number, b: number) {
					return a * (1 - (ratio as number)) + b * (ratio as number);
			  };

	if (offset == null) offset = 0;
	else if (offset < 0) offset += bufferA.length;

	for (var channel = 0; channel < bufferA.numberOfChannels; channel++) {
		var aData = bufferA.getChannelData(channel);
		var bData = bufferB.getChannelData(channel);

		for (var i = offset, j = 0; i < bufferA.length && j < bufferB.length; i++, j++) {
			aData[i] = fn.call(bufferA, aData[i], bData[j], j, channel);
		}
	}

	return bufferA;
}
