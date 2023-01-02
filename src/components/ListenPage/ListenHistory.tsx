import { AccessTime, ChevronRight, LocationOnOutlined } from '@mui/icons-material';
import LocationOn from '@mui/icons-material/LocationOn';
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, IconButton, Stack, Typography } from '@mui/material';
import config from 'config';
import { useRoundware } from 'hooks';
import { sortBy, uniqBy } from 'lodash';
import moment from 'moment';
import { useState } from 'react';
import AssetInfoCard from './Map/AssetLayer/AssetInfoCard';
const ListenHistory = () => {
	const { roundware, selectAsset, forceUpdate, selectedAsset } = useRoundware();
	const { assets } = roundware.listenHistory;

	const [collapsedItems, setCollapsedItems] = useState<number[]>([]);

	const toggleCollapse = (id: number) => {
		setCollapsedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
	};

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
									<Stack
										spacing={1}
										direction='row'
										alignItems={'center'}
										onClick={() => {
											toggleCollapse(asset.id);
										}}
										sx={{
											cursor: 'pointer',
										}}
									>
										<ChevronRight
											sx={{
												transform: collapsedItems.includes(asset.id) ? 'rotate(90deg)' : 'rotate(0deg)',
											}}
										/>

										<Typography variant='subtitle2'>{moment(asset.addedAt).format('h:mm:ss A MMMM Do YYYY')}</Typography>
									</Stack>
								}
							/>

							<Collapse in={collapsedItems.includes(asset.id)}>
								<CardContent>
									<AssetInfoCard
										asset={asset}
										roundware={roundware}
										order={config.ui.listenSidebar.history.available}
										actions={
											<IconButton
												title='Show on Map'
												onClick={() => {
													selectAsset(asset);
													forceUpdate();
												}}
											>
												{selectedAsset?.id == asset.id ? <LocationOn /> : <LocationOnOutlined />}
											</IconButton>
										}
									/>
								</CardContent>
							</Collapse>
						</Card>
					);
				})}
		</Stack>
	);
};

export default ListenHistory;
