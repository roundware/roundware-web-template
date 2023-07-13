import React, { useState } from 'react';

import { InputLabel, MenuItem, FormControl, Select, SelectChangeEvent, Divider, Box, TextFieldProps, TextField, Stack, Snackbar, Alert, SnackbarProps } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useRoundware } from '../../hooks';
import { subDays } from 'date-fns';

function DateFilterMenu() {
	const [dateRange, setDateRange] = useState<string>('');

	const handleChange = (event: SelectChangeEvent) => {
		setDateRange(event.target.value);
		if (event.target.value == 'all') {
			setAfterDateFilter(null);
			setBeforeDateFilter(null);
		} else if (event.target.value !== 'custom') {
			const endDate = subDays(new Date(), Number(event.target.value));
			handleAfterDateChange(endDate);
			handleBeforeDateChange(new Date());
		}
		setSnackbarOpen(true);
	};
	const { roundware, afterDateFilter, setAfterDateFilter, beforeDateFilter, setBeforeDateFilter } = useRoundware();
	const handleAfterDateChange = (date: Date | null, value?: string | null | undefined): void => {
		if (!date) return;
		setAfterDateFilter(date);
		roundware.events?.logEvent(`filter_stream`, {
			data: `afterDate: ${date.toString()}`,
		});
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
		roundware.events?.logEvent(`filter_stream`, {
			data: `beforeDate: ${date.toString()}`,
		});
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

	const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

	const handleSnackbarClose: SnackbarProps[`onClose`] = (event, reason) => {
		if (reason == 'clickaway') return;
		setSnackbarOpen(false);
	};

	return (
		<Box sx={{ width: '100%' }}>
			<FormControl fullWidth>
				<InputLabel>Select Date Range</InputLabel>
				<Select value={dateRange} label='Select Date Range' onChange={handleChange}>
					<MenuItem value={'7'}>Last 7 days</MenuItem>
					<MenuItem value={'30'}>Last 30 days</MenuItem>
					<MenuItem value={'365'}>Last Year</MenuItem>
					<Divider />
					<MenuItem value={'custom'}>Custom Range</MenuItem>
					<Divider />
					<MenuItem value={'all'}>All Dates</MenuItem>
				</Select>
			</FormControl>
			{dateRange == 'custom' && (
				<Stack mt={2} spacing={2}>
					<DatePicker label='Start Date' showToolbar={false} inputFormat='MM/dd/yyyy' renderInput={(props: JSX.IntrinsicAttributes & TextFieldProps) => <TextField label='Start Date' {...props} />} value={afterDateFilter} onChange={handleAfterDateChange} />

					<DatePicker label='End Date' showToolbar={false} inputFormat='MM/dd/yyyy' renderInput={(props: JSX.IntrinsicAttributes & TextFieldProps) => <TextField label='End Date' {...props} />} value={beforeDateFilter} onChange={handleBeforeDateChange} />
				</Stack>
			)}
			<Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
				<Alert elevation={6} variant='filled' severity='success'>
					Success! Filters updated.
				</Alert>
			</Snackbar>
		</Box>
	);
}

export default DateFilterMenu;
