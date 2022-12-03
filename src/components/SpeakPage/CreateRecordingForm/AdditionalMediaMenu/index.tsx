import { useMediaQuery } from '@mui/material';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import PhotoIcon from '@mui/icons-material/Photo';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import React, { useRef, useState } from 'react';
import { ITextAsset } from '../../../../types';
import { PhotoPickerInput, PhotoPickerMenuItem } from './PhotoPicker';
import { StyledMenu } from './StyledMenu';
import { TextInputDialog, TextInputMenuItem } from './TextInput';
import config from 'config.json';
import ContactInfo from './ContactInfo';
interface AdditionalMediaMenuProps {
	onSetText: React.Dispatch<React.SetStateAction<ITextAsset>>;
	onSetImage: (file: File) => void;
	imageAssets: File[];
	textAsset: ITextAsset;
	disabled: boolean;
}

const AdditionalMediaMenu = ({ onSetText, onSetImage, imageAssets, textAsset, disabled }: AdditionalMediaMenuProps) => {
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [addTextModalOpen, setAddTextModalOpen] = useState(false);
	const theme = useTheme();
	const isExtraSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
	const isTinyScreen = useMediaQuery(theme.breakpoints.down('xs'));
	const picker = useRef<HTMLInputElement | null>(null);

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = (event) => setAnchorEl(event.currentTarget);

	const handleClose = () => setAnchorEl(null);

	if (config.ALLOW_PHOTOS == true && config.ALLOW_TEXT == true) {
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
					<PhotoPickerMenuItem
						ref={picker}
						onSetImage={onSetImage}
						openPicker={() => {
							// if picker is mounted
							if (picker && picker.current) picker.current.click();
						}}
						setAnchorEl={setAnchorEl}
					/>

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
					<ContactInfo />
				</StyledMenu>
			</div>
		);
	} else if (config.ALLOW_PHOTOS == true) {
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
					onClick={() => {
						if (picker && picker.current) picker.current.click();
					}}
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
