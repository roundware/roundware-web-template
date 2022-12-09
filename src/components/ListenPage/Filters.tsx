import LabelIcon from '@mui/icons-material/Label';
import { CircularProgress, Divider, Grid, InputAdornment, List, ListItem, ListItemIcon, ListItemText, TextField, TextFieldProps, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import DateFilterMenu from 'components/AssetFilterPanel/DateFilterMenu';
import TagFilterMenu from 'components/AssetFilterPanel/TagFilterMenu';
import config from 'config';
import { useRoundware } from 'hooks';
import useDebounce from 'hooks/useDebounce';
import React, { useEffect } from 'react';

const Filters = () => {
	const { roundware, setDescriptionFilter, descriptionFilter } = useRoundware();

	const debouncedDF = useDebounce(descriptionFilter, 2500);
	useEffect(() => {
		if (debouncedDF)
			roundware.events?.logEvent(`filter_stream`, {
				data: `description: ${debouncedDF}`,
			});
	}, [debouncedDF]);

	const handleOnDescriptionChange: TextFieldProps[`onChange`] = (e) => {
		setDescriptionFilter(e.target.value);
	};

	const availableFilters = config.ui.listenSidebar.filter.available || [];
	const endAdornment =
		descriptionFilter && debouncedDF != descriptionFilter ? (
			<InputAdornment position='end'>
				<CircularProgress size={16} />
			</InputAdornment>
		) : undefined;
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
							<Grid container>
								<TagFilterMenu key={tg.group_short_name} tag_group={tg} />
							</Grid>
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
					<TextField
						rows={2}
						multiline
						fullWidth
						placeholder='Type something...'
						onChange={handleOnDescriptionChange}
						value={descriptionFilter || ''}
						InputProps={{
							endAdornment,
						}}
					/>
				</ListItem>
			</>
		),
	};

	return (
		<div role='presentation'>
			<List>
				<ListItem>
					<Typography variant={'subtitle1'}>Filter Recordings</Typography>
				</ListItem>
			</List>
			<Divider />
			<List>
				{availableFilters.map((f) => (
					<React.Fragment key={f.toString()}>
						{filterLookup[f]}
						<Divider />
					</React.Fragment>
				))}
			</List>
		</div>
	);
};

export default Filters;
