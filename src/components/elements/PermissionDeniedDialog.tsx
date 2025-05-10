import { Button, Dialog, DialogContent, Stack, Typography, Container } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import finalConfig from '@/config';
import { type Funcionality } from 'web-permission-messages';

type Props = {
	open: boolean;
	onClose: () => void;
	functionality: Funcionality;
};

const PermissionDeniedDialog = (props: Props) => {
	return (
		<Dialog 
			open={props.open} 
			onClose={props.onClose}
			fullScreen
			PaperProps={{
				sx: {
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					p: 3,
					textAlign: 'center',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)'
				}
			}}
		>
			<DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
				<Container>
					<Stack spacing={4} alignItems="center" justifyContent="center">
						<Stack spacing={2} alignItems="center">
							<LanguageIcon sx={{ fontSize: 40 }} />
							<Typography 
								variant="h5" 
								component="h1" 
							>
								SORRY!
							</Typography>
						</Stack>
						<Typography 
							variant="body1" 
						>
							To participate fully in the artwork experience we need access to your location. In the meantime, please see our Youtube channel from some of our favourite choirs.
						</Typography>
						<Button 
							variant="contained"
							color="primary"
							size="large"
							onClick={() => window.open('https://roundware.org/', '_blank')}
						>
							WATCH VIDEOS
						</Button>
					</Stack>
				</Container>
			</DialogContent>
		</Dialog>
	);
};

export default PermissionDeniedDialog;
