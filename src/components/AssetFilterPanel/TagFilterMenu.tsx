import { Grid, SnackbarCloseReason, SnackbarProps, TextField } from '@mui/material';
import Autocomplete, { AutocompleteProps, AutocompleteChangeDetails, AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import React, { useState, useContext } from 'react';
import { useRoundware } from '../../hooks';
import useStyles from './styles';
import MuiAlert, { AlertProps } from '@mui/lab/Alert';
import { Snackbar } from '@mui/material';
import { TextFieldProps } from 'material-ui';
import { ITag, ITagGroup, IUiConfig } from 'roundware-web-framework/dist/types';
import { URLContext } from '../../context/URLContext';

function Alert(props: AlertProps) {
	return <MuiAlert elevation={6} variant='filled' {...props} />;
}
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
		value: {
			value: number;
			label: string;
		}[]
	) => {
		const tag_ids = value ? value.map((t) => t.value) : null;

		selectTags(tag_ids, tag_group);

		if (!roundware?.mixer) {
			return;
		} else {
			const trackIds = Object.keys(roundware.mixer.playlist?.trackIdMap || {}).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware.mixer.skipTrack(audioTrackId));
		}
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
					<Autocomplete multiple id={tag_group?.group_short_name} classes={classes} options={options} getOptionLabel={(option) => (option ? option.label : '')} onChange={handleChange} isOptionEqualToValue={(option) => selectedTagGroupTags?.indexOf(option.value) !== -1} value={options.filter((o: { value: number }) => selectedTagGroupTags.indexOf(o.value) !== -1)} renderInput={(params: AutocompleteRenderInputParams) => <TextField {...params} variant='standard' label={tag_group.header_display_text} placeholder='Select one or more...' />} />
				</label>
			</Grid>
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				<Alert severity='success'>Success! Filters updated.</Alert>
			</Snackbar>
		</>
	);
};

export default TagFilterMenu;
