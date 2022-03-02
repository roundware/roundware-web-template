import FilterListIcon from '@mui/icons-material/FilterList';
import LabelIcon from '@mui/icons-material/Label';
import DatePicker from '@mui/lab/DatePicker';
import { TextField, TextFieldProps } from '@mui/material';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import config from 'config.json';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import 'date-fns';
import React, { useState } from 'react';
import { useRoundware } from '../../hooks';
import DateFilterMenu from '../AssetFilterPanel/DateFilterMenu';
import TagFilterMenu from '../AssetFilterPanel/TagFilterMenu';

const useStyles = makeStyles((theme) => ({
	list: {
		width: 300,
		[theme.breakpoints.down('sm')]: {
			width: 250,
		},
	},
	fullList: {
		width: 'auto',
	},
}));

const ListenFilterDrawer = () => {
	const classes = useStyles();

	const [state, setState] = useState<{ top: boolean; left: boolean; bottom: boolean; right: boolean; filter?: string }>({
		top: false,
		left: false,
		bottom: false,
		right: false,
	});

	const { roundware, afterDateFilter, setAfterDateFilter, beforeDateFilter, setBeforeDateFilter, setDescriptionFilter, descriptionFilter } = useRoundware();
	if (!(roundware.uiConfig && roundware.uiConfig.listen)) {
		return null;
	}

	const toggleDrawer = (anchor: string, open: boolean) => (event?: any) => {
		if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
			return;
		}
		setState({ ...state, [anchor]: open });
	};

	const handleOnDescriptionChange: TextFieldProps[`onChange`] = (e) => {
		setDescriptionFilter(e.target.value);
		if (e.target.value.length > 3) {
			roundware.events?.logEvent(`filter_stream`, {
				data: `description: ${e.target.value}`,
			});
		}
	};

	const availableFilters = config.AVAILABLE_LISTEN_FILTERS || [];

	const filterLookup: {
		[index: string]: JSX.Element;
	} = {
		date: (
			<ListItem>
				<DateFilterMenu />
			</ListItem>
		),
		tags: (
			<>
				<ListItem key='tags-header'>
					<ListItemIcon>
						<LabelIcon />
					</ListItemIcon>
					<ListItemText primary='Filter by Tags' />
				</ListItem>
				{roundware &&
					roundware.uiConfig &&
					Array.isArray(roundware.uiConfig.listen) &&
					roundware.uiConfig.listen.map((tg) => (
						<ListItem key={'list-item' + tg.group_short_name}>
							<TagFilterMenu key={tg.group_short_name} tag_group={tg} />
						</ListItem>
					))}
			</>
		),
		description: (
			<>
				<ListItem>
					<ListItemText>Description Filter</ListItemText>
				</ListItem>
				<ListItem>
					<TextField rows={2} multiline fullWidth placeholder='Type something...' onChange={handleOnDescriptionChange} value={descriptionFilter || ''} />
				</ListItem>
			</>
		),
	};

	const list = (anchor: string) => (
		<div
			className={clsx(classes.list, {
				[classes.fullList]: anchor === 'top' || anchor === 'bottom',
			})}
			role='presentation'
			onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<List>
				<ListItem>
					<Typography variant={'subtitle1'}>Filter Recordings</Typography>
				</ListItem>
			</List>
			<Divider />
			<List>
				{availableFilters.map((f) => (
					<>
						{filterLookup[f]}
						<Divider />
					</>
				))}
			</List>
		</div>
	);

	return (
		<>
			<React.Fragment key={'filter'}>
				<Button onClick={toggleDrawer('filter', true)}>
					<FilterListIcon fontSize='large' />
				</Button>
				<Drawer
					anchor={'right'}
					open={Boolean(state['filter'])}
					onClose={toggleDrawer('filter', false)}
					ModalProps={{
						keepMounted: true,
					}}
				>
					{list('right')}
				</Drawer>
			</React.Fragment>
		</>
	);
};

export default ListenFilterDrawer;
