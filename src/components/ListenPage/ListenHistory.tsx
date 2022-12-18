import { AccessTime, LocationOnOutlined } from '@mui/icons-material';
import { Button, Card, CardActions, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import config from 'config';
import { useRoundware } from 'hooks';
import { sortBy, uniqBy } from 'lodash';
import moment from 'moment';
import AssetInfoCard from './Map/AssetLayer/AssetInfoCard';
const ListenHistory = () => {
	const { roundware, selectAsset, forceUpdate } = useRoundware();
	const { assets } = roundware.listenHistory;

	return (
		<Stack spacing={2} p={2}>
			{uniqBy(
				sortBy(
					assets.filter((a) => a.id),
					'addedAt'
				),
				'id'
			)
				.reverse()
				.map((asset) => {
					return (
						<Card key={asset.id}>
							<CardHeader
								subheader={
									<Stack spacing={1} direction='row' alignItems={'center'}>
										<AccessTime fontSize='small' /> <Typography variant='subtitle2'>{moment(asset.addedAt).format('h:mm:ss A MMMM Do YYYY')}</Typography>
									</Stack>
								}
							/>
							<CardContent>
								<AssetInfoCard asset={asset} roundware={roundware} order={config.ui.listenSidebar.playlist.available} />
							</CardContent>
							<CardActions>
								<Button
									onClick={() => {
										selectAsset(asset);
										forceUpdate();
									}}
									variant='outlined'
									startIcon={<LocationOnOutlined />}
								>
									Show on Map
								</Button>
							</CardActions>
						</Card>
					);
				})}
		</Stack>
	);
};

export default ListenHistory;
