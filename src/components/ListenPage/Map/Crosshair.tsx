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
const thickness = '1px';
const length = '30px';
const Crosshair = () => {
	return (
		<>
			{/* horizontal */}
			<Box
				sx={(t) => ({
					...commonStyles,
					height: length,
					width: thickness,
				})}
			/>

			<Box
				sx={(t) => ({
					...commonStyles,
					height: thickness,
					width: length,
				})}
			/>
		</>
	);
};

export default Crosshair;
