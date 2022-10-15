import Wave from '@foobar404/wave';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/styles';
import config from 'config.json';
import { useRoundware, useRoundwareDraft } from 'hooks';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { IAudioData } from 'roundware-web-framework/dist/types';
import { ITextAsset } from 'types';
import { wait } from 'utils';
const visualizerOptions = {
	type: 'bars',
};
const useCreateRecording = () => {
	const draftRecording = useRoundwareDraft();
	const { roundware, tagLookup, updateAssets, selectAsset, resetFilters } = useRoundware();
	let [wave, set_wave] = useState(new Wave());
	const [isRecording, set_is_recording] = useState(false);
	const [draftRecordingMedia, set_draft_recording_media] = useState<IAudioData | null>(null);
	const [draftMediaUrl, set_draft_media_url] = useState('');
	const [recorder, set_recorder] = useState<MediaRecorder | undefined>();
	const [stream, set_stream] = useState<MediaStream | undefined>();
	const [textAsset, setTextAsset] = useState<ITextAsset>('');
	const [imageAssets, setImageAssets] = useState<File[]>([]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [legalModalOpen, setLegalModalOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [success, setSuccess] = useState<{ detail: string; envelope_ids: number[] } | null>(null);
	const history = useHistory();

	const theme = useTheme();
	const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const startRecording = () => {
		if (!navigator.mediaDevices) {
			setError({
				name: `Microphone not accessible`,
				message: "We can't get access to your microphone at this time",
			});
			return;
		} else {
			setError(null);
		}
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				set_draft_recording_media(null);
				set_stream(stream);
				roundware.events?.logEvent(`start_record`);
				wave.stopStream();
				const newWave = new Wave();
				set_wave(newWave);
				newWave.fromStream(stream, 'audio-visualizer', visualizerOptions, false);
				const recorder: MediaRecorder = new MediaRecorder(stream);
				set_recorder(recorder);
				// Set record to <audio> when recording will be finished
				recorder.addEventListener('dataavailable', (e) => {
					console.log('data available: ' + e.data.size);
					set_draft_recording_media(e.data);
				});
				recorder.start();
				set_is_recording(true);
			})
			.catch((err) => {
				setError(err);
			});
	};

	useEffect(() => {
		const mediaUrl = draftRecordingMedia ? URL.createObjectURL(draftRecordingMedia) : '';
		set_draft_media_url(mediaUrl);
	}, [draftRecordingMedia]);

	useEffect(() => {
		if (draftMediaUrl !== '') {
			wave.fromElement('draft-audio', 'audio-visualizer', visualizerOptions);
		}
	}, [draftMediaUrl]);

	const stopRecording = () => {
		roundware.events?.logEvent(`end_record`);
		if (typeof recorder !== 'undefined') {
			recorder.stop();
		}
		if (stream)
			stream.getTracks().forEach((track) => {
				track.stop();
			});
		wait(100).then(() => wave.stopStream());
		set_is_recording(false);
	};

	const deleteRecording = () => {
		set_draft_recording_media(null);
		set_draft_media_url('');
	};
	const toggleRecording = () => {
		if (isRecording) {
			stopRecording();
		} else {
			startRecording();
		}
	};

	useEffect(() => {
		const hasLocation = draftRecording.location.latitude && draftRecording.location.longitude;
		if (!hasLocation) {
			history.replace('/speak/location/');
		}
		const hasTags = draftRecording.tags.length > 0;

		if (!hasTags && config.ALLOW_SPEAK_TAGS !== false) {
			history.replace('/speak/tags/0');
		}
	}, [draftRecording.tags, draftRecording.location.latitude, draftRecording.location.longitude]);

	const selected_tags = draftRecording.tags.map((tag) => tagLookup[tag]);

	const maxRecordingLength = roundware.project ? (roundware.project.maxRecordingLength ? roundware.project.maxRecordingLength : '--') : '--';

	// nodejs.Timeout state
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		let timeout: NodeJS.Timeout | null = null;
		if (success != null && config.autoResetTimeSeconds > 0) {
			timeout = setTimeout(() => {
				draftRecording.reset();
				history.push('/speak/tags/0');
			}, config.autoResetTimeSeconds * 1000);

			setTimer(timeout);
		}
		return () => {
			if (timeout) clearTimeout(timeout);
		};
	}, [success]);

	// increment progress to reach 100 after autoResetTimeSeconds
	useEffect(() => {
		if (success != null && config.autoResetTimeSeconds > 0) {
			const interval = setInterval(() => {
				setProgress((prevProgress) => (prevProgress >= 100 ? 100 : prevProgress + 10 / config.autoResetTimeSeconds));
			}, 100);
			return () => {
				clearInterval(interval);
			};
		}
	}, [success]);

	return {
		draftMediaUrl,
		success,
		selected_tags,
		error,
		isRecording,
		toggleRecording,
		isExtraSmallScreen,
		setError,
		maxRecordingLength,
		stopRecording,
		setDeleteModalOpen,
		deleteModalOpen,
		setTextAsset,
		setImageAssets,
		setLegalModalOpen,
		legalModalOpen,
		deleteRecording,
		setSaving,
		draftRecording,
		textAsset,
		imageAssets,
		roundware,
		selectAsset,
		setSuccess,
		updateAssets,
		draftRecordingMedia,
		saving,
		resetFilters,
		history,
		set_draft_media_url,
		set_draft_recording_media,
		timer,
		setTimer,
		progress,
	};
};

export default useCreateRecording;
