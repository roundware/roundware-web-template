import ShareIcon from '@mui/icons-material/Share';
import IconButton from '@mui/material/IconButton';
import { useUIContext } from 'context/UIContext';
import React from 'react';
const ShareLinkButton = () => {
	const { handleShare } = useUIContext();

	return (
		<IconButton onClick={() => handleShare()}>
			<ShareIcon />
		</IconButton>
	);
};

export default ShareLinkButton;
