import { Button, Dialog, DialogActions, DialogContent, ListItemIcon, ListItemText, TextField } from '@material-ui/core';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import { StyledMenuItem } from './StyledMenu';

export const TextInputDialog = ({ textAsset, addTextModalOpen, isExtraSmallScreen, onSetText, setAddTextModalOpen, setAnchorEl }) => (
	<Dialog open={addTextModalOpen}>
		<DialogContent style={isExtraSmallScreen ? { width: 254 } : { width: 500 }}>
			<TextField id='outlined-multiline-static' label='Tap/Click to Type!' multiline rows={6} defaultValue={textAsset || ''} variant='outlined' style={{ width: '100%' }} onBlur={(e) => onSetText(e.target.value)} />
		</DialogContent>
		<DialogActions>
			<Button
				variant='contained'
				color='secondary'
				onClick={() => {
					setAddTextModalOpen(false);
					setAnchorEl(null);
				}}
			>
				Cancel
			</Button>
			<Button
				variant='contained'
				color='primary'
				onClick={() => {
					setAddTextModalOpen(false);
					setAnchorEl(null);
				}}
			>
				Submit
			</Button>
		</DialogActions>
	</Dialog>
);

export const TextInputMenuItem = ({ textAsset, addTextModalOpen, setAddTextModalOpen, onSetText, setAnchorEl, isExtraSmallScreen }) => {
	return (
		<>
			<StyledMenuItem
				onClick={() => {
					setAddTextModalOpen(true);
				}}
			>
				<ListItemIcon>
					<TextFieldsIcon fontSize='small' />
				</ListItemIcon>
				<ListItemText primary='Add Text' />
			</StyledMenuItem>
			<TextInputDialog
				{...{
					textAsset,
					addTextModalOpen,
					isExtraSmallScreen,
					onSetText,
					setAddTextModalOpen,
					setAnchorEl,
				}}
			/>
		</>
	);
};
