import NoSleep from 'nosleep.js';
import React, { useEffect } from 'react';

interface Props {
	children: React.ReactNode;
}

const NoSleepProvider = ({ children }: Props) => {
	useEffect(() => {
		const noSleep = new NoSleep();
		// Enable wake lock.
		// (must be wrapped in a user input event handler e.g. a mouse or touch handler)
		document.addEventListener(
			'click',
			function enableNoSleep() {
				document.removeEventListener('click', enableNoSleep, false);
				noSleep.enable();
			},
			false
		);
		return () => noSleep.disable();
	}, []);
	return <>{children}</>;
};

export default NoSleepProvider;
