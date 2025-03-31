import { Button, Dialog, DialogContent, Stack, Typography } from '@mui/material';
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
					backgroundColor: 'rgba(116, 151, 255, 0.46)',
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
					color: 'white',
					border: '1px solid rgba(255, 255, 255, 0.1)',
					boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
				}
			}}
		>
			<DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
				<Stack spacing={4} alignItems="center" justifyContent="center">
					<Stack spacing={2} alignItems="center">
						<LanguageIcon sx={{ fontSize: 40, color: 'white', opacity: 0.7, fontWeight: 100 }} />
						<Typography 
							variant="h4" 
							component="h1" 
							sx={{ 
								fontWeight: 300,
								letterSpacing: '0.5px',
								fontSize: '1.5rem',
								margin: 0
							}}
						>
							SORRY!
						</Typography>
					</Stack>
					<Typography 
						variant="h6" 
						sx={{ 
							maxWidth: '600px',
							fontWeight: 300,
							opacity: 0.9,
							fontSize: '0.9rem',
							lineHeight: 1.6
						}}
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
			</DialogContent>
		</Dialog>
	);
};

export default PermissionDeniedDialog;
