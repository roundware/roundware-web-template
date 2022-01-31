import Wave from '@foobar404/wave';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import { IconButton, useMediaQuery } from '@mui/material';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import MediaRecorder from 'audio-recorder-polyfill';
import React, { useEffect, useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Prompt, useHistory } from 'react-router-dom';
import { IAudioData } from 'roundware-web-framework/dist/types';
import { useRoundware, useRoundwareDraft } from '../../../hooks';
import { ITextAsset } from '../../../types';
import { wait } from '../../../utils';
import AudioPlayer from '../../AudioPlayer';
import ErrorDialog from '../../ErrorDialog';
import LegalAgreementForm from '../../LegalAgreementForm';
import AdditionalMediaMenu from './AdditionalMediaMenu';
import { useStyles } from './styles';
import config from 'config.json';
const visualizerOptions = {
	type: 'bars',
};

const CreateRecordingForm = () => {
	const draftRecording = useRoundwareDraft();
	const { roundware, tagLookup, updateAssets } = useRoundware();
	let [wave, set_wave] = useState(new Wave());
	const [isRecording, set_is_recording] = useState(false);
	const [draftRecordingMedia, set_draft_recording_media] = useState<IAudioData | null>(null);
	const [draftMediaUrl, set_draft_media_url] = useState('');
	const [recorder, set_recorder] = useState<MediaRecorder | undefined>();
	const [stream, set_stream] = useState<MediaStream | undefined>();
	const [textAsset, setTextAsset] = useState<ITextAsset>('');
	const [imageAssets, setImageAssets] = useState<File[]>([]);
	const [deleteModalOpen, set_delete_modal_open] = useState(false);
	const [legalModalOpen, set_legal_modal_open] = useState(false);
	const [saving, set_saving] = useState(false);
	const [error, set_error] = useState<Error | null>(null);
	const [success, set_success] = useState<{ detail: string; envelope_ids: number[] } | null>(null);
	const history = useHistory();
	const classes = useStyles();
	const theme = useTheme();
	const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

	const startRecording = () => {
		if (!navigator.mediaDevices) {
			set_error({
				name: `Microphone not accessible`,
				message: "We can't get access to your microphone at this time",
			});
			return;
		} else {
			set_error(null);
		}
		navigator.mediaDevices
			.getUserMedia({ audio: true })
			.then((stream) => {
				set_draft_recording_media(null);
				set_stream(stream);
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
				set_error(err);
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

		if (!hasTags) {
			history.replace('/speak/tags/0');
		}
	}, [draftRecording.tags, draftRecording.location.latitude, draftRecording.location.longitude]);

	const selected_tags = draftRecording.tags.map((tag) => tagLookup[tag]);

	const maxRecordingLength = roundware.project ? (roundware.project.maxRecordingLength ? roundware.project.maxRecordingLength : '--') : '--';

	return (
		<Card className={classes.container}>
			<Prompt
				when={!!draftMediaUrl && !success}
				message={JSON.stringify({
					message: `Are you sure you want to leave without submitting your recording? If you do, your recording will be deleted.`,
					stay: `Keep Recording`,
					leave: `Delete Recording`,
				})}
			/>

			<Grid container alignItems={'center'} direction={'column'} spacing={2} justifyContent='center'>
				<Grid item mt={3}>
					<Container>
						{/*{ selected_tags.map( tag => <Typography variant={"h6"}key={tag.id}>{tag.tag_display_text}</Typography> ) }*/}
						{
							<Typography variant={'h5'} className={classes.tagGroupHeaderLabel} key={selected_tags.length > 0 ? selected_tags[selected_tags.length - 1].id : 1} gutterBottom>
								{selected_tags.length > 0 ? selected_tags[selected_tags.length - 1].tag_display_text : 'No selected tags'}
							</Typography>
						}
					</Container>
				</Grid>
				<ErrorDialog error={error} set_error={set_error} />
				{!draftMediaUrl && (
					<Grid item xs={12} className={classes.audioVisualizer}>
						<canvas id='audio-visualizer' style={{ height: isExtraSmallScreen ? 100 : 150, width: 300 }} />
					</Grid>
				)}

				{draftMediaUrl ? (
					<Grid item xs={12}>
						{/*}<audio id={"draft-audio"} src={draftMediaUrl} controls />*/}
						{/* id prop not availabe on this component prop types - Shreyas */}
						{/* <AudioCard src={draftMediaUrl} mute={false} forward={false} backward={false} width={300} volume={false} /> */}
						<AudioPlayer size='large' src={draftMediaUrl} />
					</Grid>
				) : null}
				{!draftMediaUrl && !isRecording ? (
					<Grid
						item
						xs={12}
						style={{
							paddingBottom: 0,
							paddingTop: isExtraSmallScreen ? 8 : 32,
						}}
					>
						<IconButton
							disabled={draftMediaUrl !== ''}
							style={{
								margin: 'auto',
								backgroundColor: isRecording ? 'red' : 'inherit',
								padding: 0,
							}}
							onClick={toggleRecording}
							size='large'
						>
							<MicIcon color={isRecording ? 'primary' : 'inherit'} className={classes.iconButton} />
						</IconButton>
					</Grid>
				) : null}
				{/*}<Grid
          item
          style={{"paddingTop": 0}}>
          <Typography
            variant={"h3"}
            className={classes.label}>
            {draftMediaUrl ? "Listen Back" : (isRecording ? "Recording!" : "Record")}
          </Typography>
        </Grid>*/}
				{isRecording ? (
					<Grid item xs={12}>
						<CountdownCircleTimer
							isPlaying
							duration={parseInt(maxRecordingLength.toString())}
							size={isExtraSmallScreen ? 140 : 180}
							strokeWidth={isExtraSmallScreen ? 8 : 12}
							onComplete={() => {
								stopRecording();
							}}
							trailColor='#000000'
							colors={[
								['#DDDDDD', 0.33],
								['#DDDDDD', 0.33],
								['#719EE3', 0.33],
							]}
						>
							{({ remainingTime }: { remainingTime: number }) => (
								<Grid container direction='column' alignItems='center'>
									<Grid item>
										<Typography variant='h3' style={{ textAlign: 'center' }}>
											{Math.floor(remainingTime / 60) +
												':' +
												(remainingTime % 60).toLocaleString('en-US', {
													minimumIntegerDigits: 2,
													useGrouping: false,
												})}
										</Typography>
									</Grid>
									<Grid item>
										<IconButton
											disabled={draftMediaUrl !== ''}
											style={{
												margin: 'auto',
												backgroundColor: isRecording ? 'red' : 'inherit',
												justifyContent: 'center',
											}}
											onClick={toggleRecording}
											size='large'
										>
											<MicIcon color={isRecording ? 'primary' : 'inherit'} className={classes.iconButtonSmall} />
										</IconButton>
									</Grid>
								</Grid>
							)}
						</CountdownCircleTimer>
					</Grid>
				) : null}
				{draftMediaUrl == '' && (
					<Grid item xs={12} justifyContent='center'>
						<Typography textAlign='center' variant={'subtitle1'}>
							Tap to {isRecording ? `Stop` : `Record`}
						</Typography>
					</Grid>
				)}
				<Grid
					container
					item
					style={{
						paddingLeft: isExtraSmallScreen ? 8 : 32,
						paddingRight: isExtraSmallScreen ? 8 : 32,
						paddingTop: isExtraSmallScreen ? 16 : 32,
					}}
				>
					<Button
						style={{ margin: 'auto' }}
						variant='contained'
						color='secondary'
						size={isExtraSmallScreen ? 'small' : 'medium'}
						startIcon={<DeleteIcon />}
						disabled={draftMediaUrl === ''}
						onClick={() => {
							set_delete_modal_open(true);
						}}
					>
						Delete
					</Button>

					<Dialog open={deleteModalOpen}>
						<DialogContent>
							<DialogContentText>Delete your current draft recording?</DialogContentText>
						</DialogContent>

						<DialogActions>
							<Button
								variant='contained'
								color='primary'
								onClick={() => {
									set_delete_modal_open(false);
								}}
							>
								No, keep it!
							</Button>
							<Button
								variant='contained'
								color='secondary'
								onClick={() => {
									deleteRecording();
									set_delete_modal_open(false);
								}}
							>
								Yes, delete it!
							</Button>
						</DialogActions>
					</Dialog>
					{config.ALLOW_PHOTOS === true || config.ALLOW_TEXT === true ? <AdditionalMediaMenu onSetText={setTextAsset} onSetImage={(file) => setImageAssets([...imageAssets, file])} textAsset={textAsset} imageAssets={imageAssets} disabled={draftMediaUrl === ''} /> : null}
					<Button
						variant='contained'
						color='primary'
						size={isExtraSmallScreen ? 'small' : 'medium'}
						startIcon={<CloudUploadIcon />}
						style={{ margin: 'auto' }}
						disabled={draftMediaUrl === ''}
						onClick={() => {
							set_legal_modal_open(true);
						}}
					>
						Submit
					</Button>
					<Dialog open={legalModalOpen}>
						<LegalAgreementForm
							onDecline={() => {
								set_legal_modal_open(false);
							}}
							onAccept={async () => {
								set_legal_modal_open(false);
								set_saving(true);
								if (typeof draftRecording.location.longitude !== 'number' || typeof draftRecording.location.latitude !== 'number') {
									return set_error(new Error(`Failed to get latitude & longitude!`));
								}
								const assetMeta = {
									longitude: draftRecording.location.longitude,
									latitude: draftRecording.location.latitude,
									tag_ids: selected_tags.map((t) => t.tag_id),
								};
								const dateStr = new Date().toISOString();

								// Make an envelope to hold the uploaded assets.
								const envelope = await roundware.makeEnvelope();
								try {
									// Add the audio asset.
									if (draftRecordingMedia == null) throw new Error(`RecordingMedia data was null!`);
									const asset = await envelope.upload(draftRecordingMedia, dateStr + '.mp3', assetMeta);

									// Add the text asset, if any.
									if (textAsset) {
										await envelope.upload(new Blob([textAsset.toString()], { type: 'text/plain' }), dateStr + '.txt', { ...assetMeta, media_type: 'text' });
									}
									for (const file of imageAssets) {
										// roundware types not defined yet

										await envelope.upload(file, file.name || dateStr + '.jpg', {
											...assetMeta,
											media_type: 'photo',
										});
									}
									await roundware?.updateAssetPool();
									set_success(asset);
									updateAssets();
								} catch (err) {
									// @ts-ignore
									set_error(err);
								}
								set_saving(false);
							}}
						/>
					</Dialog>
				</Grid>
				<Dialog open={saving}>
					<DialogContent>
						<CircularProgress color={'primary'} style={{ margin: 'auto' }} />
						<DialogContentText>Uploading your contribution now! Please keep this page open until we finish uploading.</DialogContentText>
					</DialogContent>
				</Dialog>
				<Dialog open={success !== null}>
					<DialogContent>
						<DialogContentText style={{ textAlign: 'center' }}>
							<CheckCircleIcon color={'primary'} />
						</DialogContentText>
						<DialogContentText>Upload Complete! Thank you for participating!</DialogContentText>
					</DialogContent>
					<DialogActions>
						<Button
							variant={'contained'}
							color={'primary'}
							disabled={success == null}
							onClick={() => {
								if (success !== null && Array.isArray(success.envelope_ids) && success.envelope_ids.length > 0) {
									history.push(`/listen?eid=${success.envelope_ids[0]}`);
								}
							}}
						>
							Listen
						</Button>
						<Button
							variant={'contained'}
							color={'primary'}
							onClick={() => {
								draftRecording.reset();
								history.push('/speak');
							}}
						>
							Create New Recording
						</Button>
					</DialogActions>
				</Dialog>
			</Grid>
		</Card>
	);
};
export default CreateRecordingForm;
