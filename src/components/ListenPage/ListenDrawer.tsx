import { Close } from '@mui/icons-material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Box, Divider, IconButton, Stack, Tab, Tabs, Theme, useMediaQuery } from '@mui/material';

import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import { useUIContext } from 'context/UIContext';

import 'date-fns';
import React, { useState } from 'react';
import { useRoundware } from '../../hooks';
import Filters from './Filters';
import ListenHistory from './ListenHistory';

const ListenDrawer = () => {
	const { roundware } = useRoundware();

	const { drawerOpen: open, setDrawerOpen: setOpen } = useUIContext();

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};
	const toggle = () => setOpen(!open);

	const [selectedTab, setSelectedTab] = useState('filters');
	const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'));
	if (!(roundware.uiConfig && roundware.uiConfig.listen)) {
		return null;
	}
	return (
		<React.Fragment key={'drawer'}>
			<IconButton onClick={toggle}>
				<FilterListIcon fontSize='large' />
			</IconButton>
			<Drawer
				anchor={'right'}
				open={open}
				onClose={handleDrawerClose}
				variant={isDesktop ? 'persistent' : 'temporary'}
				sx={{
					width: 350,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: 350,
						boxSizing: 'border-box',
					},
					position: 'absolute',
				}}
			>
				<Box>
					<Stack direction='row' p={1} pb={0} spacing={1} alignItems='center'>
						<IconButton
							sx={{
								mt: 1,
							}}
							onClick={handleDrawerClose}
						>
							<Close />
						</IconButton>
						<Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} variant='fullWidth'>
							<Tab label='Filters' value='filters' />
							<Tab label='History' value='history' />
						</Tabs>
					</Stack>

					{selectedTab === 'filters' && <Filters />}
					{selectedTab === 'history' && <ListenHistory />}
				</Box>
			</Drawer>
		</React.Fragment>
	);
};

export default ListenDrawer;
