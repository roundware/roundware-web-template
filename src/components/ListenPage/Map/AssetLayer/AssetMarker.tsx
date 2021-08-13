import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import { makeStyles, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { InfoWindow, Marker } from '@react-google-maps/api';
import { Clusterer } from '@react-google-maps/marker-clusterer';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Roundware } from 'roundware-web-framework';
import { IAssetData } from 'roundware-web-framework/dist/types';
import { OverlappingMarkerSpiderfier } from 'ts-overlapping-marker-spiderfier';
import { IRoundwareContext } from '../../../../context/RoundwareContext';
import { useRoundware } from '../../../../hooks';
import { lightTheme } from '../../../../styles';
import { IImageAsset } from '../../../../types';
import AssetPlayer from '../../../AssetPlayer';
import { TagsDisplay } from '../../../AssetTags';
import { AssetActionButtons } from './AssetActionButtons';

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

const AssetInfoWindow = ({ asset }: { asset: IAssetData }) => {
	const { selectedAsset, selectAsset, roundware } = useRoundware();

	if (!selectedAsset) return null;
	if (selectedAsset.id !== asset.id) {
		return null;
	}
	return <AssetInfoWindowInner asset={selectedAsset} selectAsset={selectAsset} roundware={roundware} />;
};

interface AssetInfoWindowInnerProps {
	asset: IAssetData;
	selectAsset: IRoundwareContext[`selectAsset`];
	roundware: Roundware;
}
const AssetInfoWindowInner = ({ asset, selectAsset, roundware }: AssetInfoWindowInnerProps) => {
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
					<Paper>
						<Typography variant='body2'>{moment(asset.created).format('LLL')}</Typography>
						<TagsDisplay tagIds={Array.isArray(asset.tag_ids) ? asset.tag_ids : []} />
						{primaryImageUrl ? <LightboxModal imageUrl={primaryImageUrl} /> : null}
						{primaryTextUrl ? <TextDisplay textUrl={primaryTextUrl} /> : null}
						<AssetPlayer style={{ width: '100%', marginTop: 10 }} asset={asset} />
						<AssetActionButtons asset={asset} />
					</Paper>
				</Grid>
			</MuiThemeProvider>
		</InfoWindow>
	);
};

interface AssetMarkerProps {
	asset: IAssetData;
	clusterer: Clusterer;
	oms: OverlappingMarkerSpiderfier;
}
const AssetMarker = ({ asset, clusterer, oms }: AssetMarkerProps) => {
	const { selectAsset } = useRoundware();
	const iconPin = {
		url: 'https://fonts.gstatic.com/s/i/materialicons/place/v15/24px.svg',
		scaledSize: new google.maps.Size(20, 20),
	};

	return (
		<Marker
			position={{ lat: asset.latitude!, lng: asset.longitude! }}
			icon={iconPin}
			clusterer={clusterer}
			onLoad={(m) => {
				//@ts-ignore
				m.asset = asset;
				oms.addMarker(m, () => selectAsset(asset));
			}}
			noClustererRedraw={true}
		>
			<AssetInfoWindow asset={asset} />
		</Marker>
	);
};

export default AssetMarker;
