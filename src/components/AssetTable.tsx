import { useRoundware } from '../hooks';
import React from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { TagsDisplay } from './AssetTags';
import TableBody from '@material-ui/core/TableBody';
import moment from 'moment';
import TablePagination from '@material-ui/core/TablePagination';
import AssetFilterPanel from './AssetFilterPanel';
import TableSortLabel from '@material-ui/core/TableSortLabel';

const AssetTable = () => {
	const { selectAsset, selectedAsset, assetPage, assetsPerPage, assetPageIndex, setAssetsPerPage, setAssetPageIndex, setUserFilter, sortField, setSortField } = useRoundware();

	let table_assets = [];

	const handleChangePage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => {
		// setAssetPageIndex(newPage);
	};
	const handleChangeRowsPerPage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, numRows: number) => {
		setAssetsPerPage(numRows);
	};
	return (
		<Paper className={'asset-list'}>
			<AssetFilterPanel />
			<TableContainer>
				<Table stickyHeader size='small' className={'asset-table'} aria-label='media submission table'>
					<TableHead>
						<TableRow>
							<TableCell>Actions</TableCell>
							<TableCell>
								<TableSortLabel
									active={sortField.name === 'created'}
									direction={sortField.asc ? 'asc' : 'desc'}
									onClick={() => {
										setSortField({ name: 'created', asc: !sortField.asc });
									}}
								>
									Created
								</TableSortLabel>
							</TableCell>
							<TableCell>Tags</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{assetPage.map((asset: any) => (
							<TableRow hover selected={Boolean(selectedAsset && asset.id === selectedAsset.id)} tabIndex={-1} key={asset.id}>
								<TableCell align='right' className='rowActions'>
									<button
										onClick={() => {
											selectAsset(asset);
										}}
										title='show recording on map'
									>
										<i className='fa fa-map-pin' />
									</button>
									{asset.user && asset.user.username && (
										<button className={asset.user && asset.user.username ? '' : 'hidden'} title={`see all of ${(asset.user && asset.user.username) || 'anonymous'}'s submissions`} onClick={() => setUserFilter(asset.user && asset.user.username)}>
											<i className='fa fa-user-circle' />
										</button>
									)}
								</TableCell>
								<TableCell component='th' scope='row'>
									{moment(asset.created).format('LLL')}
								</TableCell>
								<TableCell align='right'>
									<TagsDisplay tagIds={asset.tag_ids} />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			{/*{ filteredAssets.length === 0 ? "No Recordings Found..." : null }*/}

			<TablePagination component='div' backIconButtonProps={{ size: 'small' }} nextIconButtonProps={{ size: 'small' }} count={table_assets.length} rowsPerPage={assetsPerPage} page={assetPageIndex} onChangePage={handleChangePage} onPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[5, 10]} />
		</Paper>
	);
};
export default AssetTable;
