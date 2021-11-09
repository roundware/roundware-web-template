import React, { useState, useEffect } from 'react';

import { createPortal } from 'react-dom';

import { useGoogleMap } from '@react-google-maps/api';

type MapControlProps = React.PropsWithChildren<{
	position: google.maps.ControlPosition;
}>;

export default function CustomMapControl(props: MapControlProps) {
	const { position, children } = props;

	const map = useGoogleMap();

	const [container] = useState(document.createElement('div'));

	useEffect(() => {
		if (map) map.controls[position].push(container);
	}, [container, map, position]);

	return createPortal(children, container);
}
