import { AccessTime } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Collapse, Slide, Stack, Typography } from '@mui/material';
import { useRoundware } from 'hooks';
import { sortBy } from 'lodash';
import moment from 'moment';
import React from 'react';
import AssetInfoCard from './Map/AssetLayer/AssetInfoCard';

const ListenHistory = () => {
	const { roundware } = useRoundware();
	const { assets } = roundware.listenHistory;

	return (
		<Stack spacing={2} p={2}>
			{sortBy(
				assets.filter((a) => a.id),
				'addedAt'
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
								<AssetInfoCard asset={asset} roundware={roundware} />
							</CardContent>
						</Card>
					);
				})}
		</Stack>
	);
};

export default ListenHistory;
