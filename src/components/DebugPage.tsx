import Dialog from '@material-ui/core/Dialog';
import React from 'react';
import LegalAgreementForm from './LegalAgreementForm';

const DebugPage = () => {
	return (
		<Dialog open={true}>
			<LegalAgreementForm
				onAccept={(e) => {
					debugger;
				}}
				onDecline={(e) => {
					debugger;
				}}
			/>
		</Dialog>
	);
};

export default DebugPage;
