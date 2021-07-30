import { useMediaQuery } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import Button from '@material-ui/core/Button';
import { useTheme } from '@material-ui/core/styles';
import PhotoIcon from '@material-ui/icons/Photo';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import React, { useRef, useState } from 'react';
import { PhotoPickerInput, PhotoPickerMenuItem } from './PhotoPicker';
import { StyledMenu } from './StyledMenu';
import { TextInputDialog, TextInputMenuItem } from './TextInput';

interface AdditionalMediaMenuProps {
	onSetText: string;
	onSetImage: (string: string) => unknown;
	imageAssets: string;
	textAsset: string;
	disabled: boolean;
}

const AdditionalMediaMenu = ({ onSetText, onSetImage, imageAssets, textAsset, disabled }: AdditionalMediaMenuProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [addTextModalOpen, setAddTextModalOpen] = useState(false);
	const theme = useTheme();
	const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('xs'));
	const isTinyScreen = useMediaQuery(theme.breakpoints.down(350));
	const picker = useRef(null);

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => setAnchorEl(event.currentTarget);

	const handleClose = () => setAnchorEl(null);

	if (process.env.ALLOW_PHOTOS === 'true' && process.env.ALLOW_TEXT === 'true') {
		return (
			<div>
				<Button
					size={isTinyScreen ? 'small' : 'medium'}
					aria-controls='customized-menu'
					aria-haspopup='true'
					variant='contained'
					color='primary'
					startIcon={
						<>
							<Badge badgeContent={imageAssets.length} showZero={false} color='secondary'>
								<PhotoIcon />
							</Badge>
							<Badge badgeContent={textAsset ? textAsset.length : 0} showZero={false} color='secondary' variant='dot'>
								<TextFieldsIcon style={{ marginLeft: 10 }} />
							</Badge>
						</>
					}
					disabled={disabled}
					onClick={handleClick}
				>
					{isExtraSmallScreen ? 'Add' : 'Add Media'}
				</Button>
				<StyledMenu id='customized-menu' anchorEl={anchorEl} keepMounted autoFocus={false} open={Boolean(anchorEl)} onClose={handleClose}>
					<PhotoPickerMenuItem ref={picker} onSetImage={onSetImage} openPicker={() => picker.current.click()} setAnchorEl={setAnchorEl} />
					<TextInputMenuItem
						{...{
							textAsset,
							addTextModalOpen,
							isExtraSmallScreen,
							onSetText,
							setAddTextModalOpen,
							setAnchorEl,
						}}
					/>
				</StyledMenu>
			</div>
		);
	} else if (process.env.ALLOW_PHOTOS === 'true') {
		return (
			<>
				<Button
					size={isTinyScreen ? 'small' : 'medium'}
					aria-controls='customized-menu'
					aria-haspopup='true'
					variant='contained'
					color='primary'
					startIcon={
						<Badge badgeContent={imageAssets.length} color='secondary'>
							<PhotoIcon />
						</Badge>
					}
					disabled={disabled}
					onClick={() => picker.current.click()}
				>
					Add Photo
				</Button>
				<PhotoPickerInput onSetImage={onSetImage} ref={picker} setAnchorEl={setAnchorEl} />
			</>
		);
	} else {
		return (
			<>
				<Button
					size={isTinyScreen ? 'small' : 'medium'}
					aria-controls='customized-menu'
					aria-haspopup='true'
					variant='contained'
					color='primary'
					startIcon={
						<Badge badgeContent={textAsset ? textAsset.length : 0} color='secondary' variant='dot'>
							<TextFieldsIcon />
						</Badge>
					}
					disabled={disabled}
					onClick={() => {
						setAddTextModalOpen(true);
					}}
				>
					Add Text
				</Button>
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
	}
};

export default AdditionalMediaMenu;
