import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { useGoogleMap } from '@react-google-maps/api';
import CopyableText from 'components/elements/CopyableText';
import Modal from 'components/elements/Modal';
import { useUIContext } from 'context/UIContext';
import { URLContext } from 'context/URLContext';
import { useRoundware } from 'hooks';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { EmailIcon, EmailShareButton, FacebookIcon, FacebookShareButton, TwitterIcon, TwitterShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
type Props = {};

const ShareDialog = (props: Props) => {
	const { params } = React.useContext(URLContext);
	const { showShare, handleCloseShare } = useUIContext();
	const { roundware, selectedAsset } = useRoundware();

	const location = useLocation();
	const useMapContext = window.location.pathname == `/listen` ? useGoogleMap : () => null;
	const [includeGeo, setIncludeGeo] = useState(false);
	const isAssetSelected = useMemo(() => params.has('aid') || params.has('eid'), [params, location]);
	const map = useMapContext();
	const { link, showOptions } = useMemo(() => {
		const searchParams = new URLSearchParams();

		// when on listen page need show options
		if (window.location.pathname == '/listen') {
			// get current url
			let link = window.location.toString();

			// asked to include geo information and asset not any asset selected
			if (includeGeo && !isAssetSelected && roundware) {
				const center = map?.getCenter();

				// add to search params
				if (center) {
					searchParams.append('latitude', center.lat().toString());
					searchParams.append('longitude', center.lng().toString());
				}

				const zoom = map?.getZoom();
				if (zoom) {
					searchParams.append('zoom', zoom.toString());
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
	}, [includeGeo, isAssetSelected, location, roundware?.listenerLocation, location.search, map?.getZoom(), map?.getCenter()]);

	const message = roundware?.project?.data?.sharing_message + ' \n' + link;

	useEffect(() => {
		if (!showShare) return;
		roundware.events?.logEvent(`share_map`, {
			data: `url: ${link}`,
		});
	}, [showShare, link]);
	return (
		<Modal open={showShare} title='Share' onClose={handleCloseShare}>
			<Stack spacing={2}>
				{/* social icons */}
				<Stack direction='row' justifyContent='center' spacing={2}>
					<WhatsappShareButton url={message}>
						<WhatsappIcon round />
					</WhatsappShareButton>
					<EmailShareButton url={message}>
						<EmailIcon round />
					</EmailShareButton>
					<TwitterShareButton url={message}>
						<TwitterIcon round />
					</TwitterShareButton>
					<FacebookShareButton url={message}>
						<FacebookIcon round />
					</FacebookShareButton>
				</Stack>

				{/* link */}
				<CopyableText>{message}</CopyableText>

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
	);
};

export default ShareDialog;
