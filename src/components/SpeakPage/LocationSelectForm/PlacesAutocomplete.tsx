// @ts-nocheck autocomplete values didn't matched to the code
import React, { useEffect, useMemo, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/lab/Autocomplete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/material/styles';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';
import { useRoundwareDraft } from '../../../hooks';

const autocompleteService = { current: null };

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		margin: '20px 0',
		[theme.breakpoints.down(350)]: {
			marginBottom: theme.spacing(0),
			marginTop: theme.spacing(1),
		},
	},
	icon: {
		color: theme.palette.text.secondary,
		marginRight: theme.spacing(2),
	},
}));

const PlacesAutocomplete = () => {
	const classes = useStyles();
	const draftRecording = useRoundwareDraft();
	const [value, setValue] = useState(null);
	const [inputValue, setInputValue] = useState('');
	const [options, setOptions] = useState([]);
	const loaded = useRef(false);
	const geocoder = new google.maps.Geocoder();

	const fetch = useMemo(
		() =>
			throttle((request, callback) => {
				autocompleteService.current.getPlacePredictions(request, callback);
			}, 200),
		[]
	);

	useEffect(() => {
		let active = true;

		if (!autocompleteService.current && window.google) {
			autocompleteService.current = new window.google.maps.places.AutocompleteService();
		}
		if (!autocompleteService.current) {
			return undefined;
		}

		if (inputValue === '') {
			setOptions(value ? [value] : []);
			return undefined;
		}

		fetch({ input: inputValue }, (results) => {
			if (active) {
				let newOptions = [];
				if (value) {
					newOptions = [value];
				}
				if (results) {
					newOptions = [...newOptions, ...results];
				}
				setOptions(newOptions);
			}
		});

		return () => {
			active = false;
		};
	}, [value, inputValue, fetch]);

	return (
		<Autocomplete
			id='places-autocomplete'
			className={classes.root}
			getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
			filterOptions={(x) => x}
			options={options}
			autoComplete
			includeInputInList
			filterSelectedOptions
			value={value}
			onChange={(event, newValue) => {
				setOptions(newValue ? [newValue, ...options] : options);
				setValue(newValue);
				geocoder.geocode({ placeId: newValue.place_id }, (results, status) => {
					if (status === 'OK') {
						if (results[0]) {
							draftRecording.setLocation({
								latitude: results[0].geometry.location.lat(),
								longitude: results[0].geometry.location.lng(),
							});
						} else {
							window.alert('No results found');
						}
					} else {
						window.alert('Geocoder failed due to: ' + status);
					}
				});
			}}
			onInputChange={(event, newInputValue) => {
				setInputValue(newInputValue);
			}}
			renderInput={(params) => <TextField {...params} label='Type to select a location' variant='outlined' fullWidth />}
			renderOption={(option) => {
				const matches = option.structured_formatting.main_text_matched_substrings;
				const parts = parse(
					option.structured_formatting.main_text,
					matches.map((match) => [match.offset, match.offset + match.length])
				);

				return (
					<Grid container alignItems='center'>
						<Grid item>
							<LocationOnIcon className={classes.icon} />
						</Grid>
						<Grid item xs>
							{parts.map((part, index) => (
								<span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
									{part.text}
								</span>
							))}
							<Typography variant='body2' color='textSecondary'>
								{option.structured_formatting.secondary_text}
							</Typography>
						</Grid>
					</Grid>
				);
			}}
		/>
	);
};

export default PlacesAutocomplete;
