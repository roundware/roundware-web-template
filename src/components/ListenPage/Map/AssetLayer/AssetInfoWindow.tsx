import { Card, CardContent, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { InfoWindow } from '@react-google-maps/api';
import { Roundware } from 'roundware-web-framework';
import { IAssetData } from 'roundware-web-framework/dist/types/asset';
import { IRoundwareContext } from '../../../../context/RoundwareContext';
import { lightTheme } from '../../../../styles';
import AssetInfoCard from './AssetInfoCard';
interface AssetInfoWindowInnerProps {
	asset: IAssetData;
	selectAsset: IRoundwareContext[`selectAsset`];
	roundware: Roundware;
}

export const AssetInfoWindowInner = ({ asset, selectAsset, roundware }: AssetInfoWindowInnerProps) => {
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
			<StyledEngineProvider injectFirst>
				<ThemeProvider theme={lightTheme}>
					<Card>
						<AssetInfoCard asset={asset} roundware={roundware} />
					</Card>
				</ThemeProvider>
			</StyledEngineProvider>
		</InfoWindow>
	);
};
