import { AccessTime } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { useRoundware } from 'hooks';
import moment from 'moment';
import React from 'react';
import AssetInfoCard from './Map/AssetLayer/AssetInfoCard';

const ListenHistory = () => {
	const { roundware } = useRoundware();
	const { assets } = roundware.listenHistory;
	console.log(assets);
	return (
		<Stack spacing={2} p={2}>
			{assets
				.filter((a) => a.id)
				.sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0))
				.map((asset) => {
					return (
						<Card key={asset.id}>
							<CardHeader
								// title={)}
								subheader={
									<Stack spacing={1} direction='row' alignItems={'center'}>
										<AccessTime fontSize='small' /> <Typography variant='subtitle2'>{moment(asset.addedAt).format('h:mm A MMMM Do YYYY')}</Typography>
									</Stack>
								}
							/>
							<CardContent>
								<AssetInfoCard asset={asset} roundware={roundware} />
							</CardContent>
						</Card>
					);
				})}
		</Stack>
	);
};

export default ListenHistory;
