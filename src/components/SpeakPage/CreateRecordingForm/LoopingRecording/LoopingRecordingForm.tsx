import { ArrowForwardIos, Check, Mic, GraphicEq, PlayArrow, Close } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Button, Card, CardContent, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, Checkbox, Grow, Skeleton, Stack, Tooltip, Typography, useTheme, IconButton } from '@mui/material';
import PermissionDeniedDialog from '@/components/elements/PermissionDeniedDialog';
import LegalAgreementForm from '@/components/LegalAgreementForm';
import { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Prompt } from 'react-router';
import { useLoopingRecording } from './useLoopingRecording';

// Step indicator component
interface StepIndicatorProps {
	activeStep: number;
}

const StepIndicator = ({ activeStep }: StepIndicatorProps) => {
	const steps = [
		{ label: 'REHEARSE' },
		{ label: 'RECORDING' },
		{ label: 'REVIEW' }
	];

	return (
		<Stack direction="row" spacing={1} justifyContent="center" alignItems="flex-start" sx={{ mt: 18, position: 'absolute', top: 0 }}>
			{steps.map((step, index) => (
				<Stack key={index} direction="column" alignItems="center" spacing={1}>
					<Box sx={{ width: 100, height: 3, bgcolor: activeStep === index ? 'primary.main' : 'grey.500' }} />
					{activeStep === index && (
						<Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
							{step.label}
						</Typography>
					)}
				</Stack>
			))}
		</Stack>
	);
};

const LoopingRecordingForm = () => {
	const theme = useTheme();
	const [isConsentChecked, setIsConsentChecked] = useState(false);
	const [showRehearsePage, setShowRehearsePage] = useState(false);
	const [showRecordButtonPage, setShowRecordButtonPage] = useState(false);
	const [isCountdownActive, setIsCountdownActive] = useState(false);
	const [countdownValue, setCountdownValue] = useState(3);
	const [activeStep, setActiveStep] = useState(0);

	const [showRerecordConfirm, setShowRerecordConfirm] = useState(false);
	const [legalModalOpen, setLegalModalOpen] = useState(false);

	const { speaker, recorder, submission, loop } = useLoopingRecording();

	useEffect(() => {
		let timer: NodeJS.Timeout | undefined;
		if (isCountdownActive && countdownValue > 0) {
			timer = setTimeout(() => {
				setCountdownValue(prev => prev - 1);
			}, 1000);
		} else if (isCountdownActive && countdownValue === 0) {
			setIsCountdownActive(false);
			setActiveStep(1);
			// loop.start('playing-speaker');
			recorder.scheduleRecording();
		}
		return () => {
			if (timer) clearTimeout(timer);
		};
	}, [isCountdownActive, countdownValue, loop, recorder]);

	const handleLaunch = () => {
		// Function to handle launching the rehearsal
		setShowRehearsePage(true);
		// Add any additional logic needed for launching rehearsal
	};

	const handleMicClick = () => {
		setIsCountdownActive(true);
		setCountdownValue(5);
	};

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

			<Collapse in={!showRehearsePage}>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					position="fixed"
					top="50%"
					left="50%"
					width="100%"
					height="100%"
					sx={{ 
						'& .MuiFab-root': { width: 250, height: 250 },
						transform: 'translate(-50%, -50%)'
					}}>
					<Box sx={{ position: 'relative' }}>
						<Skeleton
							variant="circular"
							animation="pulse"
							sx={{
								position: 'absolute',
								width: 300,
								height: 300,
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}}
						/>
						
						<Fab size="large">
							<Stack alignItems="center" spacing={1}>
								<Typography variant="button">JOIN CHOIR</Typography>
								<Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
									<Box sx={{ width: 20, height: 3, bgcolor: 'primary.main' }} />
									<Box sx={{ width: 20, height: 3, bgcolor: 'grey.500' }} />
									<Box sx={{ width: 20, height: 3, bgcolor: 'grey.500' }} />
								</Stack>
								<Typography variant="body2">
									Rehearse your<br />singing to the loop
								</Typography>
							</Stack>
						</Fab>
					</Box>
					<Stack direction="row" alignItems="center" sx={{ mt: 4 }}>
						<Checkbox 
							checked={isConsentChecked}
							onChange={(e) => setIsConsentChecked(e.target.checked)}
						/>
						<Typography variant="body2">
							I consent to my recording being used solely for the artistic purposes of Invisible Choir
						</Typography>
					</Stack>
					<Button 
						variant="contained"
						disabled={!isConsentChecked}
						sx={{ mt: 4 }}
						onClick={async () => {
							const hasPermission = await recorder.checkMicrophonePermission();
							if (!hasPermission) return;
						
							setShowRehearsePage(true);
						}}
					>
						Continue
					</Button>
					<Button 
						variant="text"
						sx={{ mt: 3 }}>
						Cancel
					</Button>
				</Box>
			</Collapse>

			<Collapse in={showRehearsePage}>
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					position="fixed"
					top="50%"
					left="50%"
					width="100%"
					height="100%"
					sx={{ 
						'& .MuiFab-root': { width: 250, height: 250 },
						transform: 'translate(-50%, -50%)'
					}}>
					<Box sx={{
						position: 'absolute', top: 0, right: 0, width: '100%', display: 'flex', justifyContent: 'flex-end'
					}}>
						<IconButton 
							sx={{ mt: 10, mr: 2 }}
							onClick={() => setShowRehearsePage(false)}
						>
							<Close />
						</IconButton>
					</Box>
					
					<StepIndicator activeStep={activeStep} />
					
					<Box sx={{ position: 'relative' }}>
						<Skeleton
							variant="circular"
							animation="pulse"
							sx={{
								position: 'absolute',
								width: 300,
								height: 300,
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
							}}
						/>
						
						<Fab size="large" >
							{!showRecordButtonPage ? (
								<PlayArrow 
									onClick={() => {
										handleLaunch();
										setShowRecordButtonPage(true);
									}}
									sx={{ cursor: 'pointer' }}
								/>
							) : (
								<Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									{isCountdownActive ? (
										<Typography variant="h4" >
											{countdownValue}
										</Typography>
									) : (
										<Mic 
											onClick={handleMicClick}
											sx={{ cursor: 'pointer' }}
										/>
									)}
								</Box>
							)}
						</Fab>
					</Box>
					
					<Typography variant="body1" sx={{ mt: 5 }}>
						{showRecordButtonPage 
							? (!isCountdownActive ? "PRESS RECORD WHEN READY TO SING" : "GET READY")
							: "PRESS PLAY WHEN READY TO SING"}
					</Typography>
				</Box>
			</Collapse>
			{/* <Card>
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
			</Card> */}
		</>
	);
};

export default LoopingRecordingForm;
