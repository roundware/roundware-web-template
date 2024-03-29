declare module '@foobar404/wave';
declare module 'browser-id3-writer';
declare module 'audio-recorder-polyfill' {
	interface MediaRecorderErrorEvent extends Event {
		name: string;
	}

	interface MediaRecorderDataAvailableEvent extends Event {
		data: any;
	}

	interface MediaRecorderEventMap {
		dataavailable: MediaRecorderDataAvailableEvent;
		error: MediaRecorderErrorEvent;
		pause: Event;
		resume: Event;
		start: Event;
		stop: Event;
		warning: MediaRecorderErrorEvent;
	}

	class MediaRecorder extends EventTarget {
		readonly mimeType: string;
		readonly state: 'inactive' | 'recording' | 'paused';
		readonly stream: MediaStream;
		ignoreMutedMedia: boolean;
		videoBitsPerSecond: number;
		audioBitsPerSecond: number;
		ondataavailable: (event: MediaRecorderDataAvailableEvent) => void;
		onerror: (event: MediaRecorderErrorEvent) => void;
		onpause: () => void;
		onresume: () => void;
		onstart: () => void;
		onstop: () => void;
		constructor(stream: MediaStream);
		start(): void;
		stop(): void;
		resume(): void;
		pause(): void;
		isTypeSupported(type: string): boolean;
		requestData(): void;
		addEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
		addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
		removeEventListener<K extends keyof MediaRecorderEventMap>(type: K, listener: (this: MediaStream, ev: MediaRecorderEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
	}
}
// for importing images
declare module '*.jpg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
