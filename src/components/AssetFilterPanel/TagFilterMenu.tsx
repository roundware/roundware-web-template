import { Grid } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { useState } from 'react';
import { useRoundware } from '../../hooks';
import useStyles from './styles';

function Alert(props) {
	return <MuiAlert elevation={6} variant='filled' {...props} />;
}
const TagFilterMenu = ({ tag_group }) => {
	const classes = useStyles();
	const { roundware, selectTags, selectedTags } = useRoundware();
	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const handleSnackbarClose = (event, reason) => {
		if (reason === 'clickaway') {
			return;
		}
		setSnackbarOpen(false);
	};

	const handleChange = (evt, value, action, target) => {
		const tag_ids = value ? value.map((t) => t.value) : null;
		selectTags(tag_ids, tag_group);
		setSnackbarOpen(true);
		if (!roundware._mixer) {
			return;
		} else {
			const trackIds = Object.keys(roundware._mixer.playlist.trackIdMap).map((id) => parseInt(id));
			trackIds.forEach((audioTrackId) => roundware._mixer.skipTrack(audioTrackId));
		}
	};

	const options = tag_group.display_items.map(({ tag_id, tag_display_text }) => {
		return {
			value: tag_id,
			label: tag_display_text,
		};
	});

	const fieldId = `roundware-tag-${tag_group.header_display_text}`;

	const selectedTagGroupTags = selectedTags[tag_group.group_short_name] || [];

	return (
		<>
			<Grid item xs={12} className={`tag-filter-field tag-filter-select`}>
				<label className='tag-filter-field--label'>
					<Autocomplete multiple id={tag_group.name} classes={classes} options={options} getOptionLabel={(option) => (option ? option.label : '')} onChange={handleChange} getOptionSelected={(option) => selectedTagGroupTags.indexOf(option.value) !== -1} value={options.filter((o) => selectedTagGroupTags.indexOf(o.value) !== -1)} renderInput={(params) => <TextField {...params} variant='standard' label={tag_group.header_display_text} placeholder='Select one or more...' />}></Autocomplete>
				</label>
			</Grid>
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				<Alert onClose={handleSnackbarClose} severity='success'>
					Success! Filters updated.
				</Alert>
			</Snackbar>
		</>
	);
};

export default TagFilterMenu;
