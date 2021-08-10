import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, ListItemIcon, ListItemText, TextField } from '@material-ui/core';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import { StyledMenuItem } from './StyledMenu';
import { ITextAsset } from '../../../../types';

interface TextInputDialogProps {
	textAsset: ITextAsset;
	addTextModalOpen: boolean;
	isExtraSmallScreen: boolean;
	setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
	onSetText: React.Dispatch<React.SetStateAction<string>>;
	setAddTextModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const TextInputDialog = ({ textAsset, addTextModalOpen, isExtraSmallScreen, onSetText, setAddTextModalOpen, setAnchorEl }: TextInputDialogProps) => (
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

export const TextInputMenuItem = ({ textAsset, addTextModalOpen, setAddTextModalOpen, onSetText, setAnchorEl, isExtraSmallScreen }: TextInputDialogProps) => {
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
