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
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import 'date-fns';
import React, { useState } from 'react';
import { useRoundware } from '../../hooks';
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

	const { roundware, afterDateFilter, setAfterDateFilter, beforeDateFilter, setBeforeDateFilter } = useRoundware();
	if (!(roundware.uiConfig && roundware.uiConfig.listen)) {
		return null;
	}

	const handleAfterDateChange = (date: Date | null, value?: string | null | undefined): void => {
		if (!date) return;
		setAfterDateFilter(date);

		if (!roundware.mixer) {
			return;
		} else {
			roundware.mixer.updateParams({
				startDate: date,
			});
			const trackIds = Object.keys(roundware?.mixer?.playlist?.trackIdMap || {}).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
		}
	};

	const handleBeforeDateChange = (date: Date | null, value?: string | null | undefined) => {
		if (!date) return;
		setBeforeDateFilter(date);
		if (!roundware.mixer) {
			return;
		} else {
			roundware.mixer.updateParams({
				endDate: date,
			});
			const trackIds = Object.keys(roundware?.mixer?.playlist?.trackIdMap || {}).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
		}
	};

	const toggleDrawer = (anchor: string, open: boolean) => (event?: any) => {
		if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
			return;
		}
		setState({ ...state, [anchor]: open });
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
				<ListItem>
					<DatePicker label='Start Date' showToolbar={false} inputFormat='MM/dd/yyyy' renderInput={(props: JSX.IntrinsicAttributes & TextFieldProps) => <TextField label='Start Date' {...props} />} value={afterDateFilter} onChange={handleAfterDateChange} />
				</ListItem>
				<ListItem>
					<DatePicker label='End Date' showToolbar={false} inputFormat='MM/dd/yyyy' renderInput={(props: JSX.IntrinsicAttributes & TextFieldProps) => <TextField label='End Date' {...props} />} value={beforeDateFilter} onChange={handleBeforeDateChange} />
				</ListItem>
				<Divider />
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
			</List>
		</div>
	);

	return (
		<>
			<React.Fragment key={'filter'}>
				<Button onClick={toggleDrawer('filter', true)}>
					<FilterListIcon fontSize='large' />
				</Button>
				<Drawer anchor={'right'} open={Boolean(state['filter'])} onClose={toggleDrawer('filter', false)}>
					{list('right')}
				</Drawer>
			</React.Fragment>
		</>
	);
};

export default ListenFilterDrawer;
