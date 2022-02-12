import ShareIcon from '@mui/icons-material/Share';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import CopyableText from 'components/elements/CopyableText';
import Modal from 'components/elements/Modal';
import { URLContext } from 'context/URLContext';
import { useRoundware } from 'hooks';
import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
const ShareLinkButton = () => {
	const [showShareLink, setShowShareLink] = useState(false);
	const handleShare = () => setShowShareLink(true);
	const handleCloseShare = () => setShowShareLink(false);
	const { roundware, selectedAsset } = useRoundware();
	const location = useLocation();

	const [includeGeo, setIncludeGeo] = useState(false);
	const { params } = React.useContext(URLContext);
	const isAssetSelected = useMemo(() => params.has('aid') || params.has('eid'), [params, location]);

	const { link, showOptions } = useMemo(() => {
		const searchParams = new URLSearchParams();

		// when on listen page need show options
		if (window.location.pathname == '/listen') {
			// get current url
			let link = window.location.toString();

			// asked to include geo information and asset not any asset selected
			if (includeGeo && !isAssetSelected && roundware && roundware.listenerLocation) {
				const { latitude, longitude } = roundware.listenerLocation;

				// add to search params
				if (latitude && longitude) {
					searchParams.append('latitude', latitude?.toString());
					searchParams.append('longitude', longitude.toString());
				}

				let prefixCharacter = `?`;

				// check previous query params
				const splitted = link.split(`?`);

				if (splitted.length > 1) {
					// need to appen to existing
					prefixCharacter = `&`;
				}

				// final link with location info
				link = link + prefixCharacter + searchParams.toString();
			}
			return {
				link,
				showOptions: !isAssetSelected,
			};
		}
		return {
			link: window.location.toString(),
			showOptions: false,
		};
	}, [includeGeo, isAssetSelected, location, roundware?.listenerLocation, location.search]);
	return (
		<>
			<IconButton onClick={handleShare}>
				<ShareIcon />
			</IconButton>
			{showShareLink && (
				<Modal open={showShareLink} title='Share' onClose={handleCloseShare}>
					<Stack spacing={2}>
						{/* social icons */}
						<Stack direction='row' justifyContent='center' spacing={2}>
							<WhatsappShareButton url={link}>
								<WhatsappIcon round />
							</WhatsappShareButton>
							<EmailShareButton url={link}>
								<EmailIcon round />
							</EmailShareButton>
							<TwitterShareButton url={link}>
								<TwitterIcon round />
							</TwitterShareButton>
							<FacebookShareButton url={link}>
								<FacebookIcon round />
							</FacebookShareButton>
						</Stack>

						{/* link */}
						<CopyableText>{link}</CopyableText>

						{/* options */}
						{showOptions && (
							<Stack>
								<FormControlLabel
									control={
										<Checkbox
											checked={includeGeo}
											onChange={(event) => {
												setIncludeGeo(event.target.checked);
											}}
											inputProps={{ 'aria-label': 'controlled' }}
										/>
									}
									label='Include Current Geo Information'
								/>
							</Stack>
						)}
					</Stack>
				</Modal>
			)}
		</>
	);
};

export default ShareLinkButton;
