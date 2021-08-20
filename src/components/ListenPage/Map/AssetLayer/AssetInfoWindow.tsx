import { Divider, Grid, makeStyles, Modal, MuiThemeProvider, Paper, Typography } from '@material-ui/core';
import { InfoWindow } from '@react-google-maps/api';
import moment from 'moment';
import React, { useEffect, useState, useContext } from 'react';
import { Roundware } from 'roundware-web-framework';
import { IAssetData } from 'roundware-web-framework/dist/types';
import { IRoundwareContext } from '../../../../context/RoundwareContext';
import { UiConfigContext } from '../../../../context/UIContext';
import { lightTheme } from '../../../../styles';
import { IImageAsset } from '../../../../types';
import AssetPlayer from '../../../AssetPlayer';
import { TagsDisplay } from '../../../AssetTags';
import { AssetActionButtons } from './AssetActionButtons';

interface AssetInfoWindowInnerProps {
	asset: IAssetData;
	selectAsset: IRoundwareContext[`selectAsset`];
	roundware: Roundware;
}

export const AssetInfoWindowInner = ({ asset, selectAsset, roundware }: AssetInfoWindowInnerProps) => {
	const [imageAssets, setImageAssets] = useState<IImageAsset[]>([]);
	const [textAssets, setTextAssets] = useState<IAssetData[]>([]);

	useEffect(() => {
		if (Array.isArray(asset?.envelope_ids) && asset?.envelope_ids?.length > 0) {
			roundware
				.getAssets({
					media_type: 'photo',
					envelope_id: asset?.envelope_ids[0],
				})
				.then(setImageAssets);
		}
	}, [asset]);

	useEffect(() => {
		if (Array.isArray(asset?.envelope_ids) && asset?.envelope_ids?.length > 0) {
			roundware
				.getAssets({
					media_type: 'text',
					envelope_id: asset.envelope_ids[0],
				})
				.then(setTextAssets);
		}
	}, [asset]);

	const primaryImageUrl = imageAssets && imageAssets[0]?.file;
	const primaryTextUrl = textAssets && textAssets[0]?.file;

	const position = { lat: asset.latitude!, lng: asset.longitude! };

	const infoItemsResolver = (elementName: string) => {
		switch (elementName) {
			case 'date':
				return (
					<Typography key={elementName} variant='body2'>
						{moment(asset.created).format('LLL')}
					</Typography>
				);

			case 'tags':
				return <TagsDisplay key={elementName} tagIds={Array.isArray(asset.tag_ids) ? asset.tag_ids : []} />;
			case 'description':
				if (asset?.description && asset?.description.length > 0)
					return (
						<div key={elementName}>
							{/* <Divider style={{ marginTop: 5, marginBottom: 5 }} /> */}
							{/* Example of asset description - eid=6328 */}
							<Typography variant='caption'>Description:</Typography>
							<Typography variant='subtitle2' style={{ fontSize: 13 }}>
								{asset.description}
							</Typography>
						</div>
					);
				return null;

			case 'photo':
				return primaryImageUrl ? <LightboxModal key={elementName} imageUrl={primaryImageUrl} /> : null;

			case 'text':
				return primaryTextUrl ? <TextDisplay key={elementName} textUrl={primaryTextUrl} /> : null;

			case 'audio':
				return <AssetPlayer key={elementName} style={{ width: '100%', marginTop: 10 }} asset={asset} />;
			case 'actions':
				return <AssetActionButtons key={elementName} asset={asset} />;
			default:
				return null;
		}
	};

	const { infoWindowOrder } = useContext(UiConfigContext);

	return (
		<InfoWindow
			options={{
				disableAutoPan: false,
				pixelOffset: new google.maps.Size(0, -30),
				maxWidth: 320,
			}}
			position={position}
			onCloseClick={() => selectAsset(null)}
		>
			<MuiThemeProvider theme={lightTheme}>
				<Grid container direction={'column'}>
					<Paper>{infoWindowOrder.map((item) => infoItemsResolver(item))}</Paper>
				</Grid>
			</MuiThemeProvider>
		</InfoWindow>
	);
};

const LightboxModal = ({ imageUrl }: { imageUrl: string }) => {
	const classes = useStyles();
	const [open, setOpen] = useState(false);

	const handleOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<div>
			<img src={imageUrl} width='150px' onClick={handleOpen} />
			<Modal open={open} onClose={handleClose}>
				<img src={imageUrl} className={classes.paper} />
			</Modal>
		</div>
	);
};
const TextDisplay = ({ textUrl }: { textUrl: string }) => {
	const [storedText, setStoredText] = useState<string>('');

	useEffect(() => {
		fetch(textUrl).then(function (response) {
			response.text().then(function (text) {
				setStoredText(text);
			});
		});
	}, []);

	return <div>{storedText}</div>;
};

const useStyles = makeStyles((theme) => ({
	paper: {
		position: 'absolute',
		height: 'auto',
		width: 'auto',
		maxHeight: '90%',
		maxWidth: '90%',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		outline: 0,
		minWidth: 300,
	},
}));