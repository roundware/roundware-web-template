import Grid from '@mui/material/Grid';
import React from 'react';
import { DebounceInput } from 'react-debounce-input';
import { useRoundware } from '../../hooks';
import TagFilterMenu from './TagFilterMenu';

interface AssetFilterPanelProps {
	hidden?: boolean;
}
const AssetFilterPanel = ({ hidden = false }: AssetFilterPanelProps) => {
	const { roundware, userFilter, setUserFilter } = useRoundware();
	if (!roundware.uiConfig || !roundware.uiConfig.listen) {
		return null;
	}
	return (
		<Grid container className={`asset-list--filters ${hidden ? 'hidden' : ''}`} spacing={1}>
			<Grid item xs={12} sm={4} className='tag-filter-field'>
				<label className='tag-filter-field--label'>
					<span className='label-text'>filter by user</span>
					<DebounceInput minLength={2} className='rw-text-filter' value={userFilter} onChange={({ target }) => setUserFilter(target.value)} debounceTimeout={150} />
				</label>
			</Grid>
			{roundware.uiConfig.listen.map((tg: any) => (
				<TagFilterMenu key={tg.group_short_name} tag_group={tg} />
			))}
		</Grid>
	);
};

export default AssetFilterPanel;
