import { ListItemIcon, ListItemText } from '@mui/material';
import React, { LegacyRef } from 'react';
import { StyledMenuItem } from './StyledMenu';
import PhotoIcon from '@mui/icons-material/Photo';

interface PhotoPickerMenuItemProps {
	onSetImage: (file: File) => void;
	openPicker: React.MouseEventHandler<HTMLLIElement> | undefined;
	setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}
export const PhotoPickerMenuItem = React.forwardRef<HTMLInputElement, PhotoPickerMenuItemProps>(({ onSetImage, openPicker, setAnchorEl }, ref) => (
	<StyledMenuItem onClick={openPicker}>
		<PhotoPickerInput onSetImage={onSetImage} ref={ref} setAnchorEl={setAnchorEl} />
		<ListItemIcon>
			<PhotoIcon fontSize='small' />
		</ListItemIcon>
		<ListItemText primary='Add Photo' />
	</StyledMenuItem>
));

interface PhotoPickerInputProps {
	onSetImage: (file: File) => void;
	setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}

export const PhotoPickerInput = React.forwardRef<HTMLInputElement, PhotoPickerInputProps>(({ onSetImage, setAnchorEl }, ref) => (
	<input
		ref={ref}
		type='file'
		accept='image/jpeg, image/png, image/gif'
		style={{ display: 'none' }}
		onChange={(e) => {
			if (e.target.files) {
				onSetImage(Array.from(e.target.files)[0]);
				setAnchorEl(null);
			}
		}}
	/>
));
