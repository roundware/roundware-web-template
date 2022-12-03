import React from 'react';
import { MenuProps } from '@mui/material';
import { Menu, MenuItem } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
export const StyledMenu = withStyles({
	paper: {
		border: '1px solid #d3d4d5',
	},
})(
	(props: MenuProps | any): JSX.Element => (
		<Menu
			elevation={0}
			getContentAnchorEl={null}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
			{...props}
		/>
	)
);

export const StyledMenuItem = withStyles((theme) => ({
	// root: {
	// 	'&:focus': {
	// 		backgroundColor: theme.palette.primary.§,
	// 		'& .MuiListItemIcon-root, & .MuiListItemText-primary': {
	// 			color: theme.palette.common.white,
	// 		},
	// 	},
	// 	color: theme.palette.common.black,
	// },
}))(MenuItem);
