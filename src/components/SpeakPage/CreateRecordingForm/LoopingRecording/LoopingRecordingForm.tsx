import { ArrowForwardIos, Check, Mic } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grow, Stack, Typography, useTheme } from '@mui/material';
import PermissionDeniedDialog from '@/components/elements/PermissionDeniedDialog';
import LegalAgreementForm from '@/components/LegalAgreementForm';
import { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Prompt } from 'react-router';
import { useLoopingRecording } from './useLoopingRecording';

const LoopingRecordingForm = () => {
	const theme = useTheme();

	const [showRerecordConfirm, setShowRerecordConfirm] = useState(false);
	const [legalModalOpen, setLegalModalOpen] = useState(false);

	const { speaker, recorder, submission, loop } = useLoopingRecording();

	return (
		<>
			<PermissionDeniedDialog open={recorder.isPermissionDenied} onClose={() => recorder.setIsPermissionDenied(false)} functionality='microphone' />

			<Prompt
				when={!!recorder.recordedAudioBlob && submission.status === 'submitted'}
				message={JSON.stringify({
					message: `Are you sure you want to leave without submitting your recording? If you do, your recording will be deleted.`,
					stay: `Keep Recording`,
					leave: `Delete Recording`,
				})}
			/>

			<Card>
				<CardContent>
					<Collapse in={!loop.isStarted}>
						<Stack spacing={4} p={4}>
							<Typography variant='h5' fontWeight={'bold'} textAlign={'center'}>
								Amazing! You are about to add your voice to the choir of voices that exist in this location.
							</Typography>
							<Typography variant='h6' textAlign={'center'}>
								Tap the START button and you will hear a loop of the base music for this choir. When you are ready to record, tap the RECORD button and you will see a countdown indicator that displays how much time remains until the recording will start. Then sing along however you want.
							</Typography>

							<Stack direction={'row'} spacing={2} justifyContent={'center'}>
								<LoadingButton
									variant='contained'
									size='large'
									color='primary'
									sx={{
										fontSize: '1.3rem',
										fontWeight: 'bold',
									}}
									endIcon={<ArrowForwardIos />}
									loading={loop.isLoading}
									onClick={async () => {
										const hasPermission = await recorder.checkMicrophonePermission();
										if (!hasPermission) return;
										loop.start('playing-speaker');
									}}
								>
									START
								</LoadingButton>
							</Stack>
						</Stack>
					</Collapse>

					<Collapse in={loop.isStarted}>
						<Stack spacing={4} p={4} alignItems={'center'} justifyContent={'center'}>
							{speaker.isReady && speaker.duration > 0 && (
								<CountdownCircleTimer
									duration={speaker.duration}
									colors={loop.mode === 'recording' ? theme.palette.error.main : theme.palette.primary.main}
									trailColor={theme.palette.grey[800]}
									isPlaying={loop.mode !== 'idle'}
									onComplete={() => {
										return [true, 0];
									}}
								>
									<Stack
										sx={{
											width: '100%',
											height: '100%',
											display: 'flex',
											flexDirection: 'column',
											justifyContent: 'center',
											alignItems: 'center',
										}}
									>
										<Grow in={loop.mode === 'playing-speaker' || loop.mode === 'recording-playback'}>
											<Button
												variant='contained'
												color='primary'
												sx={{
													fontWeight: 'bold',
													background: theme.palette.error.main,
													'&:hover': {
														background: theme.palette.error.dark,
													},
													position: 'absolute',
												}}
												endIcon={<Mic />}
												onClick={() => {
													if (recorder.recordedAudioBlob) {
														setShowRerecordConfirm(true);
													} else recorder.scheduleRecording();
												}}
												size={recorder.recordedAudioBlob ? 'small' : 'medium'}
											>
												{recorder.recordedAudioBlob ? 'Re-record' : 'Record'}
											</Button>
										</Grow>

										<Grow in={loop.mode === 'recording'}>
											<Typography variant='subtitle2' textAlign={'center'}>
												Recording...
											</Typography>
										</Grow>

										<Grow in={loop.mode === 'waiting-to-record'}>
											<Typography
												variant='subtitle2'
												textAlign={'center'}
												sx={{
													position: 'absolute',
													color: 'GrayText',
													transform: 'translateY(-50%)',
												}}
											>
												Waiting to record...
											</Typography>
										</Grow>
									</Stack>
								</CountdownCircleTimer>
							)}

							{recorder.recordedAudioBlob && (
								<Stack spacing={2} alignItems={'center'}>
									<Typography variant='body1' textAlign={'center'}>
										Hit SUBMIT to add your voice to this invisible choir for everyone else to hear.
									</Typography>
									<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
										<Button
											variant='contained'
											color='primary'
											onClick={() => {
												setLegalModalOpen(true);
											}}
											size='large'
											sx={{
												fontWeight: 'bold',
											}}
											endIcon={<Check />}
										>
											Submit
										</Button>
									</Box>
								</Stack>
							)}
						</Stack>
					</Collapse>
				</CardContent>

				<Dialog open={showRerecordConfirm} onClose={() => setShowRerecordConfirm(false)}>
					<DialogTitle>Are you sure you want to re-record your message?</DialogTitle>
					<DialogContent>
						<Typography variant='body1' gutterBottom>
							You will lose your current recording if you re-record.
						</Typography>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => setShowRerecordConfirm(false)}>Cancel</Button>
						<Button
							color='error'
							onClick={() => {
								setShowRerecordConfirm(false);
								recorder.scheduleRecording();
							}}
							variant='contained'
						>
							Re-record
						</Button>
					</DialogActions>
				</Dialog>

				<Dialog open={legalModalOpen}>
					<LegalAgreementForm
						onDecline={() => {
							setLegalModalOpen(false);
						}}
						onAccept={async () => {
							setLegalModalOpen(false);
							await submission.start();
						}}
					/>
				</Dialog>

				<Dialog open={submission.status === 'submitting'}>
					<DialogContent>
						<CircularProgress color={'primary'} style={{ margin: 'auto' }} />
						<DialogContentText>Uploading your contribution now! Please keep this page open until we finish uploading.</DialogContentText>
					</DialogContent>
				</Dialog>

				<Dialog open={submission.status === 'error'}>
					<DialogContent>
						<DialogContentText>We encountered an error while trying to upload your contribution. Please try again later.</DialogContentText>
					</DialogContent>
				</Dialog>
			</Card>
		</>
	);
};

export default LoopingRecordingForm;
