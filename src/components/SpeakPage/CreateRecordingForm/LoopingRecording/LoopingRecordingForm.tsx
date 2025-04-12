import { ArrowForwardIos, Check, Mic, GraphicEq, PlayArrow, Close, Logout } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Box, Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, Checkbox, Grow, Skeleton, Stack, Tooltip, Typography, useTheme, IconButton, FormControlLabel } from '@mui/material';
import PermissionDeniedDialog from '@/components/elements/PermissionDeniedDialog';
import LegalAgreementForm from '@/components/LegalAgreementForm';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import ReplayIcon from '@mui/icons-material/Replay';
import { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Prompt, useHistory } from 'react-router';
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
		<Stack direction="row" spacing={1} justifyContent="center" alignItems="flex-start" sx={{ mt: 18, position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 'fit-content' }}>
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
	const [showJoinChoirPage, setShowJoinChoirPage] = useState(true);
	const [showRehearsePage, setShowRehearsePage] = useState(false);
	const [showRecordButtonPage, setShowRecordButtonPage] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const [showMicButton, setShowMicButton] = useState(true);
	const [showAnotherButton, setShowAnotherButton] = useState(false);
	const [countdown, setCountdown] = useState<number | null>(null);

	const [showRerecordConfirm, setShowRerecordConfirm] = useState(false);
	const [legalModalOpen, setLegalModalOpen] = useState(false);
	const [showCloseConfirm, setShowCloseConfirm] = useState(false);
	const [showThankYouDialog, setShowThankYouDialog] = useState(false);

	const { speaker, recorder, submission, loop } = useLoopingRecording();
	const history = useHistory();

	useEffect(() => {
		if (recorder.recordedAudioBlob) {
			setActiveStep(2); // Set to REVIEW when recording is completed
			setShowMicButton(false);
			setShowAnotherButton(true);
		}
	}, [recorder.recordedAudioBlob]);

	// Add countdown timer effect
	useEffect(() => {
		if (loop.mode === 'waiting-to-record' && loop.nextLoopPointAt.current) {
			const updateCountdown = () => {
				const now = Date.now();
				const remaining = Math.max(0, Math.ceil((loop.nextLoopPointAt.current! - now) / 1000));
				setCountdown(remaining);
			};

			updateCountdown();
			const interval = setInterval(updateCountdown, 1000);

			return () => clearInterval(interval);
		} else {
			setCountdown(null);
		}
	}, [loop.mode, loop.nextLoopPointAt.current]);

	useEffect(() => {
		if (countdown !== null) {
			setShowAnotherButton(false);
		}
	}, [countdown]);

	const handleMicClick = () => {
		setShowMicButton(false);
		setShowAnotherButton(true);
	};

	const handleAnotherButtonClick = () => {
		if (recorder.recordedAudioBlob) {
			setShowRerecordConfirm(true);
		} else {
			recorder.scheduleRecording();
			setActiveStep(1);
		}
		setShowMicButton(true);
		setShowAnotherButton(false);
	};

	return (
		<>
			{!showJoinChoirPage && (
				<Button 
					variant="outlined"
					size="small"
					sx={{ 
						position: 'absolute',
						top: 80,
						right: 16,
						minWidth: 0,
						p: 1,
						borderRadius: '50%'
					}}
					onClick={() => setShowCloseConfirm(true)}
				>
					<Close />
				</Button>
			)}
			<PermissionDeniedDialog open={recorder.isPermissionDenied} onClose={() => recorder.setIsPermissionDenied(false)} functionality='microphone' />

			<Prompt
				when={!!recorder.recordedAudioBlob && submission.status === 'submitted'}
				message={JSON.stringify({
					message: `Are you sure you want to leave without submitting your recording? If you do, your recording will be deleted.`,
					stay: `Keep Recording`,
					leave: `Delete Recording`,
				})}
			/>

			{!showJoinChoirPage && <StepIndicator activeStep={activeStep} />}
			<Collapse in={showJoinChoirPage}>
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
						<FormControlLabel
							control={
								<Checkbox 
									checked={isConsentChecked}
									onChange={(e) => setIsConsentChecked(e.target.checked)}
								/>
							}
							label={
								<Typography variant="body2">
									I consent to my recording being used solely for the artistic purposes of Invisible Choir
								</Typography>
							}
						/>
					</Stack>
					<Button 
						variant="contained"
						disabled={!isConsentChecked}
						sx={{ mt: 4 }}
						onClick={async () => {
							const hasPermission = await recorder.checkMicrophonePermission();
							if (!hasPermission) return;
							setShowJoinChoirPage(false);
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

			<Collapse in={!loop.isStarted && !showJoinChoirPage}>
				<Stack spacing={4} p={4}>
					<Stack direction={'row'} spacing={2} justifyContent={'center'}>
						{speaker.duration !== null && (
							<CountdownCircleTimer
								duration={speaker.duration}
								colors={theme.palette.primary.main}
								trailColor={theme.palette.grey[800]}
								isPlaying={loop.mode !== 'idle'}
								strokeWidth={3}
								size={280}
								onComplete={() => {
									return [true, 0];
								}}
							>
								<Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<Fab
										color="primary"
										onClick={async () => {
											const hasPermission = await recorder.checkMicrophonePermission();
											if (!hasPermission) return;
											loop.start('playing-speaker');
											setShowMicButton(true);
											setShowAnotherButton(false);
										}}
										disabled={loop.isLoading}
									>
										{loop.isLoading ? <CircularProgress size={24} /> : <PlayArrow />}
									</Fab>
								</Box>
							</CountdownCircleTimer>
						)}
					</Stack>
				</Stack>
			</Collapse>

			<Collapse in={loop.isStarted}>
				<Stack spacing={4} p={4} alignItems={'center'} justifyContent={'center'} sx={{ mb: 10 }}>
					{speaker.isReady && speaker.duration > 0 && (
						<>
							<CountdownCircleTimer
								duration={speaker.duration}
								colors={loop.mode === 'recording' ? theme.palette.error.main : theme.palette.primary.main}
								trailColor={theme.palette.grey[800]}
								isPlaying={loop.mode !== 'idle'}
								strokeWidth={3}
								size={(loop.mode === 'recording' || loop.mode === 'recording-playback') ? 190 : 280}
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
									<Stack direction="column" spacing={5} position={'absolute'}>
										{(loop.mode === 'recording' || loop.mode === 'recording-playback') && (
											<CountdownCircleTimer
												duration={speaker.duration}
												colors={theme.palette.error.main}
												trailColor={theme.palette.grey[800]}
												isPlaying={true}
												strokeWidth={3}
												size={280}
												onComplete={() => {
													return [true, 0];
												}}
											/>
										)}
									</Stack>
									<Grow in={loop.mode === 'playing-speaker' || loop.mode === 'recording-playback' || loop.mode === 'waiting-to-record'}>
										<Stack direction="column" spacing={5} position={'absolute'}>
											{countdown !== null && (
												<Box sx={{ 
													bgcolor: 'white', 
													borderRadius: '50%', 
													p: 8, 
													display: 'flex', 
													alignItems: 'center', 
													justifyContent: 'center',
													width: 180,
													height: 180
												}}>
													<Typography
														variant="h2"
														align="center"
														color="primary.main"
													>
														{countdown}
													</Typography>
												</Box>
											)}
											{showMicButton && (
												<Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
													<Fab
														color="primary"
														onClick={() => {
															if (loop.mode === 'recording') return;
															setShowMicButton(false);
															recorder.scheduleRecording();
															setActiveStep(1);
														}}
														sx={{
															'&:hover': {
																color: theme.palette.error.dark,
															},
															fontSize: '2rem'
														}}
													>
														<Mic sx={{ 
															color: loop.mode === 'recording' ? 'action.disabled' : 'inherit'
														}} />
													</Fab>
												</Box>
											)}
											{showAnotherButton && (
												<Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 11.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
													<Button
														variant='outlined'
														sx={{
															position: 'absolute',
															left: '50%',
															top: '50%',
															transform: 'translate(-50%, -50%)',
															whiteSpace: 'nowrap',
															color: 'primary.main',
															borderColor: 'primary.main',
														}}
														startIcon={<ReplayIcon />}
														onClick={() => {
															if (recorder.recordedAudioBlob) {
																setShowRerecordConfirm(true);
															} else {
																recorder.scheduleRecording();
																setActiveStep(1);
															}
														}}
														size={recorder.recordedAudioBlob ? 'small' : 'medium'}
													>
														{recorder.recordedAudioBlob ? 'Re-record' : 'Record'}
													</Button>
												</Box>
											)}
										</Stack>
									</Grow>

									<Grow in={loop.mode === 'recording'}>
										<Box sx={{ position: 'relative' }}>
											<Box sx={{ bgcolor: 'white', borderRadius: '50%', p: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
												<Fab
													color="primary"
													onClick={() => {
														if (loop.mode === 'recording') return;
														setShowMicButton(false);
														recorder.scheduleRecording();
														setActiveStep(1);
													}}
													sx={{
														'&:hover': {
															color: theme.palette.error.dark,
														},
														fontSize: '2rem'
													}}
												>
													<Mic sx={{ 
														fontSize: '2rem',
														color: loop.mode === 'recording' ? 'action.disabled' : 'inherit'
													}} />
												</Fab>
											</Box>
										</Box>
									</Grow>
								</Stack>
							</CountdownCircleTimer>
						</>
					)}

					{recorder.recordedAudioBlob && (
						<Stack spacing={10} alignItems={'center'} sx={{ position: 'absolute', bottom: 150, width: '100%' }}>
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
								>
									Submit Recording
								</Button>
							</Box>
						</Stack>
					)}
				</Stack>
			</Collapse>

			{!showJoinChoirPage && (
				<Box sx={{ 
					position: 'absolute', 
					bottom: 200, 
					left: '50%',
					transform: 'translateX(-50%)',
					width: '100%', 
					textAlign: 'center' 
				}}>
					<Typography variant="body1">
						{activeStep === 2 ? "" :
							activeStep === 1 ? "" :
								!loop.isStarted ? "PRESS PLAY TO START REHEARSING" : "PRESS RECORD WHEN READY TO SING"}
						{loop.mode === 'waiting-to-record' ? "GET READY" : ""}
					</Typography>
				</Box>
			)}
			
			<ConfirmationDialog
				open={showRerecordConfirm}
				onClose={() => setShowRerecordConfirm(false)}
				onConfirm={() => {
					setShowRerecordConfirm(false);
					recorder.scheduleRecording();
					setActiveStep(1);
				}}
				icon={<ReplayIcon sx={{ fontSize: 40 }} />}
				title="Re-record"
				description="Are you sure? 
				You will lose your recording."
				confirmText="Yes, Re-record"
				cancelText="Cancel"
			/>

			<ConfirmationDialog
				open={showCloseConfirm}
				onClose={() => setShowCloseConfirm(false)}
				onConfirm={() => {
					setShowCloseConfirm(false);
					setShowRehearsePage(false);
					history.push('/listen');
				}}
				icon={<Logout sx={{ fontSize: 40 }} />}
				title="Leave Choir"
				description="Are you sure you want to leave this choir? 
				You will lose your recording."
				confirmText="Yes, Leave"
				cancelText="Cancel"
			/>

			<ConfirmationDialog
				open={showThankYouDialog}
				onClose={() => {
					setShowThankYouDialog(false);
					history.push('/listen');
				}}
				onConfirm={() => {
					setShowThankYouDialog(false);
					history.push('/listen');
				}}
				icon={<Logout sx={{ fontSize: 40}} />}
				title="Thank You!"
				description="Your voice has been added to the choir and can now be heard with the other voices in this location."
				confirmText="Listen"
				cancelText=""
			/>

			<Dialog open={legalModalOpen}>
				<LegalAgreementForm
					onDecline={() => {
						setLegalModalOpen(false);
					}}
					onAccept={async () => {
						setLegalModalOpen(false);
						await submission.start();
						setShowThankYouDialog(true);
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
		</>
	);
};

export default LoopingRecordingForm;
