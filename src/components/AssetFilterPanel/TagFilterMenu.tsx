import { Grid, Snackbar, SnackbarProps, TextField, AlertProps, Alert } from '@mui/material';
import Autocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import React, { useState } from 'react';
import { ITag, ITagGroup } from 'roundware-web-framework/dist/types';
import { useRoundware } from '../../hooks';
import useStyles from './styles';

interface TagFilterMenuProps {
	tag_group: ITagGroup;
}
const TagFilterMenu = ({ tag_group }: TagFilterMenuProps) => {
	const classes = useStyles();
	const { roundware, selectTags, selectedTags } = useRoundware();
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const handleSnackbarClose: SnackbarProps[`onClose`] = (event, reason) => {
		if (reason == 'clickaway') return;
		setSnackbarOpen(false);
	};

	const handleChange = (
		event: React.SyntheticEvent<Element, Event>,
		value: (
			| string
			| {
					value: number;
					label: string;
			  }
		)[]
	) => {
		const tag_ids = value ? value.flatMap((t) => (typeof t != 'string' ? [t.value] : [])) : null;

		selectTags(tag_ids, tag_group);

		if (!roundware?.mixer) {
			return;
		} else {
			const trackIds = Object.keys(roundware.mixer.playlist?.trackIdMap || {}).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
		}
		setSnackbarOpen(true);
	};

	const options = tag_group.display_items.map(({ tag_id, tag_display_text }: ITag) => {
		return {
			value: tag_id,
			label: tag_display_text,
		};
	});

	const fieldId = `roundware-tag-${tag_group?.header_display_text}`;

	const selectedTagGroupTags = (tag_group && tag_group.group_short_name && selectedTags && selectedTags[tag_group.group_short_name]) || [];

	return (
		<>
			<Grid item xs={12} className={`tag-filter-field tag-filter-select`}>
				<label className='tag-filter-field--label'>
					<Autocomplete multiple freeSolo id={tag_group?.group_short_name} classes={classes} options={options} getOptionLabel={(option) => (typeof option != 'string' ? option?.label : '')} onChange={handleChange} isOptionEqualToValue={(option) => selectedTagGroupTags?.indexOf(option.value) !== -1} value={options.filter((o: { value: number }) => selectedTagGroupTags.indexOf(o.value) !== -1)} renderInput={(params: AutocompleteRenderInputParams) => <TextField {...params} variant='standard' label={tag_group.header_display_text} placeholder='Select one or more...' />} />
				</label>
			</Grid>
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				<Alert elevation={6} variant='filled' severity='success'>
					Success! Filters updated.
				</Alert>
			</Snackbar>
		</>
	);
};

export default TagFilterMenu;
