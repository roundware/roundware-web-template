import config from '@/config';
import { GeoListenMode } from 'roundware-web-framework/dist/index';

export const wait = <PromiseType>(delay: number, value?: any): Promise<PromiseType> => new Promise((resolve) => setTimeout(resolve, delay, value));

/** gets google map paths from geojson polygon
 * (from roundware-react-admin) */
export const polygonToGoogleMapPaths = (polygon: { type: string; coordinates: number[][][] | number[][][][] }) => {
	let coordinates: number[][] = [];
	// @ts-ignore
	if (polygon.type == 'MultiPolygon') coordinates = polygon.coordinates[0][0];
	// @ts-ignore
	else if (polygon.type == 'Polygon') coordinates = polygon.coordinates[0];
	return coordinates?.map((p) => new window.google.maps.LatLng(p[1], p[0]));
};
function getWidth() {
	return Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.body.offsetWidth, document.documentElement.offsetWidth, document.documentElement.clientWidth);
}

export const getDefaultListenMode = () => {
	const isMobile = getWidth() < 600;

	if (config.listen.geoListenMode == 'device') {
		return isMobile ? GeoListenMode.AUTOMATIC : GeoListenMode.MANUAL;
	}
	const listenMode = (config.listen.geoListenMode || ['map', 'walking'])[0];
	if (listenMode == 'map') return GeoListenMode.MANUAL;
	return GeoListenMode.AUTOMATIC;
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
export function getRandomArbitrary(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

export function trimAudioBuffer(buffer: AudioBuffer, startTime: number, endTime: number, audioContext: AudioContext = new AudioContext()) {
	const sampleRate = buffer.sampleRate;
	const startFrame = startTime * sampleRate;
	const endFrame = endTime * sampleRate;

	const channels = buffer.numberOfChannels;

	// Create a new AudioBuffer for the trimmed audio
	const trimmedBuffer = audioContext.createBuffer(channels, endFrame - startFrame, sampleRate);
	console.log('Start Frame:', startFrame, 'End Frame:', endFrame, 'Duration:', 'Total Frames:', buffer.length, 'Trimmed Frames:', endFrame - startFrame);
	for (let channel = 0; channel < channels; channel++) {
		const sourceData = buffer.getChannelData(channel).subarray(startFrame, endFrame);
		trimmedBuffer.getChannelData(channel).set(sourceData);
	}

	return trimmedBuffer;
}

export function createBlobFromAudioBuffer(audioBuffer: AudioBuffer) {
	// Float32Array samples
	const interleaved = audioBuffer.getChannelData(0);

	// get WAV file bytes and audio params of your audio source
	const wavBytes = getWavBytes(interleaved.buffer, {
		isFloat: true, // floating point or 16-bit integer
		numChannels: 1,
		sampleRate: audioBuffer.sampleRate,
	});
	const wav = new Blob([wavBytes], { type: 'audio/wav' });
	return wav;
}

// Returns Uint8Array of WAV bytes
function getWavBytes(
	buffer: ArrayBufferLike,
	options: {
		isFloat: boolean;
		numChannels: number;
		sampleRate: number;
		numFrames?: number;
	}
) {
	const type = options.isFloat ? Float32Array : Uint16Array;
	const numFrames = buffer.byteLength / type.BYTES_PER_ELEMENT;

	const headerBytes = getWavHeader(Object.assign({}, options, { numFrames }));
	const wavBytes = new Uint8Array(headerBytes.length + buffer.byteLength);

	// prepend header, then add pcmBytes
	wavBytes.set(headerBytes, 0);
	wavBytes.set(new Uint8Array(buffer), headerBytes.length);

	return wavBytes;
}

// adapted from https://gist.github.com/also/900023
// returns Uint8Array of WAV header bytes
function getWavHeader(options: { isFloat: boolean; numChannels: number; sampleRate: number; numFrames: number }) {
	const numFrames = options.numFrames;
	const numChannels = options.numChannels || 2;
	const sampleRate = options.sampleRate || 44100;
	const bytesPerSample = options.isFloat ? 4 : 2;
	const format = options.isFloat ? 3 : 1;

	const blockAlign = numChannels * bytesPerSample;
	const byteRate = sampleRate * blockAlign;
	const dataSize = numFrames * blockAlign;

	const buffer = new ArrayBuffer(44);
	const dv = new DataView(buffer);

	let p = 0;

	function writeString(s: string) {
		for (let i = 0; i < s.length; i++) {
			dv.setUint8(p + i, s.charCodeAt(i));
		}
		p += s.length;
	}

	function writeUint32(d: number) {
		dv.setUint32(p, d, true);
		p += 4;
	}

	function writeUint16(d: number) {
		dv.setUint16(p, d, true);
		p += 2;
	}

	writeString('RIFF'); // ChunkID
	writeUint32(dataSize + 36); // ChunkSize
	writeString('WAVE'); // Format
	writeString('fmt '); // Subchunk1ID
	writeUint32(16); // Subchunk1Size
	writeUint16(format); // AudioFormat https://i.sstatic.net/BuSmb.png
	writeUint16(numChannels); // NumChannels
	writeUint32(sampleRate); // SampleRate
	writeUint32(byteRate); // ByteRate
	writeUint16(blockAlign); // BlockAlign
	writeUint16(bytesPerSample * 8); // BitsPerSample
	writeString('data'); // Subchunk2ID
	writeUint32(dataSize); // Subchunk2Size

	return new Uint8Array(buffer);
}
