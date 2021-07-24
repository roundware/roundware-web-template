import { MenuProps, withStyles } from '@material-ui/core';
import { Menu, MenuItem } from 'material-ui';

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
	root: {
		'&:focus': {
			backgroundColor: theme.palette.primary.main,
			'& .MuiListItemIcon-root, & .MuiListItemText-primary': {
				color: theme.palette.common.white,
			},
		},
	},
}))(MenuItem);
