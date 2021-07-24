import { ListItemIcon, ListItemText } from '@material-ui/core';
import React, { LegacyRef } from 'react';
import { StyledMenuItem } from './StyledMenu';
import PhotoIcon from '@material-ui/icons/Photo';

interface PhotoPickerMenuItemProps {
	onClick: React.MouseEventHandler<{}>;
	onSetImage: (string) => unknown;
	openPicker: () => unknown;
}
export const PhotoPickerMenuItem = React.forwardRef(({ onSetImage, openPicker, setAnchorEl, ref }: PhotoPickerMenuItemProps | any) => (
	<StyledMenuItem onClick={openPicker}>
		<PhotoPickerInput onSetImage={onSetImage} ref={ref} setAnchorEl={setAnchorEl} />
		<ListItemIcon>
			<PhotoIcon fontSize='small' />
		</ListItemIcon>
		<ListItemText primary='Add Photo' />
	</StyledMenuItem>
));

interface PhotoPickerInput {
	onSetImage: (file: HTMLInputElement[`files`][number]) => unknown;
	ref: LegacyRef<HTMLInputElement>;
}
export const PhotoPickerInput = React.forwardRef(({ onSetImage, setAnchorEl, ref }: PhotoPickerInput | any) => (
	<input
		ref={ref}
		type='file'
		accept='image/jpeg, image/png, image/gif'
		style={{ display: 'none' }}
		onChange={(e) => {
			onSetImage(e.target.files[0]);
			setAnchorEl(null);
		}}
	/>
));
