import { Box, SxProps, Theme } from '@mui/material';
import React from 'react';
import { defaultTheme } from 'styles';
const commonStyles: SxProps<Theme> = {
	background: defaultTheme.palette.primary.dark,
	transform: `translate(-50%, -50%)`,
	position: 'absolute',
	top: '50%',
	left: '50%',
};
const thickess = '2px';
const length = '50px';
const Crosshair = () => {
	return (
		<>
			{/* horizontal */}
			<Box
				sx={(t) => ({
					...commonStyles,
					height: length,
					width: thickess,
				})}
			/>

			<Box
				sx={(t) => ({
					...commonStyles,
					height: thickess,
					width: length,
				})}
			/>
		</>
	);
};

export default Crosshair;
