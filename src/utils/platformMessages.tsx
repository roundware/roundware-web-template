import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import { PlatformMessage } from 'components/PlatformMessage';
import { isIOS, isFirefox, isSafari } from 'react-device-detect';

export function getMessageOnLoad(): PlatformMessage | null {
	switch (true) {
		// message
		case isSafari:
			return {
				message: 'You are using Safari. Please use another browser',
			};
		// with custom actions;
		case isFirefox:
			return {
				message: 'Custom actions',

				// any component / string / element
				action: (
					<Button variant='contained' onClick={() => alert(`helo`)}>
						Helo
					</Button>
				),

				// continue anyway button label
				buttonLabel: 'OK',
			};

		// with custom title
		case isFirefox:
			return {
				title: 'Custom title',
				message: 'You are using Firefox. Please use another browser',
			};

		// with custom link and component
		case isIOS:
			return {
				message: (
					<span>
						In order to get the best experience with Glam, we recommend that iOS users download the mobile app:
						<Link href='https://appstore.com'>appstore.com</Link>
					</span>
				),
			};

		default:
			return null;
	}
}
